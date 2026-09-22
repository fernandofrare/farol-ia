"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { LogoFarol } from "@/components/LogoFarol";

// Página de (re)conexão do WhatsApp.
// NÃO mexe na configuração da empresa (nome, segmento, serviços) — só troca/reconecta
// o número. Reaproveita a instância existente da Evolution (via /api/whatsapp/qr).

export default function ConectarPage() {
  const supabase = createClient();
  const [carregando, setCarregando] = useState(true);
  const [state, setState] = useState<string>("desconhecido");
  const [qr, setQr] = useState<string | null>(null);
  const [qrPendente, setQrPendente] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modoTroca, setModoTroca] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const conectado = state === "open";

  const checarStatus = useCallback(async () => {
    try {
      const r = await fetch("/api/whatsapp/status");
      if (r.status === 401) {
        window.location.href = "/login";
        return;
      }
      const d = await r.json();
      setState(d.state || "desconhecido");
    } catch {
      setState("desconhecido");
    } finally {
      setCarregando(false);
    }
  }, []);

  // Ao abrir: confirma sessão e checa o estado real da conexão.
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      await checarStatus();
    })();
  }, [supabase, checarStatus]);

  async function pedirQr() {
    setErro(null);
    setQr(null);
    setQrPendente(false);
    setGerando(true);
    try {
      const resp = await fetch("/api/whatsapp/qr", { method: "POST" });
      const data = await resp.json();
      if (data.pendente) {
        setQrPendente(true);
        return;
      }
      if (data.qr) setQr(data.qr);
      else setErro("Não foi possível gerar o QR agora. Tente de novo em instantes.");
    } catch {
      setErro("Não foi possível gerar o QR agora. Tente de novo em instantes.");
    } finally {
      setGerando(false);
    }
  }

  async function resetar() {
    if (!confirm("Isto apaga a conexão atual e recria do zero. Seus dados de empresa e da IA continuam salvos. Continuar?")) return;
    setErro(null);
    try {
      await fetch("/api/whatsapp/reset", { method: "POST" });
      await new Promise((r) => setTimeout(r, 800));
    } catch {}
    pedirQr();
  }

  // Enquanto há QR na tela, fica checando o status até conectar.
  useEffect(() => {
    if (!qr && !qrPendente) return;
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch("/api/whatsapp/status");
        const d = await r.json();
        setState(d.state || "desconhecido");
        if (d.state === "open") {
          if (pollRef.current) clearInterval(pollRef.current);
          setQr(null);
          setModoTroca(false);
        }
      } catch {}
    }, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [qr, qrPendente]);

  // Se estiver desconectado ao abrir, já puxa o QR automaticamente.
  useEffect(() => {
    if (!carregando && !conectado && !qr && !qrPendente && !gerando) {
      pedirQr();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carregando, conectado]);

  const wrap: React.CSSProperties = { maxWidth: 560, margin: "0 auto", padding: "32px 18px" };
  const card: React.CSSProperties = {
    border: "1px solid var(--line)",
    borderRadius: 16,
    padding: 28,
    background: "var(--bg-soft)",
  };

  const statusCor = conectado ? "#3ad29f" : "#f5b941";
  const statusBg = conectado ? "rgba(58,210,159,.12)" : "rgba(245,185,65,.12)";

  return (
    <main style={{ minHeight: "100vh" }}>
      <div style={wrap}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <LogoFarol width={150} height={43} />
        </div>

        <div style={card}>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>Conexão do WhatsApp</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 18 }}>
            Reconecte o número de atendimento ou troque por outro. Seus dados de
            empresa e da IA continuam salvos — isto só cuida do número.
          </p>

          {/* STATUS ATUAL */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: statusBg,
              border: `1px solid ${statusCor}55`,
              borderRadius: 12,
              padding: "12px 14px",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: statusCor,
                flexShrink: 0,
              }}
            />
            <div style={{ fontSize: 14 }}>
              {carregando
                ? "Verificando conexão…"
                : conectado
                ? "✅ WhatsApp conectado e atendendo."
                : "⚠️ Nenhum celular conectado. Escaneie o QR abaixo para conectar."}
            </div>
          </div>

          {erro && (
            <div
              style={{
                background: "rgba(255,80,80,.12)",
                border: "1px solid rgba(255,80,80,.3)",
                color: "#ff8a8a",
                padding: "10px 12px",
                borderRadius: 10,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {erro}
            </div>
          )}

          {/* CONECTADO: opção de trocar número */}
          {!carregando && conectado && !modoTroca && (
            <button
              className="btn btn-ghost"
              onClick={async () => {
            setModoTroca(true);
            try {
              await fetch("/api/whatsapp/logout", { method: "POST" });
            } catch {}
            pedirQr();
          }}
              style={{ width: "100%", padding: 12, borderRadius: 10, cursor: "pointer" }}
            >
              🔄 Trocar de número
            </button>
          )}

          {conectado && modoTroca && (
            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14 }}>
              Desconectando o número atual e gerando um novo QR. Escaneie abaixo com o novo número para vincular — os dados da empresa continuam salvos.
            </p>
          )}

          {/* QR (quando desconectado, ou trocando número) */}
          {(!conectado || modoTroca) && (
            <>
              <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 14 }}>
                No celular: WhatsApp → Aparelhos conectados → Conectar aparelho →
                escaneie o código.
              </p>

              {qr && (
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <img
                    src={qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`}
                    alt="QR Code"
                    style={{ width: 240, height: 240, borderRadius: 12, background: "#fff", padding: 8 }}
                  />
                  <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 10 }}>
                    Aguardando a conexão… {state === "connecting" ? "(conectando)" : ""}
                  </p>
                </div>
              )}

              {qrPendente && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ fontSize: 14, marginBottom: 8 }}>
                    🛠️ A conexão está sendo finalizada pela nossa equipe.
                  </p>
                  <p style={{ color: "var(--muted)", fontSize: 13 }}>
                    Assim que liberar, o QR aparece aqui.
                  </p>
                </div>
              )}

              {!qr && !qrPendente && (
                <div style={{ textAlign: "center", padding: "20px 0", color: "var(--muted)" }}>
                  {gerando ? "Gerando o QR…" : ""}
                </div>
              )}

              <button
                className="btn btn-ghost"
                onClick={pedirQr}
                disabled={gerando}
                style={{ width: "100%", padding: 12, borderRadius: 10, cursor: "pointer", marginTop: 4 }}
              >
                {gerando ? "Gerando…" : "Gerar novo QR"}
              </button>

              <button
                onClick={resetar}
                disabled={gerando}
                style={{ width: "100%", padding: 10, marginTop: 10, background: "transparent", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
              >
                Problemas para conectar? Resetar conexão
              </button>
            </>
          )}

          <div style={{ marginTop: 18, textAlign: "center" }}>
            <a href="/dashboard" style={{ color: "var(--muted)", fontSize: 13 }}>
              ← Voltar para o painel
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
