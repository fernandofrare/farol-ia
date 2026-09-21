import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// POST /api/whatsapp/logout
// Desconecta o numero atual da instancia do cliente (via MOTOR),
// SEM apagar a instancia nem os dados da empresa. Depois o cliente
// escaneia um novo QR para vincular outro numero.
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

  // Sem instancia = nada conectado; nada a desconectar.
  if (!cliente.evolution_instance) return NextResponse.json({ ok: true });

  const MOTOR_URL = process.env.MOTOR_URL;
  const MOTOR_TOKEN = process.env.MOTOR_TOKEN;
  if (!MOTOR_URL || !MOTOR_TOKEN) {
    return NextResponse.json({ pendente: true });
  }

  try {
    const r = await fetch(`${MOTOR_URL}/whatsapp/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-motor-token": MOTOR_TOKEN },
      body: JSON.stringify({ instance: cliente.evolution_instance }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.erro || "motor logout");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[whatsapp/logout]", e instanceof Error ? e.message : e);
    return NextResponse.json({ erro: "Nao foi possivel desconectar agora." }, { status: 502 });
  }
}
