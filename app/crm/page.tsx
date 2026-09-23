import { createClient } from "@/lib/supabase-server";
import { Sidebar } from "@/components/Sidebar";
import { CrmTabela, type Contato } from "./CrmTabela";
import painel from "@/components/painel.module.css";

export const metadata = { title: "Atendimento — Farol IA" };

function tempoRelativo(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Agora";
  if (min < 60) return min + " min";
  const h = Math.floor(min / 60);
  if (h < 24) return h + "h";
  return Math.floor(h / 24) + "d";
}

type Row = {
  id: string;
  contact_name: string | null;
  contact_phone: string | null;
  status: string | null;
  grupo: string | null;
  summary: string | null;
  last_message_at: string | null;
};

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

  const clientId = cliente?.id as string | undefined;

  const { data: rows } = clientId
    ? await supabase
        .from("conversations")
        .select("id, contact_name, contact_phone, status, grupo, summary, last_message_at")
        .eq("client_id", clientId)
        .order("last_message_at", { ascending: false })
    : { data: [] };

  const contatos: Contato[] = ((rows ?? []) as Row[]).map((r) => ({
    id: r.id,
    nome: r.contact_name ?? "Sem nome",
    telefone: r.contact_phone ?? "",
    grupo: (r.grupo === "cliente" || r.grupo === "alerta" ? r.grupo : "lead") as
      | "lead"
      | "cliente"
      | "alerta",
    controleHumano: r.status === "human",
    ultima_mensagem: r.summary ?? "",
    ultima_iso: r.last_message_at ?? null,
    ultima_em: tempoRelativo(r.last_message_at ?? null),
  }));

  const nomeUsuario =
    cliente?.nome || user?.email?.split("@")[0] || "Minha conta";

  return (
    <div className={painel.shell}>
      <Sidebar
        usuario={{ nome: nomeUsuario, plano: "Beta Fundador · Gratuito" }}
      />
      <main className={painel.main}>
        <CrmTabela contatos={contatos} clientId={clientId} />
      </main>
    </div>
  );
}
