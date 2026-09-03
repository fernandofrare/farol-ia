import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { Sidebar } from "@/components/Sidebar";
import painel from "@/components/painel.module.css";

export const metadata = { title: "Configurações — Farol IA" };

export default async function ConfiguracoesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: cliente } = await supabase
    .from("clients")
    .select("nome, telefone")
    .eq("user_id", user?.id)
    .maybeSingle();
  const nomeUsuario = cliente?.nome || user?.email?.split("@")[0] || "Minha conta";

  const card: React.CSSProperties = {
    border: "1px solid var(--line)",
    borderRadius: 16,
    padding: 24,
    background: "var(--bg-soft)",
    marginBottom: 20,
  };
  const linha: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid var(--line)",
    fontSize: 14,
  };

  return (
    <div className={painel.shell}>
      <Sidebar usuario={{ nome: nomeUsuario, plano: "" }} />
      <main className={painel.main}>
        <div className={painel.topbar}>
          <h1>Configurações</h1>
        </div>

        <div className={painel.content}>
          <div style={card}>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>Sua conta</h2>
            <div style={linha}>
              <span style={{ color: "var(--muted)" }}>Nome</span>
              <span>{nomeUsuario}</span>
            </div>
            <div style={linha}>
              <span style={{ color: "var(--muted)" }}>E-mail</span>
              <span>{user?.email}</span>
            </div>
            {cliente?.telefone && (
              <div style={{ ...linha, borderBottom: "none" }}>
                <span style={{ color: "var(--muted)" }}>Telefone</span>
                <span>{cliente.telefone}</span>
              </div>
            )}
          </div>

          <div style={card}>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>Segurança</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 12 }}>
              Para trocar sua senha, enviamos um link seguro para o seu e-mail.
            </p>
            <Link href="/recuperar-senha" className={`${painel.btn} ${painel.btnGhost}`}>
              Trocar senha
            </Link>
          </div>

          <div style={card}>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>Sessão</h2>
            <form action="/api/auth/signout" method="post">
              <button type="submit" className={`${painel.btn} ${painel.btnGhost}`}>
                Sair da conta
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
