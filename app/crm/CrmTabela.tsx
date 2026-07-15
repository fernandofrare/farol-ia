"use client";

import { useState, useMemo } from "react";
import painel from "@/components/painel.module.css";
import styles from "./crm.module.css";

export type Contato = {
  id: string;
  nome: string;
  telefone: string;
  status: "lead" | "cliente" | "frio" | "novo";
  controleHumano?: boolean;
  ultima_mensagem: string;
  ultima_em: string;
  interacoes: number;
  primeiro_contato: string;
};

const STATUS_MAP: Record<
  Contato["status"],
  { label: string; cls: string; cor: string }
> = {
  lead: { label: "Lead", cls: "bLead", cor: "#f5b941" },
  cliente: { label: "Cliente", cls: "bCliente", cor: "#3ad29f" },
  frio: { label: "Frio", cls: "bFrio", cor: "#6a6a74" },
  novo: { label: "Novo", cls: "bNovo", cor: "#ff8a3d" },
};

function iniciais(nome: string) {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function CrmTabela({ contatos }: { contatos: Contato[] }) {
  const [filtro, setFiltro] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<Contato | null>(null);
  const [takeoverLoading, setTakeoverLoading] = useState(false);

  async function alternarTakeover(contato: Contato) {
    setTakeoverLoading(true);
    const novoHumano = !contato.controleHumano;
    try {
      const resp = await fetch("/api/takeover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: contato.id,
          humano: novoHumano,
        }),
      });
      if (resp.ok) {
        // Atualiza o contato aberto no painel.
        setAberto((a) =>
          a && a.id === contato.id ? { ...a, controleHumano: novoHumano } : a
        );
      }
    } catch {
      // silencioso; o usuário pode tentar de novo
    } finally {
      setTakeoverLoading(false);
    }
  }

  const stats = useMemo(() => {
    return {
      total: contatos.length,
      leads: contatos.filter((c) => c.status === "lead").length,
      clientes: contatos.filter((c) => c.status === "cliente").length,
      novos: contatos.filter((c) => c.status === "novo").length,
      frios: contatos.filter((c) => c.status === "frio").length,
    };
  }, [contatos]);

  const filtrados = useMemo(() => {
    let lista = contatos;
    if (filtro !== "todos") lista = lista.filter((c) => c.status === filtro);
    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(
        (c) =>
          c.nome.toLowerCase().includes(q) || c.telefone.includes(q)
      );
    }
    return lista;
  }, [contatos, filtro, busca]);

  const CHIPS = [
    { id: "todos", label: `Todos (${stats.total})` },
    { id: "lead", label: `🔥 Leads (${stats.leads})` },
    { id: "cliente", label: `✅ Clientes (${stats.clientes})` },
    { id: "novo", label: `🆕 Novos (${stats.novos})` },
    { id: "frio", label: `❄️ Frios (${stats.frios})` },
  ];

  return (
    <>
      <div className={painel.topbar}>
        <h1>Contatos &amp; CRM</h1>
        <div className={painel.topbarRight}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIco}>🔍</span>
            <input
              className={styles.search}
              placeholder="Buscar contato..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <button className={styles.btnGhostSm}>⬇️ Exportar</button>
        </div>
      </div>

      {/* MÉTRICAS */}
      <div className={styles.crmStats}>
        <div className={styles.crmStat}>
          <div className={styles.crmStatVal}>{stats.total}</div>
          <div className={styles.crmStatLbl}>Total contatos</div>
        </div>
        <div className={styles.crmStat}>
          <div className={styles.crmStatVal} style={{ color: "var(--amber)" }}>
            {stats.leads}
          </div>
          <div className={styles.crmStatLbl}>Leads quentes</div>
        </div>
        <div className={styles.crmStat}>
          <div className={styles.crmStatVal} style={{ color: "var(--good)" }}>
            {stats.clientes}
          </div>
          <div className={styles.crmStatLbl}>Clientes ativos</div>
        </div>
        <div className={styles.crmStat}>
          <div className={styles.crmStatVal} style={{ color: "var(--gold)" }}>
            {stats.novos}
          </div>
          <div className={styles.crmStatLbl}>Novos</div>
        </div>
      </div>

      {/* FILTROS */}
      <div className={styles.filters}>
        {CHIPS.map((chip) => (
          <button
            key={chip.id}
            className={`${styles.filterChip} ${
              filtro === chip.id ? styles.filterActive : ""
            }`}
            onClick={() => setFiltro(chip.id)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* TABELA */}
      <div className={styles.tableWrap}>
        {filtrados.length === 0 ? (
          <div className={styles.emptyTable}>
            {contatos.length === 0
              ? "Nenhum contato ainda. Quando sua IA atender alguém no WhatsApp, o contato aparece aqui automaticamente."
              : "Nenhum contato corresponde a esse filtro."}
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Contato</th>
                <th>Status</th>
                <th>Última mensagem</th>
                <th>Interações</th>
                <th>Primeiro contato</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => {
                const s = STATUS_MAP[c.status];
                return (
                  <tr key={c.id} onClick={() => setAberto(c)}>
                    <td>
                      <div className={styles.contactCell}>
                        <div
                          className={styles.contactAv}
                          style={{ background: `${s.cor}22`, color: s.cor }}
                        >
                          {iniciais(c.nome)}
                        </div>
                        <div>
                          <div className={styles.contactName}>{c.nome}</div>
                          <div className={styles.contactPhone}>{c.telefone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles[s.cls]}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className={styles.lastMsg}>{c.ultima_mensagem}</td>
                    <td className={styles.tdMuted}>{c.interacoes} msgs</td>
                    <td className={styles.tdTime}>{c.primeiro_contato}</td>
                    <td>
                      <div className={styles.tdAction}>
                        <div className={styles.iconBtn} title="Abrir chat">
                          💬
                        </div>
                        <div className={styles.iconBtn} title="Ver histórico">
                          📋
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* PAINEL LATERAL */}
      <div
        className={`${styles.contactPanel} ${aberto ? styles.panelOpen : ""}`}
      >
        <div className={styles.cpHead}>
          <h3>Detalhes do contato</h3>
          <button className={styles.closeBtn} onClick={() => setAberto(null)}>
            ✕
          </button>
        </div>
        {aberto && (
          <>
            <div className={styles.cpBody}>
              <div
                className={styles.cpAv}
                style={{
                  background: `${STATUS_MAP[aberto.status].cor}22`,
                  color: STATUS_MAP[aberto.status].cor,
                }}
              >
                {iniciais(aberto.nome)}
              </div>
              <div className={styles.cpName}>{aberto.nome}</div>
              <div className={styles.cpPhone}>{aberto.telefone}</div>
              <div className={styles.cpBadges}>
                <span
                  className={`${styles.badge} ${
                    styles[STATUS_MAP[aberto.status].cls]
                  }`}
                >
                  {STATUS_MAP[aberto.status].label}
                </span>
              </div>
              <div className={styles.cpSection}>
                <h4>Informações</h4>
                <div className={styles.cpRow}>
                  <span className={styles.lbl}>Primeiro contato</span>
                  <span>{aberto.primeiro_contato}</span>
                </div>
                <div className={styles.cpRow}>
                  <span className={styles.lbl}>Interações</span>
                  <span>{aberto.interacoes} mensagens</span>
                </div>
                <div className={styles.cpRow}>
                  <span className={styles.lbl}>Última mensagem</span>
                  <span>{aberto.ultima_em}</span>
                </div>
              </div>
            </div>
            <div className={styles.cpFoot}>
              <button
                className={`${painel.btn} ${painel.btnGhost}`}
                onClick={() => alternarTakeover(aberto)}
                disabled={takeoverLoading}
              >
                {aberto.controleHumano
                  ? "🤖 Devolver p/ IA"
                  : "🙋 Assumir conversa"}
              </button>
              <button className={`${painel.btn} ${painel.btnPrimary}`}>
                💬 Abrir chat
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
