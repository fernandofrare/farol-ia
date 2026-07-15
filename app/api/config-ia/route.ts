import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { validarConfig } from "@/lib/validar-config";
import { checarLimite } from "@/lib/rate-limit-redis";
import { clientParaConfig, configParaClient, type ClientRow } from "@/lib/map-client";

// GET: devolve a config da IA do usuário logado (lida da tabela clients).
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("clients")
    .select(
      "nome, segment, tone, assistant_name, services, schedule, payment, scheduling_info, collect_data, welcome_message, off_hours_message, ia_active, evolution_instance"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[config-ia GET]", error.message);
    return NextResponse.json({ erro: "Erro ao carregar." }, { status: 500 });
  }

  return NextResponse.json({ config: clientParaConfig(data as ClientRow) });
}

// POST: grava (upsert) a config da IA na tabela clients.
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const rl = await checarLimite(`config:${user.id}`, 20, 60);
  if (!rl.permitido) {
    return NextResponse.json(
      { erro: "Muitas requisições. Aguarde um momento." },
      { status: 429, headers: { "Retry-After": String(rl.esperaSeg) } }
    );
  }

  let bruto: unknown;
  try {
    const body = await request.json();
    bruto = (body as { config?: unknown })?.config;
  } catch {
    return NextResponse.json({ erro: "corpo inválido" }, { status: 400 });
  }

  // Validação forte: nada cru vai para o banco/Claude.
  const resultado = validarConfig(bruto);
  if (!resultado.ok) {
    return NextResponse.json({ erro: resultado.erro }, { status: 400 });
  }

  // Traduz o formato da UI para as colunas reais de clients.
  const dadosClient = configParaClient(resultado.config);

  // Verifica se já existe client para este usuário.
  const { data: existente } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let error;
  if (existente) {
    ({ error } = await supabase
      .from("clients")
      .update(dadosClient)
      .eq("user_id", user.id));
  } else {
    ({ error } = await supabase
      .from("clients")
      .insert({ ...dadosClient, user_id: user.id, email: user.email }));
  }

  if (error) {
    console.error("[config-ia POST]", error.message);
    return NextResponse.json({ erro: "Erro ao salvar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
