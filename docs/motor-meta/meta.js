// src/meta.js — transporte WhatsApp via API Oficial da Meta (Cloud API)
//
// Interface ALINHADA ao uso real do motor (ver server.js -> responder):
//   enviarTexto(client, number, text)
//   mostrarDigitando(client, number, ms)   // best-effort; no-op seguro na Cloud API
//   enviarTemplate(client, to, nomeTemplate, variaveis, idioma)
//   marcarLida(client, messageId)
//
// O dispatch por provider fica em transporte.js. Aqui é só a camada Meta.
// NÃO contém segredos. Credenciais por cliente: client.meta_phone_number_id / client.meta_token
// (fallback .env no beta de número único: META_PHONE_NUMBER_ID / META_TOKEN).
// Os segredos (Access Token / App Secret) vivem SÓ no .env do VPS.

const GRAPH = `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || "v21.0"}`;

function credenciais(client = {}) {
  const phoneId = client.meta_phone_number_id || process.env.META_PHONE_NUMBER_ID;
  const token = client.meta_token || process.env.META_TOKEN;
  if (!phoneId || !token) {
    throw new Error("meta.js: faltam meta_phone_number_id/meta_token (nem no cliente nem no .env)");
  }
  return { phoneId, token };
}

async function graphPost(phoneId, token, payload) {
  const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText;
    throw new Error(`Graph API ${res.status}: ${msg}`);
  }
  return data; // { messaging_product, contacts:[...], messages:[{id}] }
}

// Texto livre — só funciona DENTRO da janela de 24h (cliente iniciou). É o que a IA usa.
// number: E.164 sem "+", ex "5554999999999" (o mesmo contactPhone que o motor já extrai).
async function enviarTexto(client, number, text) {
  const { phoneId, token } = credenciais(client);
  return graphPost(phoneId, token, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: number,
    type: "text",
    text: { preview_url: false, body: text },
  });
}

// Template pré-aprovado — necessário FORA da janela de 24h (retomada de lead, lembrete).
async function enviarTemplate(client, to, nomeTemplate, variaveis = [], idioma = "pt_BR") {
  const { phoneId, token } = credenciais(client);
  const components = variaveis.length
    ? [{ type: "body", parameters: variaveis.map((v) => ({ type: "text", text: String(v) })) }]
    : [];
  return graphPost(phoneId, token, {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: { name: nomeTemplate, language: { code: idioma }, components },
  });
}

// Marca como lida (opcional). messageId vem do webhook (m.messageId).
async function marcarLida(client, messageId) {
  const { phoneId, token } = credenciais(client);
  return graphPost(phoneId, token, {
    messaging_product: "whatsapp",
    status: "read",
    message_id: messageId,
  });
}

// A Cloud API não tem "digitando" para texto livre do jeito da Evolution.
// Mantemos a assinatura para o transporte.js poder chamar sem ramificar. No-op seguro.
async function mostrarDigitando(_client, _number, _ms) {
  return null;
}

module.exports = { enviarTexto, enviarTemplate, marcarLida, mostrarDigitando };
