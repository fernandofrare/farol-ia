import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// POST /api/whatsapp/meta/verify-code  { code }
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { data: cliente } = await supabase
    .from("clients").select("id").eq("user_id", user.id).maybeSingle();
  if (!cliente) return NextResponse.json({ erro: "Cliente não encontrado." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const code = String(body?.code || "").trim();
  if (!code) return NextResponse.json({ erro: "Informe o código recebido." }, { status: 400 });

  const MOTOR_URL = process.env.MOTOR_URL;
  const MOTOR_TOKEN = process.env.MOTOR_TOKEN;
  if (!MOTOR_URL || !MOTOR_TOKEN) return NextResponse.json({ pendente: true });

  try {
    const r = await fetch(`${MOTOR_URL}/meta/onboard/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-motor-token": MOTOR_TOKEN },
      body: JSON.stringify({ clientId: cliente.id, code }),
    });
    const data = await r.json();
    if (!r.ok) return NextResponse.json({ erro: data?.erro || "Código inválido ou expirado." }, { status: 502 });
    return NextResponse.json(data);
  } catch (e) {
    console.error("[meta/verify-code]", e instanceof Error ? e.message : e);
    return NextResponse.json({ erro: "Não foi possível verificar o código agora." }, { status: 502 });
  }
}
