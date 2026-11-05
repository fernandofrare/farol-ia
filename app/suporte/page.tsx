import { Icon } from "@/components/Icon";
import { createClient } from "@/lib/supabase-server";
import { Sidebar } from "@/components/Sidebar";
import painel from "@/components/painel.module.css";
import { wa } from "@/lib/whats";

export const metadata = { title: "Suporte — Farol IA" };

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
    ["A IA parou de responder?", "Confira no painel se o WhatsApp está conectado e se a IA está ligada. A conexão é oficial pela Meta e não depende do seu celular ficar ligado."],
    ["Número dedicado", "Use um chip novo e exclusivo para o atendimento — nunca o seu WhatsApp pessoal. Ao conectar, o número passa a ser operado pela Meta e sai do app comum do WhatsApp."],
    ["Nada de disparo em massa", "A Farol IA responde quem te procura. Não use o número para enviar promoções em massa — é o caminho mais rápido para bloqueio."],
    ["Não precisa manter o celular ligado", "Diferente do WhatsApp Web, o número fica hospedado na Meta (API oficial). Depois de conectado, o atendimento funciona mesmo com o celular desligado."],
  ];

  return (
    <div className={painel.shell}>
      <Sidebar usuario={{ nome: nomeUsuario, plano: "Plano Farol IA" }} />
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
              <Icon name="chat" size={16} /> Abrir conversa no WhatsApp
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
