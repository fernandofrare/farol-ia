import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { checarLimite, ipDaRequisicao } from "@/lib/rate-limit-redis";

// Recuperação de senha com rate limit por IP (anti-abuso de envio de e-mail).
export async function POST(request: Request) {
  const ip = ipDaRequisicao(request);

  // 5 pedidos por IP a cada 15 minutos.
  const rl = await checarLimite(`recuperar:${ip}`, 5, 15 * 60);
  if (!rl.permitido) {
    return NextResponse.json(
      { erro: "Muitas solicitações. Aguarde alguns minutos." },
      { status: 429, headers: { "Retry-After": String(rl.esperaSeg) } }
    );
  }

  let email = "";
  try {
    const body = await request.json();
    email = typeof body?.email === "string" ? body.email.trim().slice(0, 200) : "";
  } catch {
    return NextResponse.json({ erro: "corpo inválido" }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ erro: "Informe o e-mail." }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.farolia.store";
  const supabase = createClient();

  // Não revela se o e-mail existe: sempre responde ok (anti-enumeração).
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/nova-senha`,
  });

  return NextResponse.json({ ok: true });
}
