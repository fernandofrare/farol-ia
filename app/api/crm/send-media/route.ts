import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// POST (multipart): { conversationId, file, caption? }
// Atendimento HUMANO envia uma mídia (imagem/documento) para o contato.
// Fluxo: sobe o arquivo no bucket privado "conversas" (RLS: só a própria pasta)
// -> pede ao MOTOR para enviar pela Meta (o motor tem o phone_number_id/token
// do cliente e baixa o arquivo via service_role) -> grava a mensagem no histórico
// e coloca a conversa em modo humano.

const TIPOS_OK: Record<string, { tipo: "image" | "document"; ext: string }> = {
  "application/pdf": { tipo: "document", ext: "pdf" },
  "image/jpeg": { tipo: "image", ext: "jpg" },
  "image/png": { tipo: "image", ext: "png" },
  "image/webp": { tipo: "image", ext: "webp" },
};
const TAMANHO_MAX = 20 * 1024 * 1024;

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  let conversationId = "";
  let caption = "";
  let file: File | null = null;
  try {
    const form = await req.formData();
    conversationId = String(form.get("conversationId") || "");
    caption = String(form.get("caption") || "").trim();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ erro: "Envio inválido." }, { status: 400 });
  }
  if (!conversationId || !file) {
    return NextResponse.json({ erro: "Conversa e arquivo obrigatórios." }, { status: 400 });
  }
  const info = TIPOS_OK[file.type];
  if (!info) return NextResponse.json({ erro: "Formato não aceito (PDF, JPG, PNG)." }, { status: 415 });
  if (file.size > TAMANHO_MAX) return NextResponse.json({ erro: "Arquivo muito grande (máx. 20 MB)." }, { status: 413 });

  const { data: cliente } = await supabase
    .from("clients").select("id").eq("user_id", user.id).maybeSingle();
  if (!cliente) return NextResponse.json({ erro: "Cliente não encontrado." }, { status: 404 });

  const { data: conversa } = await supabase
    .from("conversations")
    .select("id, contact_phone, client_id")
    .eq("id", conversationId)
    .eq("client_id", cliente.id)
    .maybeSingle();
  if (!conversa) return NextResponse.json({ erro: "Conversa não encontrada." }, { status: 404 });

  const path = `${cliente.id}/${conversationId}/${randomUUID()}.${info.ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const up = await supabase.storage.from("conversas").upload(path, buf, {
    contentType: file.type, upsert: false,
  });
  if (up.error) {
    console.error("[crm/send-media] upload", up.error.message);
    return NextResponse.json({ erro: "Falha ao enviar o arquivo." }, { status: 502 });
  }

  const MOTOR_URL = process.env.MOTOR_URL;
  const MOTOR_TOKEN = process.env.MOTOR_TOKEN;
  if (!MOTOR_URL || !MOTOR_TOKEN) {
    return NextResponse.json({ erro: "Envio indisponível no momento." }, { status: 503 });
  }

  // Motor envia pela Meta (lê phone_number_id/token do cliente e baixa o arquivo).
  try {
    const r = await fetch(`${MOTOR_URL}/whatsapp/send-media`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-motor-token": MOTOR_TOKEN },
      body: JSON.stringify({
        clientId: cliente.id,
        conversationId,
        phone: conversa.contact_phone,
        bucket: "conversas",
        path,
        tipo: info.tipo,
        mime: file.type,
        filename: file.name || `arquivo.${info.ext}`,
        caption,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data?.ok) throw new Error(data?.erro || "motor send-media");
  } catch (e) {
    console.error("[crm/send-media]", e instanceof Error ? e.message : e);
    return NextResponse.json({ erro: "Não foi possível enviar a mídia." }, { status: 502 });
  }

  const agora = new Date().toISOString();
  const { data: msg } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role: "assistant",
      content: caption || "",
      is_ai: false,
      media_url: path,
      media_type: info.tipo,
      media_mime: file.type,
      media_filename: file.name || null,
    })
    .select("id, role, content, is_ai, created_at, media_url, media_type, media_mime, media_filename")
    .single();

  await supabase
    .from("conversations")
    .update({ status: "human", last_message_at: agora, updated_at: agora, summary: caption ? caption.slice(0, 140) : "📎 Mídia enviada" })
    .eq("id", conversationId);

  return NextResponse.json({ ok: true, message: msg ?? null, status: "human" });
}
