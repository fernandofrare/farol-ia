"use client";

import { useEffect, useState, useCallback } from "react";

// Painel admin simples — alertas de abuso + kill-switch por cliente.
// Acesso restrito por ADMIN_EMAILS (checado no servidor). Leitura via service role.

type Cli = { nome: string | null; whatsapp_e164: string | null; suspended: boolean | null };
type Alerta = {
  id: string; client_id: string; tipo: string; severidade: string;
  detalhe: string; resolvido: boolean; created_at: string; clients: Cli | null;
};

export default function AdminAlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const r = await fetch("/api/admin/alertas");
      if (r.status === 401) { window.location.href = "/login"; return; }
      const d = await r.json();
      if (!r.ok) { setErro(d.erro || "Falha ao carregar."); return; }
      setAlertas(d.alertas || []);
    } catch { setErro("Falha ao carregar."); }
    finally { setCarregando(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function alternarSuspensao(clientId: string, suspendedAtual: boolean | null) {
    const novo = !suspendedAtual;
    if (!confirm(novo ? "Suspender este cliente? A IA para de responder." : "Reativar este cliente?")) return;
    try {
      const r = await fetch("/api/admin/suspend", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, suspended: novo }),
      });
      const d = await r.json();
      if (!r.ok) { alert(d.erro || "Falha."); return; }
      carregar();
    } catch { alert("Falha ao atualizar."); }
  }

  const cor = (sev: string) => sev === "critico" ? "#ff5a5a" : sev === "alerta" ? "#f5b941" : "#9a9aa6";

  const wrap: React.CSSProperties = { maxWidth: 1000, margin: "0 auto", padding: "32px 20px" };
  const th: React.CSSProperties = { textAlign: "left", fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--muted2)", padding: "8px 10px", borderBottom: "1px solid var(--line)" };
  const td: React.CSSProperties = { fontSize: 13, padding: "10px", borderBottom: "1px solid var(--line)", verticalAlign: "top" };

  return (
    <main style={{ minHeight: "100vh" }}>
      <div style={wrap}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Alertas de abuso</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>
          Classificador de IA + anomalia. Use o kill-switch para cortar um cliente na hora.
        </p>

        {erro && (
          <div style={{ background: "rgba(255,80,80,.12)", border: "1px solid rgba(255,80,80,.3)", color: "#ff8a8a", padding: "10px 12px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{erro}</div>
        )}

        {carregando ? (
          <p style={{ color: "var(--muted)" }}>Carregando…</p>
        ) : alertas.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>Nenhum alerta. 🎉</p>
        ) : (
          <div style={{ overflowX: "auto", border: "1px solid var(--line)", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Quando</th>
                  <th style={th}>Cliente</th>
                  <th style={th}>Tipo</th>
                  <th style={th}>Detalhe</th>
                  <th style={th}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {alertas.map((a) => (
                  <tr key={a.id}>
                    <td style={td}>{new Date(a.created_at).toLocaleString("pt-BR")}</td>
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{a.clients?.nome || "—"}</div>
                      <div style={{ color: "var(--muted)" }}>{a.clients?.whatsapp_e164 || ""}</div>
                    </td>
                    <td style={td}>
                      <span style={{ color: cor(a.severidade), fontWeight: 600 }}>{a.tipo}</span>
                      <div style={{ color: "var(--muted2)" }}>{a.severidade}</div>
                    </td>
                    <td style={{ ...td, maxWidth: 360 }}>{a.detalhe}</td>
                    <td style={td}>
                      <button
                        onClick={() => alternarSuspensao(a.client_id, a.clients?.suspended ?? false)}
                        className={`btn ${a.clients?.suspended ? "btn-ghost" : "btn-primary"}`}
                        style={{ fontSize: 12, padding: "7px 12px" }}
                      >
                        {a.clients?.suspended ? "Reativar" : "Suspender"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button onClick={carregar} className="btn btn-ghost" style={{ marginTop: 16 }}>Atualizar</button>
      </div>
    </main>
  );
}
