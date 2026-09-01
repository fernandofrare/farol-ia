import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// POST /api/cadastro
// Cria o usuário no Supabase Auth (auto-confirmado), a linha em clients,
// e — se ASAAS_API_KEY estiver setada — o cliente + assinatura (trial 7 dias) no Asaas.
// Devolve { ok, checkoutUrl } para a tela /cadastro redirecionar.
//
// OBS de arquitetura: o WEBHOOK do Asaas (sincronizar status de pagamento)
// NÃO fica aqui no Next — fica no MOTOR (VPS), que já tem a service_role e roda 24h.
// Atualizar clients.status por asaas_customer_id exige privilégio que o app Next
// (anon key) não tem, e a service_role nunca entra no Next por segurança.

type Body = {
  nome: string;
  email: string;
  telefone?: string;
  senha: string;
  tipo: "empresa" | "autonomo";
  nome_empresa?: string;
  cnpj?: string;
  cpf?: string;
  segmento?: string;
};

const soDigitos = (s?: string) => (s || "").replace(/\D/g, "");

export async function POST(request: Request) {
  let b: Body;
  try {
    b = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  // Validação básica
  if (!b.nome?.trim()) return NextResponse.json({ erro: "Nome obrigatório." }, { status: 400 });
  if (!b.email?.includes("@")) return NextResponse.json({ erro: "E-mail inválido." }, { status: 400 });
  if (!b.senha || b.senha.length < 8) return NextResponse.json({ erro: "Senha muito curta." }, { status: 400 });
  const cpfCnpj = b.tipo === "empresa" ? soDigitos(b.cnpj) : soDigitos(b.cpf);
  if (!cpfCnpj) return NextResponse.json({ erro: "Informe CPF ou CNPJ." }, { status: 400 });

  const supabase = createClient();

  // 1. Cria o usuário no Auth (com "Confirm email" desligado, já vem confirmado + sessão nos cookies).
  const { data: signUp, error: authErr } = await supabase.auth.signUp({
    email: b.email,
    password: b.senha,
  });
  if (authErr || !signUp.user) {
    const msg = authErr?.message?.includes("registered")
      ? "Este e-mail já tem cadastro. Faça login."
      : "Não foi possível criar a conta.";
    return NextResponse.json({ erro: msg }, { status: 400 });
  }
  const userId = signUp.user.id;

  // 2. Cria a linha em clients (RLS: o próprio usuário insere a própria linha).
  const trialAte = new Date();
  trialAte.setDate(trialAte.getDate() + 7);

  const { error: cliErr } = await supabase.from("clients").insert({
    user_id: userId,
    email: b.email,
    nome: b.tipo === "empresa" ? b.nome_empresa || b.nome : b.nome,
    razao_social: b.tipo === "empresa" ? b.nome_empresa || null : null,
    segment: b.segmento || null,
    telefone: soDigitos(b.telefone) || null,
    tipo_pessoa: b.tipo,
    cpf_cnpj: cpfCnpj,
    status: "trial",
    trial_ate: trialAte.toISOString(),
    ia_active: false,
  });
  if (cliErr) {
    console.error("[cadastro] insert clients:", cliErr.message);
    return NextResponse.json({ erro: "Erro ao salvar cadastro." }, { status: 500 });
  }

  // 3. Asaas (opcional até a chave estar setada no Vercel). Cria customer + assinatura trial.
  const ASAAS_KEY = process.env.ASAAS_API_KEY;
  const ASAAS_BASE =
    process.env.ASAAS_ENV === "production"
      ? "https://api.asaas.com/v3"
      : "https://api-sandbox.asaas.com/v3";

  if (!ASAAS_KEY) {
    // Sem gateway ainda: segue pro painel. (Fase de validação do cadastro.)
    return NextResponse.json({ ok: true, checkoutUrl: null });
  }

  try {
    // 3a. Customer no Asaas
    const custResp = await fetch(`${ASAAS_BASE}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", access_token: ASAAS_KEY },
      body: JSON.stringify({
        name: b.nome,
        email: b.email,
        mobilePhone: soDigitos(b.telefone) || undefined,
        cpfCnpj,
      }),
    });
    const cust = await custResp.json();
    if (!custResp.ok) throw new Error(cust?.errors?.[0]?.description || "Asaas customer");

    // 3b. Assinatura com trial: nextDueDate = hoje + 7 dias (1ª cobrança automática lá).
    const subResp = await fetch(`${ASAAS_BASE}/subscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", access_token: ASAAS_KEY },
      body: JSON.stringify({
        customer: cust.id,
        billingType: "CREDIT_CARD",
        value: 147,
        cycle: "MONTHLY",
        nextDueDate: trialAte.toISOString().slice(0, 10),
        description: "Farol IA — assinatura mensal (após 1 semana grátis)",
      }),
    });
    const sub = await subResp.json();
    if (!subResp.ok) throw new Error(sub?.errors?.[0]?.description || "Asaas subscription");

    // Guarda os IDs no clients.
    await supabase
      .from("clients")
      .update({ asaas_customer_id: cust.id, asaas_subscription_id: sub.id })
      .eq("user_id", userId);

    // URL onde o cliente informa o cartão (checkout hospedado do Asaas).
    // CONFIRMAR no sandbox qual campo vem (invoiceUrl da 1ª cobrança / paymentLink).
    const checkoutUrl = sub.paymentLink || sub.invoiceUrl || null;
    return NextResponse.json({ ok: true, checkoutUrl });
  } catch (e) {
    console.error("[cadastro] asaas:", e instanceof Error ? e.message : e);
    // Conta criada; pagamento pendente. Vai pro painel e a gente cobra depois.
    return NextResponse.json({ ok: true, checkoutUrl: null, aviso: "pagamento_pendente" });
  }
}
