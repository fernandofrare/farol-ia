import { createClient } from "@/lib/supabase-server";
import { createClient as createService } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// POST /api/admin/suspend { clientId, suspended } -> liga/desliga o kill-switch (só admin).
function admins() {
  return (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  if (!admins().includes((user.email || "").toLowerCase())) {
    return NextResponse.json({ erro: "Acesso restrito." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const clientId = String(body?.clientId || "");
  const suspended = !!body?.suspended;
  if (!clientId) return NextResponse.json({ erro: "clientId obrigatório." }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ erro: "SUPABASE_SERVICE_ROLE_KEY não configurado." }, { status: 503 });

  const svc = createService(url, key, { auth: { persistSession: false } });
  const { error } = await svc.from("clients").update({ suspended }).eq("id", clientId);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, suspended });
}
