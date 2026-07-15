import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// Encerra a sessão e volta ao login.
// Verificação de origem: defesa contra CSRF (só aceita POST do próprio site).
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && !origin.endsWith(host)) {
    return NextResponse.json({ erro: "origem inválida" }, { status: 403 });
  }

  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
  });
}
