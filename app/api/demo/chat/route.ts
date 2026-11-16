import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// POST /api/demo/chat  { messages: [{ role: "user"|"assistant", content }] }
//
// DEMO "Teste sua IA": o cliente conversa com a PRÓPRIA IA treinada no negócio,
// SEM conta Meta nenhuma. Esta rota é um proxy fino e autenticado:
//   1. resolve o client_id do PRÓPRIO usuário logado (nunca confia no browser);
//   2. repassa o histórico ao MOTOR (/demo/gerar), que monta o MESMO prompt do
//      atendimento real e gera a resposta com o Claude;
//   3. o rate-limit (custo de token) é aplicado no MOTOR, fonte da verdade.
// Nenhum segredo (Anthropic key, service_role) passa por aqui.

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { data: cliente } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!cliente) {
    return NextResponse.json(
      { erro: "Salve a configuração da sua IA antes de testar." },
      { status: 404 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const raw = Array.isArray(body?.messages) ? body.messages : [];
  // Normaliza e limita: só user/assistant, últimas 20, texto até 2000 chars.
  const messages: Msg[] = raw
    .filter(
      (m: unknown): m is Msg =>
        !!m &&
        typeof m === "object" &&
        ((m as Msg).role === "user" || (m as Msg).role === "assistant") &&
        typeof (m as Msg).content === "string"
    )
    .slice(-20)
    .map((m: Msg) => ({ role: m.role, content: String(m.content).slice(0, 2000) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json(
      { erro: "A última mensagem precisa ser sua." },
      { status: 400 }
    );
  }

  const MOTOR_URL = process.env.MOTOR_URL;
  const MOTOR_TOKEN = process.env.MOTOR_TOKEN;
  if (!MOTOR_URL || !MOTOR_TOKEN) {
    return NextResponse.json(
      { erro: "O teste ainda não está disponível. Tente novamente em instantes." },
      { status: 503 }
    );
  }

  try {
    const r = await fetch(`${MOTOR_URL}/demo/gerar`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-motor-token": MOTOR_TOKEN },
      body: JSON.stringify({ clientId: cliente.id, messages }),
    });
    const data = await r.json().catch(() => ({}));

    if (r.status === 429) {
      return NextResponse.json(
        { erro: data?.erro || "Limite de mensagens de teste atingido.", remaining: 0, limite: true },
        { status: 429 }
      );
    }
    if (!r.ok) {
      return NextResponse.json(
        { erro: data?.erro || "Falha ao gerar a resposta." },
        { status: 502 }
      );
    }
    return NextResponse.json({ reply: data?.reply ?? "", remaining: data?.remaining });
  } catch (e) {
    console.error("[demo/chat]", e instanceof Error ? e.message : e);
    return NextResponse.json({ erro: "Não foi possível testar agora." }, { status: 502 });
  }
}
