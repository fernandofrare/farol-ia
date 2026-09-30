// src/meta-webhook.js — recebimento de mensagens da API Oficial da Meta
//
// Monta as rotas do webhook num router Express. NÃO contém segredos.
// Lê do .env do VPS:
//   - META_VERIFY_TOKEN  (string que tu define e cola também no painel da Meta)
//   - META_APP_SECRET    (segredo do app; usado só pra validar assinatura HMAC)
//
// Uso no server.js:
//   const express = require("express");
//   const { montarWebhookMeta } = require("./meta-webhook");
//   // IMPORTANTE: precisa do corpo BRUTO pra validar a assinatura.
//   app.use("/webhook/meta", express.raw({ type: "*/*" }));
//   montarWebhookMeta(app, { onMensagem: processarMensagemRecebida });

const crypto = require("crypto");

/**
 * Valida a assinatura X-Hub-Signature-256 (HMAC-SHA256 do corpo bruto com o App Secret).
 * Sem isso, qualquer um poderia forjar mensagens no webhook.
 */
function assinaturaValida(rawBody, signatureHeader) {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) throw new Error("meta-webhook: META_APP_SECRET ausente no .env");
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;

  const esperado = signatureHeader.slice("sha256=".length);
  const calculado = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");

  // Comparação em tempo constante (evita timing attack).
  const a = Buffer.from(calculado, "hex");
  const b = Buffer.from(esperado, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Extrai as mensagens de texto de um payload da Meta em uma lista normalizada:
 *   [{ de, nome, texto, messageId, phoneNumberId, timestamp }]
 * Ignora eventos que não são mensagem de texto de entrada (status, reações, etc.)
 * — mídia fica pra fase posterior (ver notas de integração).
 */
function extrairMensagens(payload) {
  const out = [];
  const entries = payload?.entry || [];
  for (const entry of entries) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      const phoneNumberId = value?.metadata?.phone_number_id;
      const contatos = value?.contacts || [];
      const nomePorWaId = {};
      for (const c of contatos) nomePorWaId[c.wa_id] = c?.profile?.name;

      for (const msg of value.messages || []) {
        if (msg.type !== "text") continue; // beta: só texto por enquanto
        out.push({
          de: msg.from,
          nome: nomePorWaId[msg.from] || null,
          texto: msg.text?.body || "",
          messageId: msg.id,
          phoneNumberId,
          timestamp: Number(msg.timestamp) * 1000 || Date.now(),
        });
      }
    }
  }
  return out;
}

/**
 * Registra as rotas GET (verificação) e POST (recebimento) do webhook.
 * @param {object} app                  instância do Express
 * @param {object} opts
 * @param {(m:object)=>Promise<void>} opts.onMensagem  callback por mensagem normalizada
 * @param {string} [opts.path="/webhook/meta"]
 */
function montarWebhookMeta(app, { onMensagem, path = "/webhook/meta" }) {
  // GET: desafio de verificação da Meta ao configurar a URL.
  app.get(path, (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  });

  // POST: mensagens recebidas. Corpo BRUTO (Buffer) por causa da assinatura.
  app.post(path, async (req, res) => {
    const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const sig = req.get("x-hub-signature-256");

    let ok = false;
    try {
      ok = assinaturaValida(raw, sig);
    } catch (e) {
      console.error("[meta-webhook] erro validando assinatura:", e.message);
    }
    if (!ok) return res.sendStatus(401);

    // Responde 200 rápido — a Meta reentrega se demorar.
    res.sendStatus(200);

    let payload;
    try {
      payload = JSON.parse(raw.toString("utf8"));
    } catch {
      return;
    }

    for (const m of extrairMensagens(payload)) {
      try {
        await onMensagem(m);
      } catch (e) {
        console.error("[meta-webhook] erro processando mensagem:", e.message);
      }
    }
  });
}

module.exports = { montarWebhookMeta, assinaturaValida, extrairMensagens };
