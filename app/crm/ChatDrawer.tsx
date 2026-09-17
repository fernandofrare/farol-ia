"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";

type Msg = {
  id: string;
  role: string;
  content: string;
  is_ai: boolean | null;
  created_at: string | null;
};

function hora(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatDrawer({
  conversationId,
  nome,
  telefone,
  controleHumano,
  onClose,
  onTakeover,
}: {
  conversationId: string;
  nome: string;
  telefone: string;
  controleHumano: boolean;
  onClose: () => void;
  onTakeover: (humano: boolean) => void;
}) {
  const supabase = createClient();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [humano, setHumano] = useState(controleHumano);
  const [erro, setErro] = useState("");
  const fimRef = useRef<HTMLDivElement>(null);

  const carregar = useCallback(async () => {
    const { data } = await supabase
      .from("messages")
      .select("id, role, content, is_ai, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    setMsgs(data ?? []);
    setCarregando(false);
  }, [conversationId, supabase]);

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 4000);
    return () => clearInterval(t);
  }, [carregar]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  async function enviar() {
    const t = texto.trim();
    if (!t || enviando) return;
    setEnviando(true);
    setErro("");
    try {
      const r = await fetch("/api/crm/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, text: t }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data?.ok) throw new Error(data?.erro || "Falha ao enviar.");
      setTexto("");
      if (!humano) {
        setHumano(true);
        onTakeover(true);
      }
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar.");
    } finally {
      setEnviando(false);
    }
  }

  async function alternarIa() {
    const novo = !humano;
    try {
      const r = await fetch("/api/takeover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, humano: novo }),
      });
      if (r.ok) {
        setHumano(novo);
        onTakeover(novo);
      }
    } catch {
      /* silencioso */
    }
  }

  const overlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    zIndex: 60,
    display: "flex",
    justifyContent: "flex-end",
  };
  const panel: React.CSSProperties = {
    width: "min(480px, 100%)",
    height: "100%",
    background: "#14141b",
    borderLeft: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    boxShadow: "-12px 0 40px rgba(0,0,0,0.4)",
  };
  const head: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  };
  const av: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "rgba(58,210,159,0.15)",
    color: "#3ad29f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 15,
  };
  const body: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background:
      "repeating-linear-gradient(45deg, #101017, #101017 12px, #12121a 12px, #12121a 24px)",
  };
  const foot: React.CSSProperties = {
    borderTop: "1px solid rgba(255,255,255,0.08)",
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  };

  function bolha(m: Msg) {
    const saida = m.role === "assistant";
    const daIa = saida && m.is_ai === true;
    const wrap: React.CSSProperties = {
      alignSelf: saida ? "flex-end" : "flex-start",
      maxWidth: "78%",
    };
    const bal: React.CSSProperties = {
      padding: "9px 12px",
      borderRadius: 14,
      fontSize: 14,
      lineHeight: 1.4,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      color: saida ? "#06231a" : "#e8e8ee",
      background: saida ? "#3ad29f" : "#23232e",
      borderBottomRightRadius: saida ? 4 : 14,
      borderBottomLeftRadius: saida ? 14 : 4,
    };
    const meta: React.CSSProperties = {
      fontSize: 11,
      color: "rgba(255,255,255,0.4)",
      marginTop: 3,
      textAlign: saida ? "right" : "left",
    };
    return (
      <div key={m.id} style={wrap}>
        <div style={bal}>{m.content}</div>
        <div style={meta}>
          {saida ? (daIa ? "🤖 IA" : "🙋 Você") : "Cliente"} · {hora(m.created_at)}
        </div>
      </div>
    );
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <div style={head}>
          <div style={av}>
            {(nome.trim()[0] || "?").toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: "#fff" }}>{nome}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              {telefone}
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              padding: "4px 9px",
              borderRadius: 20,
              fontWeight: 600,
              background: humano
                ? "rgba(245,185,65,0.15)"
                : "rgba(58,210,159,0.15)",
              color: humano ? "#f5b941" : "#3ad29f",
            }}
          >
            {humano ? "🙋 Você atende" : "🤖 IA atende"}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div style={body}>
          {carregando ? (
            <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 20 }}>
              Carregando conversa…
            </div>
          ) : msgs.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 20 }}>
              Nenhuma mensagem ainda nesta conversa.
            </div>
          ) : (
            msgs.map(bolha)
          )}
          <div ref={fimRef} />
        </div>

        <div style={foot}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 12,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            <span>
              {humano
                ? "IA pausada nesta conversa. Você está atendendo."
                : "A IA está atendendo. Ao enviar, você assume a conversa."}
            </span>
            <button
              onClick={alternarIa}
              style={{
                background: "none",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.8)",
                borderRadius: 8,
                padding: "5px 10px",
                fontSize: 12,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {humano ? "🤖 Devolver p/ IA" : "🙋 Assumir"}
            </button>
          </div>

          {erro && (
            <div style={{ color: "#ff6b6b", fontSize: 12 }}>{erro}</div>
          )}

          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviar();
                }
              }}
              placeholder="Escreva uma mensagem…"
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                maxHeight: 120,
                background: "#1c1c26",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                color: "#fff",
                padding: "10px 12px",
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <button
              onClick={enviar}
              disabled={enviando || !texto.trim()}
              style={{
                background: enviando || !texto.trim() ? "#2a2a35" : "#3ad29f",
                color: enviando || !texto.trim() ? "rgba(255,255,255,0.4)" : "#06231a",
                border: "none",
                borderRadius: 10,
                padding: "10px 16px",
                fontWeight: 700,
                fontSize: 14,
                cursor: enviando || !texto.trim() ? "default" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {enviando ? "…" : "Enviar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
