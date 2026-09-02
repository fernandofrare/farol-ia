import { createClient } from "@/lib/supabase-server";
import { Sidebar } from "@/components/Sidebar";
import painel from "@/components/painel.module.css";
import { CopyLink } from "./CopyLink";

export const metadata = { title: "Indique e ganhe — Farol IA" };

const BASE = "https://farolia.store/cadastro?ref=";

export default async function IndicarPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cliente } = await supabase
    .from("clients")
    .select("nome, ref_code, credito_pendente")
    .eq("user_id", user?.id)
    .maybeSingle();

  const { count: totalConvites } = await supabase
    .from("convites")
    .select("id", { count: "exact", head: true })
    .eq("indicador_user_id", user?.id);

  const { count: pagos } = await supabase
    .from("convites")
    .select("id", { count: "exact", head: true })
    .eq("indicador_user_id", user?.id)
    .in("status", ["pagou", "recompensado"]);

  const refCode = cliente?.ref_code ?? "";
  const link = refCode ? BASE + refCode : "";
  const credito = Number(cliente?.credito_pendente ?? 0);
  const nomeUsuario =
    cliente?.nome || user?.email?.split("@")[0] || "Minha conta";

  const card: React.CSSProperties = {
    border: "1px solid var(--line)",
    borderRadius: 16,
    padding: 24,
    background: "var(--bg-soft)",
    marginBottom: 20,
  };
  const stat: React.CSSProperties = {
    border: "1px solid var(--line)",
    borderRadius: 14,
    padding: "18px 20px",
    background: "var(--bg-soft)",
    flex: 1,
    minWidth: 160,
  };

  return (
    <div className={painel.shell}>
      <Sidebar usuario={{ nome: nomeUsuario, plano: "" }} />

      <main className={painel.main}>
        <div className={painel.topbar}>
          <h1>Indique e ganhe</h1>
        </div>

        <div className={painel.content}>
          <div style={card}>
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>Seu link de convite</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 16 }}>
              Compartilhe com quem você conhece. Quando alguém assina pelo seu
              link e paga a primeira mensalidade, você ganha 1 mês grátis na sua
              próxima fatura.
            </p>
            {link ? (
              <CopyLink url={link} />
            ) : (
              <p style={{ color: "var(--muted)" }}>
                Seu código de convite está sendo gerado. Recarregue em instantes.
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={stat}>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
                Convidados
              </div>
              <div style={{ fontSize: 30, fontWeight: 700 }}>
                {totalConvites ?? 0}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                entraram pelo seu link
              </div>
            </div>

            <div style={stat}>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
                Assinaram
              </div>
              <div style={{ fontSize: 30, fontWeight: 700 }}>{pagos ?? 0}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                pagaram a 1ª mensalidade
              </div>
            </div>

            <div style={stat}>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
                Crédito acumulado
              </div>
              <div style={{ fontSize: 30, fontWeight: 700 }}>
                R$ {credito.toFixed(0)}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                na próxima fatura
              </div>
            </div>
          </div>

          <p style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 20 }}>
            Cada indicado que assina vale 1 mensalidade grátis, aplicada automaticamente assim que a Farol IA confirma o
            pagamento da primeira mensalidade de quem você indicou.
          </p>
        </div>
      </main>
    </div>
  );
}
