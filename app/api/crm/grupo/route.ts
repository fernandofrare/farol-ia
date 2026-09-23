import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const VALIDOS = ["lead", "cliente", "alerta"];

// POST /api/crm/grupo — move um contato entre Leads/Clientes/Alerta (botao manual).
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });

  let body: { conversationId?: string; grupo?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "corpo invalido" }, { status: 400 });
  }
  const conversationId = (body.conversationId || "").trim();
  const grupo = (body.grupo || "").trim();
  if (!conversationId || !VALIDOS.includes(grupo))
    return NextResponse.json({ erro: "dados invalidos" }, { status: 400 });

  const { data: cliente } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!cliente) return NextResponse.json({ erro: "Cliente nao encontrado." }, { status: 404 });

  const { error } = await supabase
    .from("conversations")
    .update({ grupo })
    .eq("id", conversationId)
    .eq("client_id", cliente.id);

  if (error) {
    console.error("[crm/grupo]", error.message);
    return NextResponse.json({ erro: "Erro ao atualizar." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
