"use client";

import { Icon } from "@/components/Icon";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { LogoFarol } from "@/components/LogoFarol";

// Conexão do WhatsApp — CASO 2 (número do cliente numa WABA da empresa).
// O cliente NÃO cria conta Meta nem cadastra cartão: informa o número + nome,
// confirma o código que chega no celular, e espera a liberação do nome (1-2 dias).

type Estado = "carregando" | "novo" | "verificando" | "aguardando_nome" | "ativo" | "erro";

export default function ConectarPage() {
  const supabase = createClient();
  const [estado, setEstado] = useState<Estado>("carregando");
  const [numero, setNumero] = useState("");
  const [nomeNegocio, setNomeNegocio] = useState("");
  const [aceite, setAceite] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [numeroSalvo, setNumeroSalvo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const carregarStatus = useCallback(async () => {
    try {
      const r = await fetch("/api/whatsapp/meta/status");
      if (r.status === 401) { window.location.href = "/login"; return; }
      const d = await r.json();
      setNumeroSalvo(d.whatsapp_e164 || null);
      setEstado((d.onboarding_status as Estado) || "novo");
    } catch {
      setEstado("novo");
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      await carregarStatus();
    })();
  }, [supabase, carregarStatus]);

  // Enquanto aguarda a liberação do nome, consulta de tempos em tempos.
  useEffect(() => {
    if (estado !== "aguardando_nome") return;
    pollRef.current = setInterval(carregarStatus, 20000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [estado, carregarStatus]);

  async function adicionarNumero() {
    setErro(null);
    if (!numero.trim() || !nomeNegocio.trim()) { setErro("Preencha o número e o nome do negócio."); return; }
    if (!aceite) { setErro("Confirme que entende que o número será exclusivo da IA."); return; }
    setEnviando(true);
    try {
      const r = await fetch("/api/whatsapp/meta/add-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ e164: numero.trim(), displayName: nomeNegocio.trim() }),
      });
      const d = await r.json();
      if (d.pendente) { setErro("A conexão ainda está sendo liberada pela nossa equipe. Tente em instantes."); return; }
      if (!r.ok) { setErro(d.erro || "Não foi possível adicionar o número."); return; }
      setNumeroSalvo(numero.trim());
      setEstado("verificando");
    } catch { setErro("Não foi possível adicionar o número agora."); }
    finally { setEnviando(false); }
  }

  async function confirmarCodigo() {
    setErro(null);
    if (!codigo.trim()) { setErro("Digite o código recebido."); return; }
    setEnviando(true);
    try {
      const r = await fetch("/api/whatsapp/meta/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codigo.trim() }),
      });
      const d = await r.json();
      if (!r.ok) { setErro(d.erro || "Código inválido ou expirado."); return; }
      setEstado("aguardando_nome");
    } catch { setErro("Não foi possível verificar o código agora."); }
    finally { setEnviando(false); }
  }

  const wrap: React.CSSProperties = { maxWidth: 560, margin: "0 auto", padding: "32px 18px" };
  const card: React.CSSProperties = { border: "1px solid var(--line)", borderRadius: 16, padding: 28, background: "var(--bg-soft)" };
  const input: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "#1c1c24", color: "var(--text)", fontSize: 15, marginBottom: 12 };
  const label: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "var(--muted)", marginBottom: 6, display: "block" };

  return (
    <main style={{ minHeight: "100vh" }}>
      <div style={wrap}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <LogoFarol width={150} height={43} />
        </div>

        <div style={card}>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>Conexão do WhatsApp</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 18 }}>
            Conecte o número do seu negócio para a IA começar a atender. Você faz tudo por aqui.
          </p>

          {erro && (
            <div style={{ background: "rgba(255,80,80,.12)", border: "1px solid rgba(255,80,80,.3)", color: "#ff8a8a", padding: "10px 12px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {erro}
            </div>
          )}

          {estado === "carregando" && (
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Verificando o estado da conexão…</p>
          )}

          {/* ATIVO */}
          {estado === "ativo" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(58,210,159,.12)", border: "1px solid rgba(58,210,159,.33)", borderRadius: 12, padding: "14px 16px" }}>
              <Icon name="check" size={18} style={{ color: "var(--good)" }} />
              <div style={{ fontSize: 14 }}>
                <b>WhatsApp conectado e atendendo.</b>
                {numeroSalvo ? <div style={{ color: "var(--muted)", marginTop: 2 }}>{numeroSalvo}</div> : null}
              </div>
            </div>
          )}

          {/* AGUARDANDO APROVAÇÃO DO NOME */}
          {estado === "aguardando_nome" && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(245,185,65,.1)", border: "1px solid rgba(245,185,65,.3)", borderRadius: 12, padding: "14px 16px" }}>
              <Icon name="clock" size={18} style={{ color: "var(--gold)", flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 14 }}>
                <b>Quase lá — aprovando o nome do seu negócio.</b>
                <div style={{ color: "var(--muted)", marginTop: 4 }}>
                  Essa etapa leva de 1 a 2 dias e é com a gente e o WhatsApp — você não precisa fazer nada. Avisamos por e-mail assim que a IA começar a atender.
                </div>
              </div>
            </div>
          )}

          {/* DIGITAR CÓDIGO */}
          {estado === "verificando" && (
            <>
              <p style={{ fontSize: 14, marginBottom: 14 }}>
                Enviamos um código {numeroSalvo ? <>para <b>{numeroSalvo}</b></> : "para o seu número"}. Digite ele abaixo para confirmar.
              </p>
              <label style={label}>Código de verificação</label>
              <input style={input} value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex: 123456" inputMode="numeric" />
              <button className="btn btn-primary" onClick={confirmarCodigo} disabled={enviando} style={{ width: "100%" }}>
                {enviando ? "Confirmando…" : "Confirmar código"}
              </button>
              <button onClick={() => setEstado("novo")} disabled={enviando} style={{ width: "100%", marginTop: 10, background: "transparent", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
                Usar outro número
              </button>
            </>
          )}

          {/* FORM INICIAL */}
          {(estado === "novo" || estado === "erro") && (
            <>
              <div style={{ background: "rgba(251,122,42,.08)", border: "1px solid rgba(251,122,42,.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 18, fontSize: 13, color: "#f0cdb4", display: "flex", gap: 9 }}>
                <Icon name="warning" size={16} style={{ color: "var(--amber)", flexShrink: 0, marginTop: 1 }} />
                <span>O número conectado vira <b>exclusivo da IA</b> e sai do app normal do WhatsApp. Use um número dedicado ao atendimento. Se ele já tiver WhatsApp, apague a conta dele antes.</span>
              </div>

              <label style={label}>Número do WhatsApp (com DDD)</label>
              <input style={input} value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: +55 54 99999-8888" inputMode="tel" />

              <label style={label}>Nome do seu negócio (como vai aparecer)</label>
              <input style={input} value={nomeNegocio} onChange={(e) => setNomeNegocio(e.target.value)} placeholder="Ex: Padaria do Zé" />

              <label style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13, color: "var(--muted)", margin: "4px 0 16px", cursor: "pointer" }}>
                <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} style={{ marginTop: 2 }} />
                <span>Entendo que este número passa a ser exclusivo da IA e sai do app normal do WhatsApp.</span>
              </label>

              <button className="btn btn-primary" onClick={adicionarNumero} disabled={enviando} style={{ width: "100%" }}>
                {enviando ? "Enviando…" : "Enviar código e conectar"}
              </button>
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
