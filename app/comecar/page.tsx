"use client";

import { useEffect, useRef, useState } from "react";
import { CONFIG_PADRAO } from "@/lib/config-ia";
import { LogoFarol } from "@/components/LogoFarol";

const SEGMENTOS = [
  "Beleza e Estética",
  "Saúde e Bem-estar",
  "Alimentação e Restaurante",
  "Petshop e Veterinário",
  "Oficina e Mecânica",
  "Comércio / Loja",
  "Serviços Profissionais",
  "Educação e Cursos",
  "Imobiliária",
  "Outro",
];

const TONS = [
  { id: "amigavel", ico: "😊", t: "Amigável" },
  { id: "profissional", ico: "👔", t: "Profissional" },
  { id: "direto", ico: "⚡", t: "Direto" },
  { id: "sofisticado", ico: "💎", t: "Sofisticado" },
];

export default function ComecarPage() {
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState("");
  const [segmento, setSegmento] = useState(SEGMENTOS[0]);
  const [tom, setTom] = useState("amigavel");
  const [servicos, setServicos] = useState<string[]>([]);
  const [servInput, setServInput] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [qr, setQr] = useState<string | null>(null);
  const [qrPendente, setQrPendente] = useState(false);
  const [conn, setConn] = useState("desconhecido");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function addServico(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const v = servInput.trim().replace(/,/g, "");
      if (v && !servicos.includes(v)) setServicos([...servicos, v]);
      setServInput("");
    }
  }

  function configAtual(ativa: boolean) {
    return { ...CONFIG_PADRAO, nome_negocio: nome, segmento, tom, servicos, ativa };
  }

  async function salvarConfig(ativa: boolean) {
    const resp = await fetch("/api/config-ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: configAtual(ativa) }),
    });
    if (!resp.ok) throw new Error("Não foi possível salvar.");
  }

  async function irParaPasso2() {
    setErro(null);
    if (!nome.trim()) return setErro("Diga o nome do seu negócio.");
    setSalvando(true);
    try {
      await salvarConfig(false);
      setStep(2);
      pedirQr();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  async function pedirQr() {
    setErro(null);
    setQr(null);
    setQrPendente(false);
    try {
      const resp = await fetch("/api/whatsapp/qr", { method: "POST" });
      const data = await resp.json();
      if (data.pendente) {
        setQrPendente(true);
        return;
      }
      if (data.qr) setQr(data.qr);
      else setErro("Não foi possível gerar o QR agora.");
    } catch {
      setErro("Não foi possível gerar o QR agora.");
    }
  }

  // Polling do status enquanto está no passo 2 com QR na tela.
  useEffect(() => {
    if (step !== 2 || (!qr && !qrPendente)) return;
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch("/api/whatsapp/status");
        const d = await r.json();
        setConn(d.state || "desconhecido");
        if (d.state === "open") {
          if (pollRef.current) clearInterval(pollRef.current);
          setStep(3);
        }
      } catch {}
    }, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [step, qr, qrPendente]);

  async function ligarIA() {
    setSalvando(true);
    try {
      await salvarConfig(true);
      window.location.href = "/dashboard";
    } catch {
      window.location.href = "/dashboard";
    }
  }

  const wrap: React.CSSProperties = { maxWidth: 560, margin: "0 auto", padding: "32px 18px" };
  const card: React.CSSProperties = {
    border: "1px solid var(--line)",
    borderRadius: 16,
    padding: 28,
    background: "var(--bg-soft)",
  };
  const label: React.CSSProperties = { fontSize: 13, marginBottom: 6, display: "block" };
  const input: React.CSSProperties = {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 10,
    border: "1px solid var(--line)",
    background: "transparent",
    color: "inherit",
    fontSize: 14,
    marginBottom: 16,
  };

  return (
    <main style={{ minHeight: "100vh" }}>
      <div style={wrap}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <LogoFarol width={150} height={43} />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                width: 34,
                height: 6,
                borderRadius: 3,
                background: step >= n ? "var(--amber, #ff8a3d)" : "var(--line)",
              }}
            />
          ))}
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

        {step === 1 && (
          <div style={card}>
            <h1 style={{ fontSize: 22, marginBottom: 4 }}>Vamos configurar sua IA</h1>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>
              Só o essencial agora. O resto você ajusta depois em "Minha IA".
            </p>

            <label style={label}>Nome do negócio</label>
            <input style={input} value={nome} placeholder="Ex: Barbearia do Zé" onChange={(e) => setNome(e.target.value)} />

            <label style={label}>Segmento</label>
            <select style={input} value={segmento} onChange={(e) => setSegmento(e.target.value)}>
              {SEGMENTOS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <label style={label}>Tom de voz</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {TONS.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => setTom(x.id)}
                  style={{
                    flex: "1 1 45%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1px solid ${tom === x.id ? "var(--amber, #ff8a3d)" : "var(--line)"}`,
                    background: tom === x.id ? "rgba(255,138,61,.12)" : "transparent",
                    color: "inherit",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  {x.ico} {x.t}
                </button>
              ))}
            </div>

            <label style={label}>Serviços ou produtos principais</label>
            <div
              style={{ ...input, minHeight: 44, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", cursor: "text" }}
              onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()}
            >
              {servicos.map((s) => (
                <span key={s} style={{ background: "rgba(255,138,61,.15)", borderRadius: 8, padding: "3px 8px", fontSize: 13 }}>
                  {s}
                  <button
                    type="button"
                    onClick={() => setServicos(servicos.filter((x) => x !== s))}
                    style={{ marginLeft: 6, background: "none", border: "none", color: "inherit", cursor: "pointer" }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                style={{ flex: 1, minWidth: 120, border: "none", background: "transparent", color: "inherit", outline: "none", fontSize: 14 }}
                placeholder="Digite e Enter..."
                value={servInput}
                onChange={(e) => setServInput(e.target.value)}
                onKeyDown={addServico}
              />
            </div>

            <button
              className="btn btn-primary"
              disabled={salvando}
              onClick={irParaPasso2}
              style={{ width: "100%", padding: 13, borderRadius: 10, fontSize: 15, cursor: "pointer", marginTop: 4 }}
            >
              {salvando ? "Salvando..." : "Continuar →"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={card}>
            <h1 style={{ fontSize: 22, marginBottom: 4 }}>Conecte seu WhatsApp</h1>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 18 }}>
              Use um número <b>novo e dedicado</b> ao atendimento. No celular desse número:
              WhatsApp → Aparelhos conectados → Conectar aparelho → escaneie o código.
            </p>

            {qr && (
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <img
                  src={qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`}
                  alt="QR Code"
                  style={{ width: 240, height: 240, borderRadius: 12, background: "#fff", padding: 8 }}
                />
                <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 10 }}>
                  Aguardando a conexão… {conn === "connecting" ? "(conectando)" : ""}
                </p>
              </div>
            )}

            {qrPendente && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ fontSize: 14, marginBottom: 8 }}>
                  🛠️ A conexão do WhatsApp está sendo finalizada pela nossa equipe.
                </p>
                <p style={{ color: "var(--muted)", fontSize: 13 }}>
                  Você já pode explorar o painel — assim que liberar, o QR aparece aqui.
                </p>
              </div>
            )}

            {!qr && !qrPendente && (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--muted)" }}>
                Gerando o QR…
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                className="btn btn-ghost"
                onClick={pedirQr}
                style={{ flex: 1, padding: 12, borderRadius: 10, cursor: "pointer" }}
              >
                Gerar novo QR
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setStep(3)}
                style={{ flex: 1, padding: 12, borderRadius: 10, cursor: "pointer" }}
              >
                Pular por agora →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={card}>
            <h1 style={{ fontSize: 22, marginBottom: 4 }}>Tudo pronto para testar 🎉</h1>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 18 }}>
              Ligue a IA e mande uma mensagem para o número de atendimento a partir de
              outro celular. Ela deve responder em segundos.
            </p>
            <ol style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.8, paddingLeft: 18, marginBottom: 20 }}>
              <li>Mantenha o celular do número ligado e com internet.</li>
              <li>Envie um "oi" de outro número.</li>
              <li>Veja a resposta chegar — e acompanhe tudo no painel.</li>
            </ol>
            <button
              className="btn btn-primary"
              disabled={salvando}
              onClick={ligarIA}
              style={{ width: "100%", padding: 13, borderRadius: 10, fontSize: 15, cursor: "pointer" }}
            >
              {salvando ? "Ligando..." : "Ligar a IA e ir para o painel →"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
