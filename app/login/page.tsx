"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogoFarol } from "@/components/LogoFarol";
import styles from "./login.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const resp = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), senha }),
    });

    if (!resp.ok) {
      const dados = await resp.json().catch(() => ({}));
      setErro(dados?.erro || "E-mail ou senha incorretos. Tente novamente.");
      setCarregando(false);
      return;
    }

    // Respeita ?redirect= do middleware; senão vai ao dashboard.
    const destino = searchParams.get("redirect") || "/dashboard";
    router.push(destino);
    router.refresh();
  }

  return (
    <main className={styles.page}>
      {/* LADO VISUAL */}
      <div className={styles.sideVisual}>
        <div className={styles.visualLogo}>
          <LogoFarol width={160} height={46} />
        </div>
        <div className={styles.visualBody}>
          <h2>
            Seu negócio atendendo <em>24 horas</em> enquanto você vive.
          </h2>
          <p>
            Entre no painel e veja sua IA trabalhando em tempo real — cada
            conversa, cada lead, cada oportunidade capturada.
          </p>
        </div>
        <div className={styles.visualFeatures}>
          <div className={styles.feat}>
            <div className={styles.featDot}>📊</div>Painel em tempo real
          </div>
          <div className={styles.feat}>
            <div className={styles.featDot}>🤖</div>IA ativa 24 horas no seu
            WhatsApp
          </div>
          <div className={styles.feat}>
            <div className={styles.featDot}>🎯</div>Leads qualificados
            automaticamente
          </div>
        </div>
      </div>

      {/* FORMULÁRIO */}
      <div className={styles.sideForm}>
        <div className={styles.formBox}>
          <div className={styles.formHeader}>
            <h1>Entrar na sua conta</h1>
            <p>Acesse o painel da Farol IA</p>
          </div>

          {erro && <div className={styles.alertErr}>⚠️ {erro}</div>}

          <form onSubmit={handleLogin}>
            <div className={styles.field}>
              <label htmlFor="email">E-mail</label>
              <div className={styles.inputWrap}>
                <span className={styles.ico}>✉️</span>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="senha">Senha</label>
              <div className={styles.inputWrap}>
                <span className={styles.ico}>🔒</span>
                <input
                  id="senha"
                  type={showPw ? "text" : "password"}
                  className={styles.input}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.togglePw}
                  onClick={() => setShowPw((v) => !v)}
                  title="Mostrar senha"
                  aria-label="Mostrar ou ocultar senha"
                >
                  👁
                </button>
              </div>
            </div>

            <div className={styles.forgot}>
              <Link href="/recuperar-senha">Esqueceu a senha?</Link>
            </div>

            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={carregando}
            >
              {carregando ? (
                <>
                  <span className={styles.spinner} />
                  Entrando...
                </>
              ) : (
                "Entrar no painel"
              )}
            </button>
          </form>

          <div className={styles.footLink}>
            Ainda não tem conta?{" "}
            <a href="https://farolia.store/#ativar">Ativar agora →</a>
          </div>
        </div>

        <div className={styles.formFooter}>
          <a href="https://farolia.store">farolia.store</a> ·{" "}
          <Link href="/termos">Termos</Link> ·{" "}
          <Link href="/privacidade">Privacidade</Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
