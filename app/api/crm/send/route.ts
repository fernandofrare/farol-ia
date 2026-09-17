import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// POST /api/crm/send
// Envia uma mensagem MANUAL (humana) para o contato via MOTOR -> Evolution,
// grava no histórico e coloca a conversa em modo humano (a IA fica muda nela).
// A chave da Evolution NUNCA fica no Next — só o MOTOR fala com a Evolution.
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  let conversationId = "";
  let text = "";
  try {
    const body = await request.json();
    conversationId =
      typeof body?.conversationId === "string" ? body.conversationId : "";
    text = typeof body?.text === "string" ? body.text.trim() : "";
  } catch {
    return NextResponse.json({ erro: "corpo inválido" }, { status: 400 });
  }
  if (!conversationId || !text) {
    return NextResponse.json(
      { erro: "conversa e texto obrigatórios" },
      { status: 400 }
    );
  }
  if (text.length > 4000) {
    return NextResponse.json({ erro: "mensagem muito longa" }, { status: 400 });
  }

  // Cliente do usuário (para pegar a instância da Evolution).
  const { data: cliente } = await supabase
    .from("clients")
    .select("id, evolution_instance")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!cliente)
    return NextResponse.json({ erro: "Cliente não encontrado." }, { status: 404 });

  // A conversa precisa ser desse cliente (RLS reforça; checamos p/ erro claro).
  const { data: conversa } = await supabase
    .from("conversations")
    .select("id, contact_phone, client_id")
    .eq("id", conversationId)
    .eq("client_id", cliente.id)
    .maybeSingle();
  if (!conversa)
    return NextResponse.json({ erro: "Conversa não encontrada." }, { status: 404 });

  const instance = cliente.evolution_instance;
  if (!instance)
    return NextResponse.json({ erro: "WhatsApp não conectado." }, { status: 409 });

  const MOTOR_URL = process.env.MOTOR_URL;
  const MOTOR_TOKEN = process.env.MOTOR_TOKEN;
  if (!MOTOR_URL || !MOTOR_TOKEN) {
    return NextResponse.json(
      { erro: "Envio indisponível no momento." },
      { status: 503 }
    );
  }

  // 1) Envia pelo motor (que fala com a Evolution).
  try {
    const r = await fetch(`${MOTOR_URL}/whatsapp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-motor-token": MOTOR_TOKEN },
      body: JSON.stringify({ instance, phone: conversa.contact_phone, text }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data?.ok) throw new Error(data?.erro || "motor send");
  } catch (e) {
    console.error("[crm/send]", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { erro: "Não foi possível enviar a mensagem." },
      { status: 502 }
    );
  }

  // 2) Grava no histórico (role "assistant", mas is_ai=false -> foi humano).
  const agora = new Date().toISOString();
  const { data: msg, error: eMsg } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role: "assistant",
      content: text,
      is_ai: false,
    })
    .select("id, role, content, is_ai, created_at")
    .single();
  if (eMsg) console.error("[crm/send] insert msg", eMsg.message);

  // 3) Coloca a conversa em modo humano (IA silenciada) e atualiza carimbos.
  await supabase
    .from("conversations")
    .update({
      status: "human",
      last_message_at: agora,
      updated_at: agora,
      summary: text.slice(0, 140),
    })
    .eq("id", conversationId);

  return NextResponse.json({ ok: true, message: msg ?? null, status: "human" });
}
