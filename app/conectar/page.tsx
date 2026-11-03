"use client";

import { Icon } from "@/components/Icon";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { LogoFarol } from "@/components/LogoFarol";

// Conexão do WhatsApp — CASO 1 (Tech Provider / Embedded Signup).
// O cliente cria a PRÓPRIA conta Meta + WABA pelo popup oficial da Meta; o número
// vive no portfólio DELE. A Farol opera como Tech Provider via API. O popup
// devolve um `code` (TTL ~30s) + waba_id + phone_number_id, que mandamos ao
// backend para a troca server-side por token.

type Estado = "carregando" | "novo" | "conectando" | "aguardando_nome" | "ativo" | "erro";

// Config do app Meta — valores PÚBLICOS (App ID e config_id do Facebook Login
// for Business são expostos no browser por design). Segredos (App Secret/token)
// NUNCA entram aqui — vivem só no .env do motor (VPS).
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID || "";
const META_CONFIG_ID = process.env.NEXT_PUBLIC_META_CONFIG_ID || "";
const GRAPH_VERSION = process.env.NEXT_PUBLIC_META_GRAPH_VERSION || "v23.0";

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

export default function ConectarPage() {
  const supabase = createClient();
  const [estado, setEstado] = useState<Estado>("carregando");
  const [numeroSalvo, setNumeroSalvo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sdkPronto, setSdkPronto] = useState(false);
  const sessionInfo = useRef<{ waba_id?: string; phone_number_id?: string }>({});
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

  // Enquanto aguarda a liberação do nome de exibição, consulta de tempos em tempos.
  useEffect(() => {
    if (estado !== "aguardando_nome") return;
    pollRef.current = setInterval(carregarStatus, 20000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [estado, carregarStatus]);

  // Carrega o SDK do Facebook e escuta a mensagem do popup do Embedded Signup.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!event.origin.endsWith("facebook.com")) return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type === "WA_EMBEDDED_SIGNUP") {
          // data.data: { phone_number_id, waba_id } no evento FINISH
          if (data.data?.waba_id) sessionInfo.current.waba_id = data.data.waba_id;
          if (data.data?.phone_number_id) sessionInfo.current.phone_number_id = data.data.phone_number_id;
        }
      } catch {
        /* mensagens não-JSON do SDK são ignoradas */
      }
    }
    window.addEventListener("message", onMessage);

    window.fbAsyncInit = function () {
      if (!window.FB || !META_APP_ID) return;
      window.FB.init({ appId: META_APP_ID, autoLogAppEvents: true, xfbml: true, version: GRAPH_VERSION });
      setSdkPronto(true);
    };

    if (!document.getElementById("facebook-jssdk")) {
      const js = document.createElement("script");
      js.id = "facebook-jssdk";
      js.src = "https://connect.facebook.net/pt_BR/sdk.js";
      js.async = true;
      js.defer = true;
      js.crossOrigin = "anonymous";
      document.body.appendChild(js);
    } else if (window.FB && META_APP_ID) {
      window.fbAsyncInit();
    }

    return () => window.removeEventListener("message", onMessage);
  }, []);

  async function enviarCode(code: string) {
    setEnviando(true);
    setEstado("conectando");
    try {
      const r = await fetch("/api/whatsapp/meta/embedded-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          waba_id: sessionInfo.current.waba_id || null,
          phone_number_id: sessionInfo.current.phone_number_id || null,
        }),
      });
      const d = await r.json();
      if (d.pendente) {
        setErro("A conexão oficial ainda está sendo liberada pela nossa equipe. Avisamos você em instantes.");
        setEstado("erro");
        return;
      }
      if (!r.ok) { setErro(d.erro || "Não foi possível concluir a conexão."); setEstado("erro"); return; }
      // O backend diz se já ficou ativo ou se o nome ainda está em aprovação.
      await carregarStatus();
      if (d.onboarding_status) setEstado(d.onboarding_status as Estado);
    } catch {
      setErro("Não foi possível concluir a conexão agora.");
      setEstado("erro");
    } finally {
      setEnviando(false);
    }
  }

  function conectar() {
    setErro(null);
    if (!META_CONFIG_ID || !META_APP_ID) {
      setErro("A conexão com o WhatsApp ainda está sendo liberada. Tente novamente em breve.");
      return;
    }
    if (!window.FB) { setErro("Aguarde um instante e tente de novo (carregando)."); return; }
    sessionInfo.current = {};
    window.FB.login(
      (response: any) => {
        const code = response?.authResponse?.code;
        if (code) {
          enviarCode(code);
        } else {
          // Cliente fechou o popup ou não concedeu acesso.
          setErro("Conexão não concluída. Você pode tentar novamente quando quiser.");
        }
      },
      {
        config_id: META_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: { setup: {}, featureType: "", sessionInfoVersion: "3" },
      }
    );
  }

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

          {/* CONECTANDO */}
          {estado === "conectando" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(251,122,42,.08)", border: "1px solid rgba(251,122,42,.2)", borderRadius: 12, padding: "14px 16px" }}>
              <Icon name="refresh" size={18} style={{ color: "var(--amber)" }} />
              <div style={{ fontSize: 14 }}>Concluindo a conexão com a Meta…</div>
            </div>
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
                  Essa etapa leva de 1 a 2 dias e é entre a Meta e o seu negócio — você não precisa fazer nada. Avisamos por e-mail assim que a IA começar a atender.
                </div>
              </div>
            </div>
          )}

          {/* INÍCIO — BOTÃO EMBEDDED SIGNUP */}
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
