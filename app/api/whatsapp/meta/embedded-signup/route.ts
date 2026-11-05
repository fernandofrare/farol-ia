import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// POST /api/whatsapp/meta/embedded-signup  { code, waba_id, phone_number_id }
// CASO 1 (Tech Provider / Embedded Signup): o cliente criou a PRÓPRIA WABA no
// portfólio dele pelo popup da Meta. Aqui recebemos o `code` (TTL ~30s) e os IDs,
// e repassamos ao MOTOR, que troca o code por um business token usando o App
// Secret (server-side, nunca no browser), assina o webhook na WABA do cliente e
// grava meta_waba_id / meta_phone_number_id / meta_token na linha do cliente.
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { data: cliente } = await supabase
    .from("clients").select("id").eq("user_id", user.id).maybeSingle();
  if (!cliente) return NextResponse.json({ erro: "Cliente não encontrado." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const code = String(body?.code || "").trim();
  const wabaId = String(body?.waba_id || "").trim();
  const phoneNumberId = String(body?.phone_number_id || "").trim();
  if (!code) {
    return NextResponse.json({ erro: "Autorização não concluída. Tente conectar novamente." }, { status: 400 });
  }

  const MOTOR_URL = process.env.MOTOR_URL;
  const MOTOR_TOKEN = process.env.MOTOR_TOKEN;
  // Sem motor configurado, não falha o fluxo: sinaliza pendente para a UI.
  if (!MOTOR_URL || !MOTOR_TOKEN) return NextResponse.json({ pendente: true });

  try {
    const r = await fetch(`${MOTOR_URL}/meta/onboard/embedded-signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-motor-token": MOTOR_TOKEN },
      body: JSON.stringify({ clientId: cliente.id, code, wabaId, phoneNumberId }),
    });
    const data = await r.json();
    if (!r.ok) {
      return NextResponse.json({ erro: data?.erro || "Falha ao concluir a conexão." }, { status: 502 });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error("[meta/embedded-signup]", e instanceof Error ? e.message : e);
    return NextResponse.json({ erro: "Não foi possível concluir a conexão agora." }, { status: 502 });
  }
}
