// src/abuse-guard.js — proteção contra abuso (caso 2)
//
// Três peças, todas server-side (motor no VPS):
//   1. KILL-SWITCH      -> estaSuspenso(client): motor NÃO responde se o cliente está suspenso.
//   2. CLASSIFICADOR IA -> avaliarTexto(...): usa um modelo leve p/ sinalizar golpe/ilegalidade.
//   3. ANOMALIA         -> checarAnomalias(): detecta volume/padrão estranho por SQL (sem IA).
//
// Alertas vão pra tabela public.abuse_alerts (só service_role). 'ilegal' de alta confiança
// pode AUTO-SUSPENDER o cliente (suspended=true) — o corte acontece antes de a Meta pegar.
//
// Env (.env do VPS): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY,
//   ABUSE_MODEL (default abaixo; ajuste p/ o mesmo modelo que o motor já usa),
//   ABUSE_SCORE_MIN (default 0.75), ABUSE_AUTOSUSPEND ("1" liga auto-suspensão em ilegal).

const { createClient } = require("@supabase/supabase-js");

const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const MODEL = process.env.ABUSE_MODEL || "claude-haiku-5-5";
const SCORE_MIN = Number(process.env.ABUSE_SCORE_MIN || 0.75);
const AUTOSUSPEND = process.env.ABUSE_AUTOSUSPEND === "1";

// ---------------------------------------------------------------- KILL-SWITCH
// Recebe o objeto client (que o responder já tem) OU um clientId.
async function estaSuspenso(clientOrId) {
  if (clientOrId && typeof clientOrId === "object") return !!clientOrId.suspended;
  const { data } = await db.from("clients").select("suspended").eq("id", clientOrId).maybeSingle();
  return !!(data && data.suspended);
}

async function suspender(clientId, motivo) {
  await db.from("clients").update({ suspended: true }).eq("id", clientId);
  await registrarAlerta(clientId, {
    tipo: "classificador", severidade: "critico",
    detalhe: "Cliente auto-suspenso: " + motivo,
  });
}

// --------------------------------------------------------------- CLASSIFICADOR
// Classifica um texto no contexto de atendimento. origem: 'config' | 'saida' | 'entrada'.
// Foco principal: 'config' (como o cliente programou a IA) e 'saida' (o que a IA manda).
async function avaliarTexto({ clientId, texto, origem = "saida" }) {
  if (!texto || !texto.trim()) return { flag: "ok", score: 0 };
  let resultado;
  try {
    resultado = await classificar(texto, origem);
  } catch (e) {
    console.error("[abuse] classificar:", e.message);
    return { flag: "erro", score: 0 };
  }
  if (resultado.flag !== "ok" && resultado.score >= SCORE_MIN) {
    await db.from("client_meta_secrets").upsert({
      client_id: clientId, abuse_flag: resultado.flag,
      abuse_checked_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });
    await registrarAlerta(clientId, {
      tipo: "classificador",
      severidade: resultado.flag === "ilegal" ? "critico" : "alerta",
      detalhe: `[${origem}] ${resultado.flag} (${resultado.score}): ${resultado.motivo || ""}`,
      meta: { origem, ...resultado },
    });
    if (AUTOSUSPEND && resultado.flag === "ilegal" && resultado.score >= 0.9) {
      await suspender(clientId, resultado.motivo || "conteúdo ilegal");
    }
  }
  return resultado;
}

async function classificar(texto, origem) {
  const prompt =
    `Você é um filtro de integridade de uma plataforma brasileira de atendimento por WhatsApp. ` +
    `Analise o TEXTO abaixo (origem: ${origem}) e classifique o risco de uso ILÍCITO ou GOLPE ` +
    `(ex.: phishing, falso prêmio/pix, falsa cobrança, se passar por banco/órgão, extorsão, ` +
    `venda de produto ilegal). Atendimento comum de negócio é "ok". ` +
    `Responda SOMENTE um JSON: {"flag":"ok|suspeita_golpe|ilegal","score":0..1,"motivo":"curto"}.\n\n` +
    `TEXTO:\n"""${String(texto).slice(0, 4000)}"""`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `anthropic ${res.status}`);
  const txt = (data.content || []).map((c) => c.text || "").join("").trim();
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) return { flag: "ok", score: 0 };
  const parsed = JSON.parse(m[0]);
  return {
    flag: ["ok", "suspeita_golpe", "ilegal"].includes(parsed.flag) ? parsed.flag : "ok",
    score: Math.max(0, Math.min(1, Number(parsed.score) || 0)),
    motivo: String(parsed.motivo || "").slice(0, 200),
  };
}

// ------------------------------------------------------------------- ANOMALIA
// Roda num timer (ex.: a cada hora). Detecta, por cliente, na janela: volume alto de
// saídas, razão saída/entrada alta e muitos contatos novos — padrões de disparo/spam.
// Thresholds propositalmente conservadores; ajuste conforme a base real cresce.
async function checarAnomalias({ janelaHoras = 1, minSaidas = 200, razaoMax = 3, contatosNovosMax = 150 } = {}) {
  const desde = new Date(Date.now() - janelaHoras * 3600 * 1000).toISOString();
  // Agrega mensagens por cliente na janela (join messages->conversations).
  const { data, error } = await db.rpc("abuse_metricas_janela", { desde });
  if (error) { console.error("[abuse] anomalia rpc:", error.message); return []; }
  const alertas = [];
  for (const r of data || []) {
    const saidas = Number(r.saidas || 0);
    const entradas = Number(r.entradas || 0);
    const contatosNovos = Number(r.contatos_novos || 0);
    const razao = entradas > 0 ? saidas / entradas : saidas;
    const motivos = [];
    if (saidas >= minSaidas) motivos.push(`${saidas} saídas/${janelaHoras}h`);
    if (razao >= razaoMax && saidas >= 30) motivos.push(`razão saída/entrada ${razao.toFixed(1)}`);
    if (contatosNovos >= contatosNovosMax) motivos.push(`${contatosNovos} contatos novos`);
    if (motivos.length) {
      await registrarAlerta(r.client_id, {
        tipo: "anomalia", severidade: "alerta",
        detalhe: "Padrão anômalo: " + motivos.join("; "),
        meta: { saidas, entradas, contatosNovos, janelaHoras },
      });
      alertas.push({ client_id: r.client_id, motivos });
    }
  }
  return alertas;
}

// ---------------------------------------------------------------------- UTIL
async function registrarAlerta(clientId, { tipo, severidade, detalhe, meta }) {
  try {
    await db.from("abuse_alerts").insert({ client_id: clientId, tipo, severidade, detalhe, meta: meta || null });
  } catch (e) {
    console.error("[abuse] registrarAlerta:", e.message);
  }
}

module.exports = { estaSuspenso, suspender, avaliarTexto, classificar, checarAnomalias, registrarAlerta };
