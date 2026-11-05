// docs/motor-meta/meta-media-router.js
// Endpoints e ligações do MOTOR (VPS) para mídia. Depende de ./meta-media.js.
//
// DEPLOY no VPS (/opt/farol-motor/src):
//   1) copiar meta-media.js e este arquivo para src/
//   2) no server.js: app.use("/whatsapp", require("./meta-media-router").router);
//   3) garantir no .env do motor: META_GRAPH_VERSION, SUPABASE_URL, SUPABASE_SERVICE_KEY,
//      MOTOR_TOKEN.
//
// Também há 2 LIGAÇÕES no fluxo existente (meta-webhook.js) — ver o fim deste arquivo.

const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const {
  enviarArquivoDoStorage,
} = require("./meta-media");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const router = express.Router();

router.use(express.json());
router.use((req, res, next) => {
  if (req.get("x-motor-token") !== process.env.MOTOR_TOKEN) {
    return res.status(401).json({ erro: "não autorizado" });
  }
  next();
});

// POST /whatsapp/send-media
// Body: { clientId, conversationId, phone, bucket, path, tipo, mime, filename, caption }
// Lê o phone_number_id/token do cliente e envia o arquivo (já no Supabase) pela Meta.
router.post("/send-media", async (req, res) => {
  const { clientId, phone, bucket, path, tipo, mime, filename, caption } = req.body || {};
  if (!clientId || !phone || !bucket || !path || !tipo) {
    return res.status(400).json({ erro: "parâmetros obrigatórios faltando" });
  }
  try {
    const { data: cli, error } = await supabase
      .from("clients")
      .select("meta_phone_number_id, meta_token, provider")
      .eq("id", clientId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!cli || !cli.meta_phone_number_id || !cli.meta_token) {
      return res.status(409).json({ erro: "cliente sem número Meta conectado" });
    }
    const messageId = await enviarArquivoDoStorage({
      phoneNumberId: cli.meta_phone_number_id,
      token: cli.meta_token,
      toPhone: phone,
      supabase,
      bucket,
      path,
      tipo,
      mime,
      filename,
      caption,
    });
    return res.json({ ok: true, messageId });
  } catch (e) {
    console.error("[send-media]", e.message);
    return res.status(502).json({ erro: e.message });
  }
});

// POST /whatsapp/send  (TEXTO — atendimento humano)
// Body: { clientId, phone, text }
// Substitui o envio por Evolution: resolve o número Meta do cliente e envia texto.
// Reusa o envio de texto da Meta já existente no motor (meta.js). Se o seu meta.js
// expõe outra função, troque enviarTextoMeta pela equivalente.
router.post("/send", async (req, res) => {
  const { clientId, phone, text } = req.body || {};
  if (!clientId || !phone || !text) {
    return res.status(400).json({ erro: "clientId, phone e text obrigatórios" });
  }
  try {
    const { data: cli, error } = await supabase
      .from("clients")
      .select("meta_phone_number_id, meta_token")
      .eq("id", clientId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!cli || !cli.meta_phone_number_id || !cli.meta_token) {
      return res.status(409).json({ erro: "cliente sem número Meta conectado" });
    }
    const GRAPH = `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || "v23.0"}`;
    const r = await fetch(`${GRAPH}/${cli.meta_phone_number_id}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cli.meta_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: { body: text },
      }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d?.error?.message || "falha ao enviar texto");
    return res.json({ ok: true, messageId: d?.messages?.[0]?.id || null });
  } catch (e) {
    console.error("[send-text]", e.message);
    return res.status(502).json({ erro: e.message });
  }
});

module.exports = { router };

/* ============================================================
   LIGAÇÕES NO meta-webhook.js (fazer à mão no motor):

   (A) RECEBER mídia inbound — ao processar cada mensagem do webhook:
       const { receberMidia } = require("./meta-media");
       ...
       let midia = null;
       if (["image","document","audio","video","sticker"].includes(msg.type)) {
         midia = await receberMidia({ msg, token: cli.meta_token,
           clientId: cli.id, conversationId: conversa.id, supabase });
       }
       // ao inserir em messages (role 'user'), incluir quando houver mídia:
       //   content: (midia?.caption) || textoNormal || "",
       //   media_url: midia?.media_url, media_type: midia?.media_type,
       //   media_mime: midia?.media_mime, media_filename: midia?.media_filename
       // (quando é só mídia sem texto, a IA pode responder com base na legenda;
       //  "ver" a imagem com o Claude é um passo extra opcional — ver nota abaixo.)

   (B) ENVIAR catálogo pela IA — depois que o Claude gera a resposta e ANTES de
       enviar o texto ao cliente:
       const { tratarCatalogoNaResposta } = require("./meta-media");
       const r = await tratarCatalogoNaResposta({
         textoIa, client: cli,
         phoneNumberId: cli.meta_phone_number_id, token: cli.meta_token,
         toPhone: contato, supabase });
       // usar r.texto como o texto final a enviar (sem o marcador).
       // se r.enviouCatalogo = true, o arquivo já foi enviado (com a legenda = r.texto).

   (C) PROMPT da IA — adicionar uma instrução no system prompt do cliente:
       "Se o cliente pedir o catálogo/cardápio/tabela de preços, responda com uma
        frase curta de apresentação e inclua o marcador [[ENVIAR_CATALOGO]] ao
        final. Não descreva o arquivo."
       SÓ incluir essa instrução quando o cliente LIGOU o modo arquivo E tem arquivo:
         client.catalogo_modo_arquivo === true && client.catalogo_midia_url
       Quando o modo arquivo está DESLIGADO, não incluir a instrução — a IA
       responde com a lista de produtos/serviços em texto (client.catalogo), como hoje.

   NOTA (IA "ver" imagens): para a IA interpretar imagens recebidas (não só texto),
   passar a imagem ao Claude como input multimodal no pipeline — melhoria separada,
   não incluída aqui.
   ============================================================ */

/* ============================================================
   IDIOMA AUTOMÁTICO DA IA (registrado 05/11/2026)
   No system prompt do cliente (prompt.js/claude.js do motor), adicionar SEMPRE:
     "Responda SEMPRE no mesmo idioma em que o cliente final escreveu.
      Se ele escrever em espanhol, responda em espanhol; em inglês, responda em
      inglês; e assim por diante. Não troque de idioma no meio da conversa a não
      ser que o cliente troque."
   Claude é nativamente multilíngue — custo ~zero, sem config por cliente.
   (Tradução do APP em si — páginas que o cliente usa — é projeto i18n separado,
   NÃO incluído aqui.)
   ============================================================ */
