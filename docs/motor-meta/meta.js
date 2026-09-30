// src/meta.js — camada de transporte WhatsApp via API Oficial da Meta (Cloud API)
//
// Espelha a interface de src/evolution.js para o cutover por provider.
// NÃO contém segredos. Lê tudo de:
//   - process.env.META_GRAPH_VERSION   (opcional, default "v21.0")
//   - por cliente (linha da tabela clients): meta_phone_number_id, meta_token
//     (ou, no beta com um número só, do .env: META_PHONE_NUMBER_ID / META_TOKEN)
//
// Os segredos (Access Token / App Secret) vivem SÓ no .env do VPS.

const GRAPH = `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || "v21.0"}`;

/**
 * Resolve as credenciais de envio para um cliente.
 * Prioriza o que está na linha do cliente; cai pro .env no beta de número único.
 */
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

/**
 * Envia texto livre. Só funciona DENTRO da janela de 24h
 * (cliente iniciou a conversa). É o que a IA usa no dia a dia.
 * @param {string} to    número E.164 sem "+", ex "5554999999999"
 */
async function enviarTexto(to, texto, client = {}) {
  const { phoneId, token } = credenciais(client);
  return graphPost(phoneId, token, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { preview_url: false, body: texto },
  });
}

/**
 * Envia template pré-aprovado. Necessário FORA da janela de 24h
 * (ex: retomada de lead frio, lembrete de agendamento).
 * @param {string[]} variaveis  valores para {{1}}, {{2}}, ... na ordem
 */
async function enviarTemplate(to, nomeTemplate, variaveis = [], idioma = "pt_BR", client = {}) {
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

/**
 * Marca uma mensagem recebida como lida (opcional, melhora UX no WhatsApp do cliente).
 */
async function marcarLida(messageId, client = {}) {
  const { phoneId, token } = credenciais(client);
  return graphPost(phoneId, token, {
    messaging_product: "whatsapp",
    status: "read",
    message_id: messageId,
  });
}

module.exports = { enviarTexto, enviarTemplate, marcarLida };
