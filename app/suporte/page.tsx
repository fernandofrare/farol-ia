import { createClient } from "@/lib/supabase-server";
import { Sidebar } from "@/components/Sidebar";
import painel from "@/components/painel.module.css";

export const metadata = { title: "Suporte — Farol IA" };

const WHATS = "5554994009947";
const wa = (t: string) => `https://wa.me/${WHATS}?text=${encodeURIComponent(t)}`;

export default async function SuportePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: cliente } = await supabase
    .from("clients")
    .select("nome")
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

  const dicas: [string, string][] = [
    ["A IA parou de responder?", "Confira se o celular do número de atendimento está ligado, com internet, e se a IA está ligada no painel."],
    ["Número dedicado", "Use um chip novo e exclusivo para o atendimento — nunca o seu WhatsApp pessoal."],
    ["Nada de disparo em massa", "A Farol IA responde quem te procura. Não use o número para enviar promoções em massa — é o caminho mais rápido para bloqueio."],
    ["Mantenha o celular ligado", "O vínculo é como o WhatsApp Web: se o celular ficar muito tempo desligado, a conexão cai e é preciso reconectar o QR."],
  ];

  return (
    <div className={painel.shell}>
      <Sidebar usuario={{ nome: nomeUsuario, plano: "" }} />
      <main className={painel.main}>
        <div className={painel.topbar}>
          <h1>Suporte</h1>
        </div>

        <div className={painel.content}>
          <div style={card}>
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>Falar com a gente</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 14 }}>
              Estamos no WhatsApp para ajudar seu negócio a atender melhor. Respondemos
              o mais rápido possível.
            </p>
            <a
              href={wa("Olá! Preciso de ajuda com a Farol IA.")}
              className={`${painel.btn} ${painel.btnPrimary}`}
            >
              💬 Abrir conversa no WhatsApp
            </a>
          </div>

          <div style={card}>
            <h2 style={{ fontSize: 18, marginBottom: 14 }}>Dúvidas rápidas</h2>
            {dicas.map(([q, a]) => (
              <div key={q} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{q}</div>
                <div style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.5 }}>{a}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
