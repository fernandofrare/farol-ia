import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { checarLimite, ipDaRequisicao } from "@/lib/rate-limit-redis";

// Login via servidor: aplica rate limit por IP ANTES de tentar autenticar.
// Protege contra força bruta de senha.
export async function POST(request: Request) {
  const ip = ipDaRequisicao(request);

  // 8 tentativas por IP a cada 5 minutos.
  const rl = await checarLimite(`login:${ip}`, 8, 5 * 60);
  if (!rl.permitido) {
    return NextResponse.json(
      { erro: "Muitas tentativas. Aguarde alguns minutos." },
      { status: 429, headers: { "Retry-After": String(rl.esperaSeg) } }
    );
  }

  let email = "";
  let senha = "";
  try {
    const body = await request.json();
    email = typeof body?.email === "string" ? body.email.trim().slice(0, 200) : "";
    senha = typeof body?.senha === "string" ? body.senha.slice(0, 200) : "";
  } catch {
    return NextResponse.json({ erro: "corpo inválido" }, { status: 400 });
  }

  if (!email || !senha) {
    return NextResponse.json({ erro: "Informe e-mail e senha." }, { status: 400 });
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    // Mensagem genérica — não revela se o e-mail existe.
    return NextResponse.json(
      { erro: "E-mail ou senha incorretos." },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true });
}
