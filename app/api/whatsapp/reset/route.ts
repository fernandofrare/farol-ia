import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// POST /api/whatsapp/reset
// Apaga a instancia atual no MOTOR (logout + delete) para recriar limpa.
// NAO apaga dados de empresa/IA (isso vive no Supabase).
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });

  const { data: cliente } = await supabase
    .from("clients")
    .select("id, evolution_instance")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!cliente) return NextResponse.json({ erro: "Cliente nao encontrado." }, { status: 404 });
  if (!cliente.evolution_instance) return NextResponse.json({ ok: true });

  const MOTOR_URL = process.env.MOTOR_URL;
  const MOTOR_TOKEN = process.env.MOTOR_TOKEN;
  if (!MOTOR_URL || !MOTOR_TOKEN) return NextResponse.json({ pendente: true });

  try {
    const r = await fetch(`${MOTOR_URL}/whatsapp/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-motor-token": MOTOR_TOKEN },
      body: JSON.stringify({ instance: cliente.evolution_instance }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.erro || "motor reset");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[whatsapp/reset]", e instanceof Error ? e.message : e);
    return NextResponse.json({ erro: "Nao foi possivel resetar agora." }, { status: 502 });
  }
}
