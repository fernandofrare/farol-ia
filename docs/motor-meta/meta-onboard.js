// src/meta-onboard.js — Onboarding de número (CASO 2: número do cliente numa WABA da EMPRESA)
//
// ⚠️ NÃO TESTADO AINDA — depende da verificação do negócio da Meta aprovar.
// Código escrito a partir da doc oficial (Graph API). Validado só na SINTAXE.
// Testar com um número real assim que a verificação liberar.
//
// Opera com o System User token PERMANENTE da empresa (META_TOKEN no .env do VPS) sobre
// a(s) WABA(s) do PRÓPRIO portfólio da Farol. O cliente nunca toca na Meta.
//
// Variáveis de ambiente esperadas (.env do VPS):
//   META_TOKEN            -> System User token permanente (já existe)
//   META_GRAPH_VERSION    -> ex "v21.0" (opcional; default abaixo)
//   META_WABA_ID          -> WABA padrão da empresa p/ registrar números (v1)
//   MOTOR_TOKEN           -> mesmo segredo que o Next manda no header x-motor-token
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY -> p/ gravar estado (service role)
//
// Monte no server.js:  app.use("/meta/onboard", require("./meta-onboard").router);

const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const GRAPH = `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || "v21.0"}`;

// Cliente Supabase com service_role (bypassa RLS — roda só no servidor).
const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

function tokenEmpresa() {
  const token = process.env.META_TOKEN;
  if (!token) throw new Error("meta-onboard: falta META_TOKEN no .env");
  return token;
}

