import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { Sidebar } from "@/components/Sidebar";
import painel from "@/components/painel.module.css";

export const metadata = { title: "Assinatura — Farol IA" };

const WHATS = "5554994009947";
const wa = (t: string) => `https://wa.me/${WHATS}?text=${encodeURIComponent(t)}`;

export default async function AssinaturaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cliente } = await supabase
    .from("clients")
    .select("nome, status, trial_ate, credito_pendente")
    .eq("user_id", user?.id)
    .maybeSingle();

  const status = cliente?.status || "trial";
  const credito = Number(cliente?.credito_pendente ?? 0);
  const nomeUsuario = cliente?.nome || user?.email?.split("@")[0] || "Minha conta";

  let diasRestantes: number | null = null;
  if (cliente?.trial_ate) {
    const ms = new Date(cliente.trial_ate).getTime() - Date.now();
    diasRestantes = Math.max(0, Math.ceil(ms / 86400000));
  }

  const card: React.CSSProperties = {
    border: "1px solid var(--line)",
    borderRadius: 16,
    padding: 24,
    background: "var(--bg-soft)",
    marginBottom: 20,
  };

  const emTrial = status === "trial";
  const ativo = status === "ativo";

  return (
    <div className={painel.shell}>
      <Sidebar usuario={{ nome: nomeUsuario, plano: "" }} />
      <main className={painel.main}>
        <div className={painel.topbar}>
          <h1>Assinatura</h1>
        </div>

        <div className={painel.content}>
          <div style={card}>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
              Plano
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
              Farol IA — R$147/mês
            </div>
            <div style={{ fontSize: 14, color: "var(--muted)" }}>
              {emTrial &&
                (diasRestantes !== null
                  ? `Período de teste — faltam ${diasRestantes} dia${diasRestantes === 1 ? "" : "s"} grátis.`
                  : "Período de teste grátis.")}
              {ativo && "Assinatura ativa. Obrigado por fazer parte."}
              {!emTrial && !ativo && "Status: " + status + "."}
            </div>
          </div>

          {emTrial && (
            <div style={card}>
              <h2 style={{ fontSize: 18, marginBottom: 6 }}>Como funciona o teste</h2>
              <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.5 }}>
                Você tem <b>7 dias grátis</b>, sem precisar cadastrar cartão. Ao fim
                do período, a gente combina a forma de pagamento para manter sua IA
                atendendo. Cancele quando quiser — sem multa, sem fidelidade.
              </p>
            </div>
          )}

          <div style={card}>
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>Crédito de indicações</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 12 }}>
              Cada negócio que você indica e que assina vale <b>1 mês grátis</b> pra
              você. Você tem <b>R$ {credito.toFixed(0)}</b> de crédito acumulado.
            </p>
            <Link href="/indicar" className={`${painel.btn} ${painel.btnPrimary}`}>
              🎁 Indicar e ganhar
            </Link>
          </div>

          <div style={card}>
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>Cancelamento</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 12 }}>
              Pode cancelar quando quiser. Por enquanto, é só falar com a gente que
              resolvemos na hora.
            </p>
            <a
              href={wa("Olá! Quero falar sobre a minha assinatura da Farol IA.")}
              className={`${painel.btn} ${painel.btnGhost}`}
            >
              Falar com o suporte
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
