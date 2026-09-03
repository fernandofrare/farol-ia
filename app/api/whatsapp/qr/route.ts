import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// POST /api/whatsapp/qr
// Pede ao MOTOR (que tem a chave da Evolution) o QR de conexão da instância do cliente.
// A chave da Evolution NUNCA fica no Next — só o MOTOR fala com a Evolution.

export async function POST() {
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
    // Motor ainda não ligado: devolve pendente para a UI mostrar instrução.
    return NextResponse.json({ pendente: true, instance });
  }

  try {
    const r = await fetch(`${MOTOR_URL}/whatsapp/qr`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-motor-token": MOTOR_TOKEN },
      body: JSON.stringify({ instance }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.erro || "motor qr");

    if (!cliente.evolution_instance) {
      await supabase.from("clients").update({ evolution_instance: instance }).eq("id", cliente.id);
    }
    // espera { qr } (base64) do motor
    return NextResponse.json({ qr: data.qr, instance });
  } catch (e) {
    console.error("[whatsapp/qr]", e instanceof Error ? e.message : e);
    return NextResponse.json({ erro: "Não foi possível gerar o QR agora." }, { status: 502 });
  }
}
