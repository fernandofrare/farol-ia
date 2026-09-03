import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// GET /api/whatsapp/status -> estado da conexão da instância do cliente (via motor).
// Retorna { state: "open" | "connecting" | "close" | "desconhecido" }.

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { data: cliente } = await supabase
    .from("clients")
    .select("id, evolution_instance")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!cliente) return NextResponse.json({ erro: "Cliente não encontrado." }, { status: 404 });

  const instance = cliente.evolution_instance || `farol_${cliente.id.slice(0, 8)}`;

  const MOTOR_URL = process.env.MOTOR_URL;
  const MOTOR_TOKEN = process.env.MOTOR_TOKEN;
  if (!MOTOR_URL || !MOTOR_TOKEN) {
    return NextResponse.json({ pendente: true, state: "desconhecido" });
  }

  try {
    const r = await fetch(
      `${MOTOR_URL}/whatsapp/status?instance=${encodeURIComponent(instance)}`,
      { headers: { "x-motor-token": MOTOR_TOKEN } }
    );
    const data = await r.json();
    return NextResponse.json({ state: data.state || "desconhecido" });
  } catch (e) {
    console.error("[whatsapp/status]", e instanceof Error ? e.message : e);
    return NextResponse.json({ state: "desconhecido" });
  }
}
