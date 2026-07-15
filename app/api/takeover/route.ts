import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { checarLimite } from "@/lib/rate-limit-redis";

// Ativa/desativa o controle humano de uma conversa.
// Quando humano=true, o motor silencia a IA naquela conversa.
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const rl = await checarLimite(`takeover:${user.id}`, 60, 60);
  if (!rl.permitido) {
    return NextResponse.json({ erro: "Muitas requisições." }, { status: 429 });
  }

  let conversationId = "";
  let humano = false;
  try {
    const body = await request.json();
    conversationId = typeof body?.conversationId === "string" ? body.conversationId : "";
    humano = body?.humano === true;
  } catch {
    return NextResponse.json({ erro: "corpo inválido" }, { status: 400 });
  }

  if (!conversationId) {
    return NextResponse.json({ erro: "conversa não informada" }, { status: 400 });
  }

  // Confirma que a conversa pertence a um client do usuário (RLS reforça isso,
  // mas checamos explicitamente para dar erro claro).
  const { data: conversa } = await supabase
    .from("conversations")
    .select("id, client_id, clients!inner(user_id)")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conversa) {
    return NextResponse.json({ erro: "conversa não encontrada" }, { status: 404 });
  }

  const { error } = await supabase
    .from("conversations")
    .update({ status: humano ? "human" : "ativa" })
    .eq("id", conversationId);

  if (error) {
    console.error("[takeover]", error.message);
    return NextResponse.json({ erro: "Erro ao atualizar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: humano ? "human" : "ativa" });
}
