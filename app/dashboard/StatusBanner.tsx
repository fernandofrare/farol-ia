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
  const [erro, setErro] = useState<string | null>(null);

  async function toggle() {
    const novo = !ativa;
    setAtiva(novo); // otimista
    setSalvando(true);
    setErro(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let ok = false;
    if (user) {
      // .select() devolve as linhas afetadas: se vier vazio, o update nao
      // persistiu (ex.: RLS bloqueou) e precisamos reverter a tela.
      const { data, error } = await supabase
        .from("clients")
        .update({ ia_active: novo })
        .eq("user_id", user.id)
        .select("id");
      ok = !error && Array.isArray(data) && data.length > 0;
    }

    if (!ok) {
      setAtiva(!novo); // reverte o otimista
      setErro("Nao foi possivel salvar. Tente novamente.");
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
            {erro
              ? erro
              : ativa
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
