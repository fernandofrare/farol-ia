import { createClient } from "@/lib/supabase-server";
import { Sidebar } from "@/components/Sidebar";
import { EditorIA } from "./EditorIA";
import { type ConfigIA } from "@/lib/config-ia";
import { clientParaConfig, type ClientRow } from "@/lib/map-client";
import painel from "@/components/painel.module.css";

export const metadata = { title: "Minha IA — Farol IA" };

export default async function MinhaIAPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("clients")
    .select(
      "nome, segment, tone, assistant_name, services, schedule, payment, scheduling_info, collect_data, welcome_message, off_hours_message, ia_active, evolution_instance"
    )
    .eq("user_id", user?.id)
    .maybeSingle();

  // Traduz as colunas reais de clients para o formato da UI.
  const inicial: ConfigIA = clientParaConfig(data as ClientRow);

  const nomeUsuario =
    inicial.nome_negocio || user?.email?.split("@")[0] || "Minha conta";

  return (
    <div className={painel.shell}>
      <Sidebar usuario={{ nome: nomeUsuario, plano: "Beta Fundador · Gratuito" }} />
      <main className={painel.main}>
        <EditorIA inicial={inicial} />
      </main>
    </div>
  );
}
