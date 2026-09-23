"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import painel from "@/components/painel.module.css";
import styles from "./crm.module.css";
import { ChatDrawer } from "./ChatDrawer";

export type Grupo = "lead" | "cliente" | "alerta";

export type Contato = {
  id: string;
  nome: string;
  telefone: string;
  grupo: Grupo;
  controleHumano: boolean;
  ultima_mensagem: string;
  ultima_iso: string | null;
  ultima_em: string;
};

const H24 = 24 * 60 * 60 * 1000;
const PROX: Record<Grupo, Grupo> = { lead: "cliente", cliente: "alerta", alerta: "lead" };
const COR: Record<Grupo, string> = { lead: "#f5b941", cliente: "#3ad29f", alerta: "#ff5a5a" };
const NOME_GRUPO: Record<Grupo, string> = { lead: "Lead", cliente: "Cliente", alerta: "Alerta" };

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

function iniciais(nome: string) {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
}

function subDe(c: Contato): "ia" | "humano" | "frios" {
  if (c.ultima_iso && Date.now() - new Date(c.ultima_iso).getTime() > H24) return "frios";
  if (c.controleHumano) return "humano";
  return "ia";
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

function normGrupo(g: string | null): Grupo {
  return g === "cliente" || g === "alerta" ? g : "lead";
}

export function CrmTabela({
  contatos,
  clientId,
}: {
  contatos: Contato[];
  clientId?: string;
}) {
  const supabase = createClient();
  const [lista, setLista] = useState<Contato[]>(contatos);
  const [grupoSel, setGrupoSel] = useState<Grupo>("lead");
  const [sub, setSub] = useState<"ia" | "humano" | "frios">("ia");
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<Contato | null>(null);

  const recarregar = useCallback(async () => {
    if (!clientId) return;
    const { data } = await supabase
      .from("conversations")
      .select("id, contact_name, contact_phone, status, grupo, summary, last_message_at")
      .eq("client_id", clientId)
      .order("last_message_at", { ascending: false });
    if (!data) return;
    const rows = data as Row[];
    setLista(
      rows.map((r) => ({
        id: r.id,
        nome: r.contact_name ?? "Sem nome",
        telefone: r.contact_phone ?? "",
        grupo: normGrupo(r.grupo),
        controleHumano: r.status === "human",
        ultima_mensagem: r.summary ?? "",
        ultima_iso: r.last_message_at ?? null,
        ultima_em: tempoRelativo(r.last_message_at ?? null),
      }))
    );
  }, [clientId, supabase]);

  useEffect(() => {
    const t = setInterval(recarregar, 8000);
    return () => clearInterval(t);
  }, [recarregar]);

  async function mudarGrupo(c: Contato) {
    const novo = PROX[c.grupo];
    setLista((prev) => prev.map((x) => (x.id === c.id ? { ...x, grupo: novo } : x)));
    try {
      await fetch("/api/crm/grupo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: c.id, grupo: novo }),
      });
    } catch {
      /* silencioso; a proxima sincronizacao corrige */
    }
  }

  const doGrupo = useMemo(
    () => lista.filter((c) => c.grupo === grupoSel),
    [lista, grupoSel]
  );

  const cont = useMemo(() => {
    const c = { ia: 0, humano: 0, frios: 0 };
    doGrupo.forEach((x) => {
      c[subDe(x)]++;
    });
    return c;
  }, [doGrupo]);

  const filtrados = useMemo(() => {
    let l = doGrupo;
    if (grupoSel !== "alerta") l = l.filter((c) => subDe(c) === sub);
    if (busca.trim()) {
      const q = busca.toLowerCase();
      l = l.filter((c) => c.nome.toLowerCase().includes(q) || c.telefone.includes(q));
    }
    return l;
  }, [doGrupo, grupoSel, sub, busca]);

  const GRUPOS: { id: Grupo; label: string }[] = [
    { id: "lead", label: "Leads" },
    { id: "cliente", label: "Clientes" },
    { id: "alerta", label: "Alerta" },
  ];

  const SUBS: { id: "ia" | "humano" | "frios"; label: string }[] = [
    { id: "ia", label: "🤖 Assistente IA (" + cont.ia + ")" },
    { id: "humano", label: "🙋 Assistente Humano (" + cont.humano + ")" },
    { id: "frios", label: "❄️ Frios (" + cont.frios + ")" },
  ];

  return (
    <>
      <div className={painel.topbar}>
        <h1>Atendimento</h1>
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
        </div>
      </div>

      <div className={styles.groupTabs}>
        {GRUPOS.map((g) => (
          <button
            key={g.id}
            className={styles.groupTab + (grupoSel === g.id ? " " + styles.groupTabActive : "")}
            onClick={() => setGrupoSel(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>

      {grupoSel !== "alerta" && (
        <div className={styles.filters}>
          {SUBS.map((s) => (
            <button
              key={s.id}
              className={styles.filterChip + (sub === s.id ? " " + styles.filterActive : "")}
              onClick={() => setSub(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div className={styles.convList}>
        {filtrados.length === 0 ? (
          <div className={styles.emptyTable}>Nenhuma conversa nesta aba.</div>
        ) : (
          filtrados.map((c) => (
            <div
              key={c.id}
              className={styles.convRow}
              role="button"
              tabIndex={0}
              onClick={() => setAberto(c)}
            >
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  mudarGrupo(c);
                }}
                title={"Grupo: " + NOME_GRUPO[c.grupo] + " — clique para alternar (Lead / Cliente / Alerta)"}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: COR[c.grupo],
                  border: "2px solid rgba(255,255,255,.18)",
                  flexShrink: 0,
                  cursor: "pointer",
                }}
              />
              <div className={styles.convAv}>{iniciais(c.nome)}</div>
              <div className={styles.convMid}>
                <div className={styles.convName}>{c.nome}</div>
                <div className={styles.convPreview}>{c.ultima_mensagem || c.telefone}</div>
              </div>
              <div className={styles.convTime}>{c.ultima_em}</div>
            </div>
          ))
        )}
      </div>

      {aberto && (
        <ChatDrawer
          conversationId={aberto.id}
          nome={aberto.nome}
          telefone={aberto.telefone}
          controleHumano={aberto.controleHumano}
          onClose={() => setAberto(null)}
          onTakeover={(humano) => {
            setLista((prev) =>
              prev.map((x) => (x.id === aberto.id ? { ...x, controleHumano: humano } : x))
            );
            setAberto((a) => (a ? { ...a, controleHumano: humano } : a));
          }}
        />
      )}
    </>
  );
}