// Chamada genérica à Graph API com o token da empresa.
async function graph(path, { method = "GET", body } = {}) {
  const res = await fetch(`${GRAPH}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${tokenEmpresa()}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText;
    const err = new Error(`Graph API ${res.status}: ${msg}`);
    err.meta = data?.error || null;
    throw err;
  }
  return data;
}

// --- E.164 (mercado BR) -> { cc, phone_number } ------------------------------
// Entrada: "+5554999998888" | "5554999998888" | "54999998888"
function parseBR(e164) {
  let d = String(e164 || "").replace(/\D/g, "");
  if (d.startsWith("55")) d = d.slice(2); // tira DDI Brasil
  if (!d || d.length < 10) throw new Error("Número inválido. Use DDD + número.");
  return { cc: "55", phone_number: d };
}

function gerarPin() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 dígitos
}

// --- Operações Meta ----------------------------------------------------------

// Adiciona o número à WABA e já dispara o código de verificação.
async function adicionarNumero({ wabaId, e164, verifiedName, codeMethod = "SMS" }) {
  const { cc, phone_number } = parseBR(e164);
  // 1) adiciona o número à WABA -> retorna o phone_number_id
  const add = await graph(`${wabaId}/phone_numbers`, {
    method: "POST",
    body: { cc, phone_number, verified_name: verifiedName },
  });
  const phoneNumberId = add.id;
  // 2) pede o código (SMS/VOICE) no número do cliente
  await graph(`${phoneNumberId}/request_code`, {
    method: "POST",
    body: { code_method: codeMethod, language: "pt_BR" },
  });
  return { phoneNumberId };
}

// Verifica o código, registra o número no Cloud API e assina o webhook na WABA.
async function verificarERegistrar({ phoneNumberId, wabaId, code, pin }) {
  await graph(`${phoneNumberId}/verify_code`, {
    method: "POST",
    body: { code: String(code) },
  });
  await graph(`${phoneNumberId}/register`, {
    method: "POST",
    body: { messaging_product: "whatsapp", pin: String(pin) },
  });
  // assina o app da empresa aos webhooks da WABA do cliente
  await graph(`${wabaId}/subscribed_apps`, { method: "POST" });
  return true;
}

// Estado do número: nome aprovado? conectado?
async function statusNumero(phoneNumberId) {
  const d = await graph(
    `${phoneNumberId}?fields=verified_name,code_verification_status,name_status,status,quality_rating,platform_type`
  );
  // name_status: APPROVED | PENDING_REVIEW | DECLINED | ...
  // status: CONNECTED | PENDING | ...
  const nomeOk = d.name_status === "APPROVED";
  const conectado = d.status === "CONNECTED";
  return { ...d, nomeOk, conectado };
}

// --- Persistência ------------------------------------------------------------
async function clientePorId(clientId) {
  const { data, error } = await db
    .from("clients")
    .select("id, whatsapp_e164, display_name, meta_waba_id, meta_phone_number_id, onboarding_status")
    .eq("id", clientId)
    .maybeSingle();
  if (error) throw new Error("DB: " + error.message);
  if (!data) throw new Error("Cliente não encontrado.");
  return data;
}

// --- Router Express ----------------------------------------------------------
const router = express.Router();
router.use(express.json());

// Autenticação motor (mesmo esquema das outras rotas): header x-motor-token.
router.use((req, res, next) => {
  if (req.headers["x-motor-token"] !== process.env.MOTOR_TOKEN) {
    return res.status(401).json({ erro: "não autorizado" });
  }
  next();
});

// POST /meta/onboard/add-number  { clientId, e164, displayName }
router.post("/add-number", async (req, res) => {
  try {
    const { clientId, e164, displayName } = req.body || {};
    if (!clientId || !e164 || !displayName) {
      return res.status(400).json({ erro: "clientId, e164 e displayName são obrigatórios." });
    }
    const wabaId = process.env.META_WABA_ID; // v1: WABA da empresa. TODO: 1 WABA por cliente.
    if (!wabaId) return res.status(500).json({ erro: "META_WABA_ID não configurado." });

    const { phoneNumberId } = await adicionarNumero({ wabaId, e164, verifiedName: displayName });

    await db.from("clients").update({
      whatsapp_e164: e164,
      display_name: displayName,
      meta_waba_id: wabaId,
      meta_phone_number_id: phoneNumberId,
      provider: "meta",
      onboarding_status: "verificando",
    }).eq("id", clientId);

    res.json({ ok: true, phoneNumberId });
  } catch (e) {
    console.error("[onboard/add-number]", e.message, e.meta || "");
    res.status(502).json({ erro: e.message });
  }
});

// POST /meta/onboard/verify-code  { clientId, code }
router.post("/verify-code", async (req, res) => {
  try {
    const { clientId, code } = req.body || {};
    if (!clientId || !code) return res.status(400).json({ erro: "clientId e code são obrigatórios." });

    const cli = await clientePorId(clientId);
    if (!cli.meta_phone_number_id || !cli.meta_waba_id) {
      return res.status(409).json({ erro: "Número ainda não adicionado. Refaça o passo anterior." });
    }

    const pin = gerarPin();
    await verificarERegistrar({
      phoneNumberId: cli.meta_phone_number_id,
      wabaId: cli.meta_waba_id,
      code,
      pin,
    });

    // guarda o PIN em tabela só do service_role (nunca no browser)
    await db.from("client_meta_secrets").upsert({
      client_id: clientId,
      two_step_pin: pin,
      updated_at: new Date().toISOString(),
    });
    await db.from("clients").update({ onboarding_status: "aguardando_nome" }).eq("id", clientId);

    res.json({ ok: true, status: "aguardando_nome" });
  } catch (e) {
    console.error("[onboard/verify-code]", e.message, e.meta || "");
    res.status(502).json({ erro: e.message });
  }
});

// GET /meta/onboard/status?clientId=...
router.get("/status", async (req, res) => {
  try {
    const clientId = req.query.clientId;
    if (!clientId) return res.status(400).json({ erro: "clientId obrigatório." });

    const cli = await clientePorId(clientId);
    if (!cli.meta_phone_number_id) {
      return res.json({ onboarding_status: cli.onboarding_status || "novo" });
    }

    const st = await statusNumero(cli.meta_phone_number_id);

    // Promove p/ "ativo" quando nome aprovado e número conectado.
    let onboarding_status = cli.onboarding_status;
    if (st.nomeOk && st.conectado && onboarding_status !== "ativo") {
      onboarding_status = "ativo";
      await db.from("clients").update({ onboarding_status, ia_active: true }).eq("id", clientId);
    }

    res.json({
      onboarding_status,
      name_status: st.name_status,
      number_status: st.status,
      quality: st.quality_rating,
    });
  } catch (e) {
    console.error("[onboard/status]", e.message, e.meta || "");
    res.status(502).json({ erro: e.message });
  }
});

module.exports = {
  router,
  adicionarNumero,
  verificarERegistrar,
  statusNumero,
  parseBR,
  gerarPin,
};
