// docs/motor-meta/meta-embedded-signup.js
// CASO 1 — Tech Provider / Embedded Signup (handler do MOTOR no VPS).
// Troca o `code` do Embedded Signup por um business token do CLIENTE, assina o
// webhook na WABA do cliente e grava os IDs/token na linha clients.
//
// DEPLOY (no VPS /opt/farol-motor/src): copiar este arquivo e montar no server.js:
//   app.use("/meta/onboard", require("./meta-embedded-signup").router);
// (se já existe o router do caso 2 em /meta/onboard, substituir por este.)
//
// ENV necessárias no .env do motor:
//   META_APP_ID            = 28626141177088716   (App ID público do app novo)
//   META_APP_SECRET        = <App Secret>        (SEGREDO — só aqui, nunca no browser/repo)
//   META_GRAPH_VERSION     = v23.0               (ou a versão atual)
//   META_WEBHOOK_VERIFY    = <verify token do webhook>
//   MOTOR_TOKEN            = <token compartilhado com o Next (x-motor-token)>
//   SUPABASE_URL / SUPABASE_SERVICE_KEY
//
// Segurança: META_APP_SECRET e o business token do cliente NUNCA saem do servidor.
// O token do cliente é gravado em clients.meta_token (coluna server-side).

const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const GRAPH = `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || "v23.0"}`;
const APP_ID = process.env.META_APP_ID;
const APP_SECRET = process.env.META_APP_SECRET;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Troca o code do Embedded Signup por um business token (não expira por padrão).
async function trocarCodePorToken(code) {
  const url = `${GRAPH}/oauth/access_token`
    + `?client_id=${encodeURIComponent(APP_ID)}`
    + `&client_secret=${encodeURIComponent(APP_SECRET)}`
    + `&code=${encodeURIComponent(code)}`;
  const r = await fetch(url);
  const d = await r.json();
  if (!r.ok || !d.access_token) {
    throw new Error(d?.error?.message || "Falha ao trocar o code por token.");
  }
  return d.access_token;
}

// Assina o app na WABA do cliente para receber os webhooks de mensagem.
async function assinarWebhook(wabaId, token) {
  const r = await fetch(`${GRAPH}/${wabaId}/subscribed_apps`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const d = await r.json();
  if (!r.ok || !d.success) {
    throw new Error(d?.error?.message || "Falha ao assinar o webhook na WABA do cliente.");
  }
  return true;
}

// Consulta status do número (name_status / code_verification_status) para decidir
// se já está ativo ou aguardando aprovação do nome de exibição.
async function statusNumero(phoneNumberId, token) {
  const r = await fetch(
    `${GRAPH}/${phoneNumberId}?fields=verified_name,code_verification_status,name_status,quality_rating`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return r.json().catch(() => ({}));
}

const router = express.Router();

// Middleware: só aceita chamadas do Next com o token compartilhado.
router.use((req, res, next) => {
  if (req.get("x-motor-token") !== process.env.MOTOR_TOKEN) {
    return res.status(401).json({ erro: "não autorizado" });
  }
  next();
});

// POST /meta/onboard/embedded-signup  { clientId, code, wabaId, phoneNumberId }
router.post("/embedded-signup", express.json(), async (req, res) => {
  const { clientId, code, wabaId, phoneNumberId } = req.body || {};
  if (!clientId || !code) {
    return res.status(400).json({ erro: "clientId e code são obrigatórios." });
  }
  try {
    const token = await trocarCodePorToken(code);

    // Com o token do cliente, assina o webhook na WABA dele.
    if (wabaId) await assinarWebhook(wabaId, token);

    // Decide o estado pelo status do número.
    let onboarding_status = "aguardando_nome";
    let whatsapp_e164 = null;
    if (phoneNumberId) {
      const s = await statusNumero(phoneNumberId, token);
      whatsapp_e164 = s?.display_phone_number || null;
      if (s?.name_status === "APPROVED" || s?.code_verification_status === "VERIFIED") {
        onboarding_status = "ativo";
      }
    }

    // Grava por-cliente (service_role; meta_token nunca é legível pelo browser).
    const { error } = await supabase
      .from("clients")
      .update({
        provider: "meta",
        meta_waba_id: wabaId || null,
        meta_phone_number_id: phoneNumberId || null,
        meta_token: token,
        onboarding_status,
        ...(whatsapp_e164 ? { whatsapp_e164 } : {}),
      })
      .eq("id", clientId);
    if (error) throw new Error(error.message);

    return res.json({ ok: true, onboarding_status });
  } catch (e) {
    console.error("[embedded-signup]", e.message);
    return res.status(502).json({ erro: e.message });
  }
});

module.exports = { router, trocarCodePorToken, assinarWebhook, statusNumero };
