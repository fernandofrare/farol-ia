"use client";

import { Icon } from "@/components/Icon";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { LogoFarol } from "@/components/LogoFarol";
import { useEmbeddedSignup } from "@/lib/useEmbeddedSignup";

// Conexão do WhatsApp — CASO 1 (Tech Provider / Embedded Signup).
// Lógica compartilhada com o wizard /comecar via useEmbeddedSignup.

export default function ConectarPage() {
  const supabase = createClient();
  const { estado, numeroSalvo, erro, enviando, sdkPronto, conectar, carregarStatus } =
    useEmbeddedSignup();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      await carregarStatus();
    })();
  }, [supabase, carregarStatus]);

  const wrap: React.CSSProperties = { maxWidth: 560, margin: "0 auto", padding: "32px 18px" };
  const card: React.CSSProperties = { border: "1px solid var(--line)", borderRadius: 16, padding: 28, background: "var(--bg-soft)" };

  return (
    <main style={{ minHeight: "100vh" }}>
      <div style={wrap}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <LogoFarol width={150} height={43} />
        </div>

        <div style={card}>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>Conexão do WhatsApp</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 18 }}>
            Conecte o número do seu negócio pela conexão oficial da Meta. É rápido e você faz tudo por aqui.
          </p>

          {erro && (
            <div style={{ background: "rgba(255,80,80,.12)", border: "1px solid rgba(255,80,80,.3)", color: "#ff8a8a", padding: "10px 12px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {erro}
            </div>
          )}

          {estado === "carregando" && (
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Verificando o estado da conexão…</p>
          )}

          {estado === "conectando" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(251,122,42,.08)", border: "1px solid rgba(251,122,42,.2)", borderRadius: 12, padding: "14px 16px" }}>
              <Icon name="refresh" size={18} style={{ color: "var(--amber)" }} />
              <div style={{ fontSize: 14 }}>Concluindo a conexão com a Meta…</div>
            </div>
          )}

          {estado === "ativo" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(58,210,159,.12)", border: "1px solid rgba(58,210,159,.33)", borderRadius: 12, padding: "14px 16px" }}>
              <Icon name="check" size={18} style={{ color: "var(--good)" }} />
              <div style={{ fontSize: 14 }}>
                <b>WhatsApp conectado e atendendo.</b>
                {numeroSalvo ? <div style={{ color: "var(--muted)", marginTop: 2 }}>{numeroSalvo}</div> : null}
              </div>
            </div>
          )}

          {estado === "aguardando_nome" && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(245,185,65,.1)", border: "1px solid rgba(245,185,65,.3)", borderRadius: 12, padding: "14px 16px" }}>
              <Icon name="clock" size={18} style={{ color: "var(--gold)", flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 14 }}>
                <b>Quase lá — aprovando o nome do seu negócio.</b>
                <div style={{ color: "var(--muted)", marginTop: 4 }}>
                  Essa etapa leva de 1 a 2 dias e é entre a Meta e o seu negócio — você não precisa fazer nada. Avisamos por e-mail assim que a IA começar a atender.
                </div>
              </div>
            </div>
          )}

          {(estado === "novo" || estado === "erro") && (
            <>
              <div style={{ background: "rgba(251,122,42,.08)", border: "1px solid rgba(251,122,42,.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 18, fontSize: 13, color: "#f0cdb4", display: "flex", gap: 9 }}>
                <Icon name="warning" size={16} style={{ color: "var(--amber)", flexShrink: 0, marginTop: 1 }} />
                <span>Você vai conectar pela <b>Meta</b>, usando a sua própria conta. Use um número <b>dedicado</b> ao atendimento: o número conectado vira exclusivo da IA e sai do app normal do WhatsApp. Se ele já tiver WhatsApp, apague a conta dele antes.</span>
              </div>

              <button className="btn btn-primary" onClick={conectar} disabled={enviando || !sdkPronto} style={{ width: "100%" }}>
                {!sdkPronto ? "Carregando…" : enviando ? "Conectando…" : "Conectar com o WhatsApp"}
              </button>

              <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 12, textAlign: "center" }}>
                Ao continuar, você cria (ou usa) a sua conta no WhatsApp Business pela Meta. A Farol opera o atendimento em seu nome, pela API oficial.
              </p>
            </>
          )}

          <div style={{ marginTop: 18, textAlign: "center" }}>
            <a href="/dashboard" style={{ color: "var(--muted)", fontSize: 13 }}>← Voltar para o painel</a>
          </div>
        </div>
      </div>
    </main>
  );
}
