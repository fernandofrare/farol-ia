import { createClient } from "@/lib/supabase-server";
import { Sidebar } from "@/components/Sidebar";
import { CrmTabela, type Contato } from "./CrmTabela";
import painel from "@/components/painel.module.css";

export const metadata = { title: "Contatos & CRM — Farol IA" };

function dataCurta(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function tempoRelativo(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)} dias`;
}

export default async function CrmPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cliente } = await supabase
    .from("clients")
    .select("id, nome")
    .eq("user_id", user?.id)
    .maybeSingle();

  const clientId = cliente?.id;

  // Lê os contatos a partir de conversations (cada conversa = um contato).
  const { data: rows } = clientId
    ? await supabase
        .from("conversations")
        .select(
          "id, contact_name, contact_phone, status, summary, last_message_at, message_count, lead_score, created_at"
        )
        .eq("client_id", clientId)
        .order("last_message_at", { ascending: false })
    : { data: [] };

  // Deriva o status do CRM: usa lead_score se houver, senão o status da conversa.
  function derivarStatus(r: {
    status?: string | null;
    lead_score?: number | null;
  }): Contato["status"] {
    if (typeof r.lead_score === "number") {
      if (r.lead_score >= 70) return "lead";
      if (r.lead_score >= 40) return "cliente";
      if (r.lead_score > 0) return "frio";
    }
    if (r.status === "lead" || r.status === "cliente" || r.status === "frio")
      return r.status;
    return "novo";
  }

  const contatos: Contato[] = (rows ?? []).map((r) => ({
    id: r.id,
    nome: r.contact_name ?? "Sem nome",
    telefone: r.contact_phone ?? "",
    status: derivarStatus(r),
    controleHumano: r.status === "human",
    ultima_mensagem: r.summary ?? "",
    ultima_em: tempoRelativo(r.last_message_at),
    interacoes: r.message_count ?? 0,
    primeiro_contato: dataCurta(r.created_at),
  }));

  const nomeUsuario =
    cliente?.nome || user?.email?.split("@")[0] || "Minha conta";

  return (
    <div className={painel.shell}>
      <Sidebar
        usuario={{ nome: nomeUsuario, plano: "Beta Fundador · Gratuito" }}
      />
      <main className={painel.main}>
        <CrmTabela contatos={contatos} />
      </main>
    </div>
  );
}
