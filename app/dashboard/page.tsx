import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { Sidebar } from "@/components/Sidebar";
import { StatusBanner } from "./StatusBanner";
import painel from "@/components/painel.module.css";
import styles from "./dashboard.module.css";

export const metadata = { title: "Dashboard — Farol IA" };

// Formata "há X min" a partir de um timestamp.
function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Client do usuário (nome do negócio, instância, IA ativa).
  const { data: cliente } = await supabase
    .from("clients")
    .select("id, nome, ia_active, evolution_instance")
    .eq("user_id", user?.id)
    .maybeSingle();

  const clientId = cliente?.id;

  // Conversas recentes para o painel (últimas 5) — via client_id.
  const { data: conversas } = clientId
    ? await supabase
        .from("conversations")
        .select("id, contact_name, summary, last_message_at, message_count")
        .eq("client_id", clientId)
        .order("last_message_at", { ascending: false })
        .limit(5)
    : { data: [] };

  // Métricas (fallback 0 enquanto não há dados).
  const hojeInicio = new Date();
  hojeInicio.setHours(0, 0, 0, 0);
  const { count: conversasHoje } = clientId
    ? await supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientId)
        .gte("last_message_at", hojeInicio.toISOString())
    : { count: 0 };

  const { count: usoMes } = clientId
    ? await supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientId)
    : { count: 0 };

  // Normaliza para o formato que o componente já espera.
  const config = {
    ativa: cliente?.ia_active ?? false,
    numero_whatsapp: cliente?.evolution_instance ?? null,
    nome_negocio: cliente?.nome ?? null,
  };
  const listaConversas = (conversas ?? []).map((c) => ({
    id: c.id,
    nome_contato: c.contact_name ?? "Contato",
    ultima_mensagem: c.summary ?? "",
    atualizada_em: c.last_message_at ?? new Date().toISOString(),
    nao_lidas: 0,
  }));

  const nomeUsuario =
    config.nome_negocio || user?.email?.split("@")[0] || "Minha conta";

  return (
    <div className={painel.shell}>
      <Sidebar
        usuario={{ nome: nomeUsuario, plano: "Beta Fundador · Gratuito" }}
      />

      <main className={painel.main}>
        <div className={painel.topbar}>
          <h1>Dashboard</h1>
          <div className={painel.topbarRight}>
            <div className={styles.notifBtn} title="Notificações">
              🔔<span className={styles.notifDot} />
            </div>
            <Link
              href="/minha-ia"
              className={`${painel.btn} ${painel.btnPrimary}`}
            >
              ⚙️ Configurar IA
            </Link>
          </div>
        </div>

        <div className={painel.content}>
          <StatusBanner
            ativaInicial={config?.ativa ?? false}
            numeroWhats={config?.numero_whatsapp ?? null}
          />

          {/* MÉTRICAS */}
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <div className={styles.metricTop}>
                <span className={styles.metricLabel}>Conversas hoje</span>
                <div
                  className={styles.metricIco}
                  style={{ background: "rgba(255,138,61,.1)" }}
                >
                  💬
                </div>
              </div>
              <div className={styles.metricVal}>{conversasHoje ?? 0}</div>
              <div className={styles.metricDeltaMuted}>atendimentos de hoje</div>
            </div>

            <div className={styles.metric}>
              <div className={styles.metricTop}>
                <span className={styles.metricLabel}>Conversas no total</span>
                <div
                  className={styles.metricIco}
                  style={{ background: "rgba(58,210,159,.1)" }}
                >
                  🎯
                </div>
              </div>
              <div className={styles.metricVal}>{usoMes ?? 0}</div>
              <div className={styles.metricDeltaMuted}>contatos atendidos</div>
            </div>

            <div className={styles.metric}>
              <div className={styles.metricTop}>
                <span className={styles.metricLabel}>Status da IA</span>
                <div
                  className={styles.metricIco}
                  style={{ background: "rgba(245,185,65,.1)" }}
                >
                  ⚡
                </div>
              </div>
              <div className={styles.metricVal} style={{ fontSize: 22 }}>
                {config?.ativa ? "Ativa" : "Pausada"}
              </div>
              <div className={styles.metricDeltaMuted}>
                {config?.numero_whatsapp ? "WhatsApp conectado" : "Sem conexão"}
              </div>
            </div>

            <div className={styles.metric}>
              <div className={styles.metricTop}>
                <span className={styles.metricLabel}>Uso do mês</span>
                <div
                  className={styles.metricIco}
                  style={{ background: "rgba(154,154,166,.1)" }}
                >
                  📈
                </div>
              </div>
              <div className={styles.metricVal}>{usoMes ?? 0}</div>
              <div className={styles.metricDeltaMuted}>de 2.000 incluídas</div>
            </div>
          </div>

          {/* CONVERSAS + AÇÕES */}
          <div className={styles.grid2}>
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <span className={styles.panelTitle}>Conversas recentes</span>
                <Link href="/crm" className={styles.seeAll}>
                  Ver todas →
                </Link>
              </div>
              <div className={styles.panelBody}>
                {listaConversas.length === 0 ? (
                  <div className={styles.emptyState}>
                    Nenhuma conversa ainda. Assim que sua IA começar a
                    responder, os atendimentos aparecem aqui.
                  </div>
                ) : (
                  listaConversas.map((c) => (
                    <div key={c.id} className={styles.conv}>
                      <div className={styles.convAv}>👤</div>
                      <div className={styles.convInfo}>
                        <div className={styles.convName}>{c.nome_contato}</div>
                        <div className={styles.convMsg}>{c.ultima_mensagem}</div>
                      </div>
                      <div className={styles.convMeta}>
                        <div className={styles.convTime}>
                          {tempoRelativo(c.atualizada_em)}
                        </div>
                        {c.nao_lidas > 0 && (
                          <div className={styles.convBadge}>{c.nao_lidas}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className={styles.panelFoot}>
                <Link
                  href="/crm"
                  className={`${painel.btn} ${painel.btnGhost}`}
                  style={{ width: "100%" }}
                >
                  Ver todas as conversas
                </Link>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <span className={styles.panelTitle}>Ações rápidas</span>
              </div>
              <div className={styles.actions}>
                <Link href="/minha-ia" className={styles.actionBtn}>
                  <span className={styles.actionIco}>🤖</span>
                  <div className={styles.actionInfo}>
                    <div className={styles.actionTitle}>Treinar minha IA</div>
                    <div className={styles.actionSub}>
                      Atualizar respostas e informações
                    </div>
                  </div>
                  <span className={styles.actionArr}>→</span>
                </Link>
                <Link href="/crm" className={styles.actionBtn}>
                  <span className={styles.actionIco}>🎯</span>
                  <div className={styles.actionInfo}>
                    <div className={styles.actionTitle}>Ver contatos</div>
                    <div className={styles.actionSub}>
                      Seus leads e atendimentos
                    </div>
                  </div>
                  <span className={styles.actionArr}>→</span>
                </Link>
                <Link href="/minha-ia" className={styles.actionBtn}>
                  <span className={styles.actionIco}>📱</span>
                  <div className={styles.actionInfo}>
                    <div className={styles.actionTitle}>Conectar WhatsApp</div>
                    <div className={styles.actionSub}>
                      Escanear o QR Code da Evolution
                    </div>
                  </div>
                  <span className={styles.actionArr}>→</span>
                </Link>
                <Link href="/assinatura" className={styles.actionBtn}>
                  <span className={styles.actionIco}>💳</span>
                  <div className={styles.actionInfo}>
                    <div className={styles.actionTitle}>Minha assinatura</div>
                    <div className={styles.actionSub}>
                      Beta Fundador · gratuito
                    </div>
                  </div>
                  <span className={styles.actionArr}>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
