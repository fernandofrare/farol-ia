"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Hook compartilhado do Embedded Signup (Caso 1 / Tech Provider), usado em
// /conectar e no wizard /comecar. Carrega o SDK do Facebook, dispara o popup
// oficial da Meta, troca o code por token no backend e acompanha o status.
// Valores PÚBLICOS (App ID / config_id são expostos no browser por design);
// segredos ficam só no motor (VPS).

export type EstadoConexao =
  | "carregando"
  | "novo"
  | "conectando"
  | "aguardando_nome"
  | "ativo"
  | "erro";

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID || "";
const META_CONFIG_ID = process.env.NEXT_PUBLIC_META_CONFIG_ID || "";
const GRAPH_VERSION = process.env.NEXT_PUBLIC_META_GRAPH_VERSION || "v23.0";

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

export function useEmbeddedSignup() {
  const [estado, setEstado] = useState<EstadoConexao>("carregando");
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
      setEstado((d.onboarding_status as EstadoConexao) || "novo");
    } catch {
      setEstado("novo");
    }
  }, []);

  // Enquanto aguarda a liberação do nome de exibição, consulta periodicamente.
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

  const enviarCode = useCallback(async (code: string) => {
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
      await carregarStatus();
      if (d.onboarding_status) setEstado(d.onboarding_status as EstadoConexao);
    } catch {
      setErro("Não foi possível concluir a conexão agora.");
      setEstado("erro");
    } finally {
      setEnviando(false);
    }
  }, [carregarStatus]);

  const conectar = useCallback(() => {
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
        if (code) enviarCode(code);
        else setErro("Conexão não concluída. Você pode tentar novamente quando quiser.");
      },
      {
        config_id: META_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: { setup: {}, featureType: "", sessionInfoVersion: "3" },
      }
    );
  }, [enviarCode]);

  return {
    estado, setEstado,
    numeroSalvo, erro, enviando, sdkPronto,
    conectar, carregarStatus,
  };
}
