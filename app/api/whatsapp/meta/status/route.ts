import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// GET /api/whatsapp/meta/status -> estado do onboarding do número (caso 2)
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { data: cliente } = await supabase
    .from("clients").select("id, onboarding_status, whatsapp_e164").eq("user_id", user.id).maybeSingle();
  if (!cliente) return NextResponse.json({ erro: "Cliente não encontrado." }, { status: 404 });

  const MOTOR_URL = process.env.MOTOR_URL;
  const MOTOR_TOKEN = process.env.MOTOR_TOKEN;
  // Sem motor: devolve o estado salvo no banco (não trava a UI).
  if (!MOTOR_URL || !MOTOR_TOKEN) {
    return NextResponse.json({ onboarding_status: cliente.onboarding_status || "novo", whatsapp_e164: cliente.whatsapp_e164 || null });
  }

  try {
    const r = await fetch(`${MOTOR_URL}/meta/onboard/status?clientId=${encodeURIComponent(cliente.id)}`, {
      headers: { "x-motor-token": MOTOR_TOKEN },
    });
    const data = await r.json();
    return NextResponse.json({ ...data, whatsapp_e164: cliente.whatsapp_e164 || null });
  } catch (e) {
    console.error("[meta/status]", e instanceof Error ? e.message : e);
    return NextResponse.json({ onboarding_status: cliente.onboarding_status || "novo", whatsapp_e164: cliente.whatsapp_e164 || null });
  }
}
