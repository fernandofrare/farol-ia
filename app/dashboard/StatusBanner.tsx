"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import styles from "./dashboard.module.css";
import { Icon } from "@/components/Icon";

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
  // Estado REAL da conexão, pela Meta (onboarding_status do número).
  const [conn, setConn] = useState<string>("verificando");

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const r = await fetch("/api/whatsapp/meta/status");
        const d = await r.json();
        if (vivo) setConn(d.onboarding_status || "novo");
      } catch {
        if (vivo) setConn("desconhecido");
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const conectado = conn === "ativo";
  const emAprovacao = conn === "aguardando_nome";

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
  } else if (emAprovacao) {
    sub = (
      <>
        <Icon name="clock" size={15} style={{ verticalAlign: "-2px", marginRight: 4 }} />
        Número em aprovação pela Meta (1 a 2 dias). Avisamos quando ficar pronto.
      </>
    );
  } else {
    // Desconectado (ou nunca conectado): AVISA e oferece reconectar.
    sub = (
      <>
        <Icon name="warning" size={15} style={{ verticalAlign: "-2px", marginRight: 4 }} />
        Nenhum celular conectado — as mensagens não chegam.{" "}
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
            {emAprovacao
              ? "Número em aprovação"
              : !conectado
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
