import { createClient } from "@/lib/supabase-server";
import { createClient as createService } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// GET /api/admin/alertas -> lista abuse_alerts (só admin). Usa service role (server-side).
function admins() {
  return (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  if (!admins().includes((user.email || "").toLowerCase())) {
    return NextResponse.json({ erro: "Acesso restrito." }, { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ erro: "SUPABASE_SERVICE_ROLE_KEY não configurado no Vercel." }, { status: 503 });

  const svc = createService(url, key, { auth: { persistSession: false } });
  const { data, error } = await svc
    .from("abuse_alerts")
    .select("id, client_id, tipo, severidade, detalhe, resolvido, created_at, clients(nome, whatsapp_e164, suspended)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ alertas: data || [] });
}
