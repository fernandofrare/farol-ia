"use client";

import { useState } from "react";
import Link from "next/link";
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

export default function CadastroPage() {
  const [tipo, setTipo] = useState<"empresa" | "autonomo">("empresa");
  const [f, setF] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirma: "",
    nome_empresa: "",
    cnpj: "",
    cpf: "",
    segmento: SEGMENTOS[0],
  });
  const [consent, setConsent] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function set<K extends keyof typeof f>(k: K, v: string) {
    setF((s) => ({ ...s, [k]: v }));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!f.nome.trim()) return setErro("Informe seu nome.");
    if (!f.email.includes("@")) return setErro("E-mail inválido.");
    if (f.senha.length < 8) return setErro("A senha precisa de ao menos 8 caracteres.");
    if (f.senha !== f.confirma) return setErro("As senhas não conferem.");
    if (tipo === "empresa" && !f.cnpj.trim()) return setErro("Informe o CNPJ da empresa.");
    if (tipo === "autonomo" && !f.cpf.trim()) return setErro("Informe seu CPF.");
    if (!consent) return setErro("Você precisa aceitar os termos para continuar.");

    setEnviando(true);
    try {
      const resp = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, tipo }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.erro || "Erro ao cadastrar.");
      // Vai pro checkout do Asaas (cartão) ou pro painel se ainda não configurado.
      window.location.href = data.checkoutUrl || "/dashboard";
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao cadastrar.");
      setEnviando(false);
    }
  }

  const card: React.CSSProperties = {
    maxWidth: 520,
    margin: "0 auto",
    padding: 28,
    border: "1px solid var(--line)",
    borderRadius: 16,
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
    marginBottom: 14,
  };

  return (
    <main style={{ minHeight: "100vh", padding: "32px 18px" }}>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <LogoFarol width={150} height={43} />
      </div>

      <div style={card}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Comece sua semana grátis</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>
          Ativo em até 24h · Cancele na 1ª semana e não pague nada.
        </p>

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

        <form onSubmit={enviar}>
          <label style={label}>Nome completo</label>
          <input style={input} value={f.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Seu nome" />

          <label style={label}>E-mail (será seu login)</label>
          <input style={input} type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="voce@email.com" />

          <label style={label}>Telefone (WhatsApp de contato)</label>
          <input style={input} value={f.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(00) 00000-0000" />

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Senha</label>
              <input style={input} type="password" value={f.senha} onChange={(e) => set("senha", e.target.value)} placeholder="mín. 8 caracteres" autoComplete="new-password" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Confirmar senha</label>
              <input style={input} type="password" value={f.confirma} onChange={(e) => set("confirma", e.target.value)} autoComplete="new-password" />
            </div>
          </div>

          <label style={label}>Você é...</label>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {(["empresa", "autonomo"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                style={{
                  flex: 1,
                  padding: "11px 12px",
                  borderRadius: 10,
                  border: `1px solid ${tipo === t ? "var(--amber)" : "var(--line)"}`,
                  background: tipo === t ? "rgba(255,138,61,.12)" : "transparent",
                  color: "inherit",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {t === "empresa" ? "Uma empresa" : "Profissional autônomo"}
              </button>
            ))}
          </div>

          {tipo === "empresa" ? (
            <>
              <label style={label}>Nome da empresa</label>
              <input style={input} value={f.nome_empresa} onChange={(e) => set("nome_empresa", e.target.value)} placeholder="Razão social ou nome fantasia" />
              <label style={label}>CNPJ</label>
              <input style={input} value={f.cnpj} onChange={(e) => set("cnpj", e.target.value)} placeholder="00.000.000/0000-00" />
              <label style={label}>Segmento</label>
              <select style={input} value={f.segmento} onChange={(e) => set("segmento", e.target.value)}>
                {SEGMENTOS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </>
          ) : (
            <>
              <label style={label}>CPF</label>
              <input style={input} value={f.cpf} onChange={(e) => set("cpf", e.target.value)} placeholder="000.000.000-00" />
            </>
          )}

          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5, color: "var(--muted)", margin: "6px 0 18px" }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3 }} />
            <span>
              Concordo em iniciar 1 semana grátis. Após o período, autorizo a cobrança automática de <b>R$147/mês</b> no cartão informado, podendo cancelar a qualquer momento pelo painel. Li os{" "}
              <Link href="/termos">Termos</Link> e a <Link href="/privacidade">Privacidade</Link>.
            </span>
          </label>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={enviando}
            style={{ width: "100%", padding: "13px", borderRadius: 10, fontSize: 15, cursor: "pointer" }}
          >
            {enviando ? "Criando sua conta..." : "Começar 1 semana grátis →"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginTop: 16 }}>
          Já é cliente? <Link href="/login">Entrar</Link>
        </p>
      </div>
    </main>
  );
}
