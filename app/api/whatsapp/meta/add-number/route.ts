import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// POST /api/whatsapp/meta/add-number  { e164, displayName }
// Proxy para o MOTOR, que fala com a Meta usando o token da empresa (caso 2).
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { data: cliente } = await supabase
    .from("clients").select("id").eq("user_id", user.id).maybeSingle();
  if (!cliente) return NextResponse.json({ erro: "Cliente não encontrado." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const e164 = String(body?.e164 || "").trim();
  const displayName = String(body?.displayName || "").trim();
  if (!e164 || !displayName) {
    return NextResponse.json({ erro: "Informe o número e o nome do negócio." }, { status: 400 });
  }

  const MOTOR_URL = process.env.MOTOR_URL;
  const MOTOR_TOKEN = process.env.MOTOR_TOKEN;
  if (!MOTOR_URL || !MOTOR_TOKEN) return NextResponse.json({ pendente: true });

  try {
    const r = await fetch(`${MOTOR_URL}/meta/onboard/add-number`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-motor-token": MOTOR_TOKEN },
      body: JSON.stringify({ clientId: cliente.id, e164, displayName }),
    });
    const data = await r.json();
    if (!r.ok) return NextResponse.json({ erro: data?.erro || "Falha ao adicionar o número." }, { status: 502 });
    return NextResponse.json(data);
  } catch (e) {
    console.error("[meta/add-number]", e instanceof Error ? e.message : e);
    return NextResponse.json({ erro: "Não foi possível adicionar o número agora." }, { status: 502 });
  }
}
