"use client";

import { useState } from "react";
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

  async function toggle() {
    const novo = !ativa;
    setAtiva(novo); // otimista
    setSalvando(true);
    // Persiste o estado liga/desliga na configuração da IA.
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

  return (
    <div
      className={`${styles.statusBanner} ${
        ativa ? styles.statusOn : styles.statusOff
      }`}
    >
      <div className={styles.statusLeft}>
        <div
          className={`${styles.statusDot} ${ativa ? styles.dotOn : styles.dotOff}`}
        />
        <div>
          <div className={styles.statusLabel}>
            {ativa ? "IA Ativa — Atendendo agora" : "IA Pausada"}
          </div>
          <div className={styles.statusSub}>
            {ativa
              ? numeroWhats
                ? `Conectada ao WhatsApp · ${numeroWhats}`
                : "Conecte seu WhatsApp para começar a atender"
              : "As mensagens não estão sendo respondidas automaticamente"}
          </div>
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
