// docs/motor-meta/meta-media.js
// Mídia (imagens/documentos/áudio) na Plataforma WhatsApp Business (Cloud API).
// Usado pelo MOTOR (VPS) para: (a) RECEBER mídia que chega no webhook e guardar
// no Supabase; (b) ENVIAR mídia pela Meta (upload -> media_id -> send); (c) a IA
// mandar o CATÁLOGO em arquivo quando o cliente final pede.
//
// Requer Node 18+ (fetch, FormData, Blob globais). CommonJS, igual aos outros
// módulos do motor. Segredos (token do cliente) só no servidor.
//
// ENV: META_GRAPH_VERSION (ex v23.0), SUPABASE_URL, SUPABASE_SERVICE_KEY.
// O supabase client (service_role) é injetado por quem chama.

const { randomUUID } = require("crypto");

const GRAPH = `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || "v23.0"}`;

// Extensão por mime (fallback .bin)
const EXT = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "application/pdf": "pdf",
  "audio/ogg": "ogg", "audio/mpeg": "mp3", "audio/mp4": "m4a",
  "video/mp4": "mp4",
};
function extDe(mime) { return EXT[mime] || "bin"; }

// Tipo Farol (image|document|audio|video) a partir do tipo da mensagem Meta.
function tipoDe(metaType) {
  if (metaType === "image") return "image";
  if (metaType === "document") return "document";
  if (metaType === "audio" || metaType === "voice") return "audio";
  if (metaType === "video") return "video";
  if (metaType === "sticker") return "image";
  return "document";
}

// ---------- RECEBER (inbound) ----------
// A partir do objeto de mensagem do webhook (msg.type in image|document|audio|video|sticker),
// baixa a mídia da Meta e guarda no bucket 'conversas'. Retorna os campos p/ gravar em messages.
async function receberMidia({ msg, token, clientId, conversationId, supabase }) {
  const tipoMeta = msg.type;
  const node = msg[tipoMeta]; // { id, mime_type, filename?, caption? }
  if (!node || !node.id) return null;

  // 1) resolve a URL temporária da mídia
  const metaRes = await fetch(`${GRAPH}/${node.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meta = await metaRes.json();
  if (!metaRes.ok || !meta.url) {
    throw new Error(meta?.error?.message || "Falha ao resolver a mídia recebida.");
  }
  // 2) baixa os bytes (precisa do token no header)
  const binRes = await fetch(meta.url, { headers: { Authorization: `Bearer ${token}` } });
  if (!binRes.ok) throw new Error("Falha ao baixar a mídia recebida.");
  const buf = Buffer.from(await binRes.arrayBuffer());

  const mime = node.mime_type || meta.mime_type || "application/octet-stream";
  const tipo = tipoDe(tipoMeta);
  const filename = node.filename || `${tipo}-${Date.now()}.${extDe(mime)}`;
  const path = `${clientId}/${conversationId}/${randomUUID()}.${extDe(mime)}`;

  // 3) sobe no Supabase (bucket privado 'conversas', via service_role)
  const up = await supabase.storage.from("conversas").upload(path, buf, {
    contentType: mime, upsert: false,
  });
  if (up.error) throw new Error("Falha ao guardar a mídia: " + up.error.message);

  return {
    media_url: path,
    media_type: tipo,
    media_mime: mime,
    media_filename: filename,
    caption: node.caption || "",
  };
}

// ---------- ENVIAR (outbound) ----------
// Sobe um arquivo (Buffer) na Meta -> media_id.
async function uploadParaMeta({ phoneNumberId, token, buf, mime, filename }) {
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", mime);
  form.append("file", new Blob([buf], { type: mime }), filename || `file.${extDe(mime)}`);
  const r = await fetch(`${GRAPH}/${phoneNumberId}/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const d = await r.json();
  if (!r.ok || !d.id) throw new Error(d?.error?.message || "Falha ao subir a mídia na Meta.");
  return d.id;
}

// Envia uma mensagem de mídia por media_id.
async function enviarMensagemMidia({ phoneNumberId, token, toPhone, tipo, mediaId, mime, filename, caption }) {
  // tipo: image | document | audio | video
  const payloadMidia = { id: mediaId };
  if (caption && (tipo === "image" || tipo === "document" || tipo === "video")) {
    payloadMidia.caption = caption;
  }
  if (tipo === "document") {
    payloadMidia.filename = filename || `documento.${extDe(mime)}`;
  }
  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: toPhone,
    type: tipo,
    [tipo]: payloadMidia,
  };
  const r = await fetch(`${GRAPH}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d?.error?.message || "Falha ao enviar a mídia.");
  return d?.messages?.[0]?.id || null;
}

// Baixa um objeto do Supabase (bucket privado) e devolve { buf, mime }.
async function baixarDoStorage({ supabase, bucket, path, mime }) {
  const dl = await supabase.storage.from(bucket).download(path);
  if (dl.error || !dl.data) throw new Error("Falha ao ler o arquivo do storage.");
  const buf = Buffer.from(await dl.data.arrayBuffer());
  return { buf, mime: mime || dl.data.type || "application/octet-stream" };
}

// Envia um arquivo que já está no Supabase (usado pelo atendimento humano e pelo catálogo).
async function enviarArquivoDoStorage({ phoneNumberId, token, toPhone, supabase, bucket, path, tipo, mime, filename, caption }) {
  const { buf, mime: mimeReal } = await baixarDoStorage({ supabase, bucket, path, mime });
  const mediaId = await uploadParaMeta({ phoneNumberId, token, buf, mime: mimeReal, filename });
  return enviarMensagemMidia({ phoneNumberId, token, toPhone, tipo, mediaId, mime: mimeReal, filename, caption });
}

// ---------- CATÁLOGO ----------
// Marcador que a IA emite quando o cliente final pede o catálogo (ver prompt).
const MARCADOR_CATALOGO = "[[ENVIAR_CATALOGO]]";

// Se a resposta da IA contém o marcador E o cliente tem catálogo em arquivo,
// envia o arquivo e devolve o texto SEM o marcador (para enviar como legenda/texto).
async function tratarCatalogoNaResposta({ textoIa, client, phoneNumberId, token, toPhone, supabase }) {
  const tem = typeof textoIa === "string" && textoIa.includes(MARCADOR_CATALOGO);
  const limpo = tem ? textoIa.split(MARCADOR_CATALOGO).join("").trim() : textoIa;
  if (!tem) return { enviouCatalogo: false, texto: limpo };

  if (!client.catalogo_midia_url) {
    // IA pediu catálogo mas não há arquivo — cai no catálogo em texto, se houver.
    return { enviouCatalogo: false, texto: limpo || (client.catalogo || "") };
  }
  const tipo = client.catalogo_midia_tipo === "image" ? "image" : "document";
  await enviarArquivoDoStorage({
    phoneNumberId, token, toPhone, supabase,
    bucket: "catalogos",
    path: client.catalogo_midia_url,
    tipo,
    mime: client.catalogo_midia_mime,
    filename: client.catalogo_midia_nome || "catalogo",
    caption: limpo || "",
  });
  return { enviouCatalogo: true, texto: limpo };
}

module.exports = {
  receberMidia,
  uploadParaMeta,
  enviarMensagemMidia,
  enviarArquivoDoStorage,
  baixarDoStorage,
  tratarCatalogoNaResposta,
  MARCADOR_CATALOGO,
  tipoDe,
  extDe,
};
