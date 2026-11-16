"use client";

import { useRef, useState } from "react";
import painel from "@/components/painel.module.css";
import styles from "./minhaia.module.css";
import { Icon } from "@/components/Icon";

type Msg = { role: "user" | "assistant"; content: string };

// DEMO "Teste sua IA" — chat real com a própria IA treinada no negócio.
// Conversa com o motor (mesma geração do atendimento), SEM Meta. O histórico
// vive só no estado do React (não grava em conversations/messages). O limite de
// mensagens é aplicado no motor; aqui só refletimos o `remaining` que ele devolve.
export function TesteIA({
  nomeNegocio,
  nomeIa,
}: {
  nomeNegocio?: string;
  nomeIa?: string;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [restantes, setRestantes] = useState<number | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  const fimRef = useRef<HTMLDivElement | null>(null);

  function rolar() {
    requestAnimationFrame(() => fimRef.current?.scrollIntoView({ behavior: "smooth" }));
  }

  async function enviar() {
    const texto = input.trim();
    if (!texto || carregando || bloqueado) return;

    const novo: Msg[] = [...msgs, { role: "user", content: texto }];
    setMsgs(novo);
    setInput("");
    setErro(null);
    setCarregando(true);
    rolar();

    try {
      const r = await fetch("/api/demo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: novo }),
      });
      const data = await r.json().catch(() => ({}));

      if (r.status === 429 || data?.limite) {
        setBloqueado(true);
        setRestantes(0);
        setErro("Você atingiu o limite de mensagens de teste. Conecte seu WhatsApp para atender de verdade.");
        return;
      }
      if (!r.ok || typeof data?.reply !== "string") {
        setErro(data?.erro || "Não consegui responder agora. Tente de novo.");
        return;
      }

      setMsgs((m) => [...m, { role: "assistant", content: data.reply }]);
      if (typeof data.remaining === "number") {
        setRestantes(data.remaining);
        if (data.remaining <= 0) setBloqueado(true);
      }
      rolar();
    } catch {
      setErro("Falha de conexão. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.ico}>
          <Icon name="chat" size={19} />
        </div>
        <div className={styles.cardHeadText}>
          <h2>Teste sua IA</h2>
          <p>Converse agora com a sua IA, treinada no seu negócio — sem precisar conectar o WhatsApp</p>
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.previewChat}>
          <div className={styles.previewHead}>
            <div className={styles.waDot} />
            {nomeNegocio || "Seu negócio"}
            {nomeIa ? ` · ${nomeIa}` : ""}
          </div>

          <div className={styles.previewMsgs}>
            {msgs.length === 0 && (
              <div className={`${styles.msg} ${styles.msgIa}`}>
                Manda uma mensagem como se você fosse um cliente — eu respondo do jeito que fui treinada.
              </div>
            )}

            {msgs.map((m, i) => (
              <div
                key={i}
                className={`${styles.msg} ${m.role === "user" ? styles.msgC : styles.msgIa}`}
              >
                {m.content}
              </div>
            ))}

            {carregando && (
              <div className={`${styles.msg} ${styles.msgIa}`}>digitando…</div>
            )}

            <div ref={fimRef} />
          </div>
        </div>

        {erro && <p className={styles.hint}>{erro}</p>}

        <div className={styles.row} style={{ marginTop: 12, gap: 8 }}>
          <input
            className={styles.input}
            placeholder={bloqueado ? "Limite de teste atingido" : "Escreva como um cliente…"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            disabled={carregando || bloqueado}
            maxLength={2000}
          />
          <button
            className={`${painel.btn} ${painel.btnPrimary} ${styles.btnSm}`}
            onClick={enviar}
            disabled={carregando || bloqueado || !input.trim()}
          >
            {carregando ? "…" : "Enviar"}
          </button>
        </div>

        <p className={styles.hint} style={{ marginTop: 8 }}>
          {restantes !== null
            ? `Mensagens de teste restantes: ${restantes}`
            : "O teste usa a configuração salva. Salve antes de testar para ver as mudanças."}
        </p>
      </div>
    </section>
  );
}
