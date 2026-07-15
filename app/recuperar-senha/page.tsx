"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoFarol } from "@/components/LogoFarol";
import styles from "./recuperar.module.css";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const resp = await fetch("/api/auth/recuperar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });

    if (!resp.ok && resp.status === 429) {
      const dados = await resp.json().catch(() => ({}));
      setErro(dados?.erro || "Muitas solicitações. Aguarde alguns minutos.");
      setCarregando(false);
      return;
    }

    setEnviado(true);
  }

  return (
    <main className={styles.page}>
      <div className={styles.box}>
        <div className={styles.boxLogo}>
          <LogoFarol width={150} height={43} />
        </div>

        {!enviado ? (
          <>
            <div className={styles.boxHeader}>
              <div className={styles.icon}>🔑</div>
              <h1>Redefinir senha</h1>
              <p>
                Digite seu e-mail e enviaremos um link para você criar uma nova
                senha.
              </p>
            </div>

            {erro && (
              <div className={`${styles.alert} ${styles.alertErr}`}>
                ⚠️ {erro}
              </div>
            )}

            <form onSubmit={handleReset}>
              <div className={styles.field}>
                <label htmlFor="email">E-mail da sua conta</label>
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

              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={carregando}
              >
                {carregando ? (
                  <>
                    <span className={styles.spinner} />
                    Enviando...
                  </>
                ) : (
                  "Enviar link de redefinição"
                )}
              </button>
              <Link
                href="/login"
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                ← Voltar ao login
              </Link>
            </form>
          </>
        ) : (
          <div className={styles.successState}>
            <div className={styles.check}>✅</div>
            <h2>Link enviado!</h2>
            <p>
              Se esse e-mail estiver cadastrado, você receberá um link para
              redefinir sua senha em instantes. Verifique também a caixa de
              spam.
            </p>
            <Link
              href="/login"
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              Voltar ao login
            </Link>
          </div>
        )}
      </div>

      <div className={styles.foot}>
        <Link href="/termos">Termos</Link> ·{" "}
        <Link href="/privacidade">Privacidade</Link> ·{" "}
        <a href="https://farolia.store">farolia.store</a>
      </div>
    </main>
  );
}
