"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import styles from "./dashboard.module.css";

export function StatusBanner({
  ativaInicial,
  numeroWhats,
}: {
  ativaInicial: boolean;
  numeroWhats: string | null;
}) {
  const supabase = createClient();
  const [ativa, setAtiva] = useState(ativaInicial);
  const [salvando, setSalvando] = useState(false);
  // Estado REAL da conexão (não basta ter um nome de instância salvo).
  const [conn, setConn] = useState<string>("verificando");

  // Checa a conexão de verdade na Evolution (via motor), ao montar.
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const r = await fetch("/api/whatsapp/status");
        const d = await r.json();
        if (vivo) setConn(d.state || "desconhecido");
      } catch {
        if (vivo) setConn("desconhecido");
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const conectado = conn === "open";

  async function toggle() {
    const novo = !ativa;
    setAtiva(novo); // otimista
    setSalvando(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("clients")
        .update({ ia_active: novo })
        .eq("user_id", user.id);
    }
    setSalvando(false);
  }

  // Sub-texto conforme o estado real da conexão.
  let sub: React.ReactNode;
  if (conn === "verificando") {
    sub = "Verificando a conexão do WhatsApp…";
  } else if (conectado) {
    sub = ativa
      ? `Conectada ao WhatsApp${numeroWhats ? ` · ${numeroWhats}` : ""}`
      : "As mensagens não estão sendo respondidas automaticamente";
  } else {
    // Desconectado (ou nunca conectado): AVISA e oferece reconectar.
    sub = (
      <>
        ⚠️ Nenhum celular conectado — as mensagens não chegam.{" "}
        <Link href="/conectar" style={{ color: "inherit", textDecoration: "underline" }}>
          {numeroWhats ? "Reconectar agora" : "Conectar WhatsApp"}
        </Link>
      </>
    );
  }

  // Se está desconectado, força a aparência de "off" (alerta), mesmo com IA ligada.
  const aparenciaOn = ativa && conectado;

  return (
    <div
      className={`${styles.statusBanner} ${
        aparenciaOn ? styles.statusOn : styles.statusOff
      }`}
    >
      <div className={styles.statusLeft}>
        <div
          className={`${styles.statusDot} ${
            aparenciaOn ? styles.dotOn : styles.dotOff
          }`}
        />
        <div>
          <div className={styles.statusLabel}>
            {!conectado
              ? "WhatsApp desconectado"
              : ativa
              ? "IA Ativa — Atendendo agora"
              : "IA Pausada"}
          </div>
          <div className={styles.statusSub}>{sub}</div>
        </div>
      </div>
      <div className={styles.toggleWrap}>
        <span>{ativa ? "Desligar IA" : "Ligar IA"}</span>
        <label className={styles.toggle} title="Ligar/Desligar IA">
          <input
            type="checkbox"
            checked={ativa}
            onChange={toggle}
            disabled={salvando}
          />
          <div className={styles.toggleTrack} />
          <div className={styles.toggleThumb} />
        </label>
      </div>
    </div>
  );
}
