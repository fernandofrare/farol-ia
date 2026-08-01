"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { LogoFarol } from "@/components/LogoFarol";
import styles from "./nova.module.css";

export default function NovaSenhaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [pronto, setPronto] = useState(false);
  // Só permite redefinir se houver uma sessão de recuperação válida
  // (vinda do link do e-mail). Sem isso, o formulário não aparece.
  const [linkValido, setLinkValido] = useState<boolean | null>(null);

  useEffect(() => {
    // Fluxo oficial @supabase/ssr (PKCE): o link do e-mail traz token_hash+type.
    // Trocamos por uma sessão de recuperação com verifyOtp — sem depender de
    // code_verifier no navegador (que não existe em reset iniciado por e-mail).
    const params = new URLSearchParams(window.location.search);
    const token_hash = params.get("token_hash");
    const type = params.get("type");

    if (token_hash && type === "recovery") {
      supabase.auth
        .verifyOtp({ type: "recovery", token_hash })
        .then(({ error }) => setLinkValido(!error));
      return;
    }

    // Fallback para o fluxo implícito (hash #access_token): o Supabase emite
    // PASSWORD_RECOVERY ao abrir o link. Mantido por segurança.
    const { data: sub } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === "PASSWORD_RECOVERY") setLinkValido(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      setLinkValido((v) => v ?? Boolean(data.session));
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (senha.length < 8) {
      setErro("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (senha !== confirma) {
      setErro("As senhas não conferem.");
      return;
    }

    setCarregando(true);
    // A sessão de recuperação já foi estabelecida no useEffect (verifyOtp);
    // updateUser aplica a nova senha.
    const { error } = await supabase.auth.updateUser({ password: senha });

    if (error) {
      setErro(
        "Não foi possível redefinir. O link pode ter expirado — solicite um novo."
      );
      setCarregando(false);
      return;
    }
    setPronto(true);
  }

  return (
    <main className={styles.page}>
      <div className={styles.box}>
        <div className={styles.boxLogo}>
          <LogoFarol width={150} height={43} />
        </div>

        {linkValido === false ? (
          <div className={styles.boxHeader}>
            <div className={styles.icon}>⚠️</div>
            <h1>Link inválido ou expirado</h1>
            <p>
              Este link de redefinição não é válido ou já expirou. Solicite um
              novo.
            </p>
            <Link
              href="/recuperar-senha"
              className={`${styles.btn} ${styles.btnPrimary}`}
              style={{ marginTop: 16 }}
            >
              Solicitar novo link
            </Link>
          </div>
        ) : !pronto ? (
          <>
            <div className={styles.boxHeader}>
              <div className={styles.icon}>🔒</div>
              <h1>Criar nova senha</h1>
              <p>Escolha uma senha com pelo menos 8 caracteres.</p>
            </div>

            {erro && (
              <div className={`${styles.alert} ${styles.alertErr}`}>
                ⚠️ {erro}
              </div>
            )}

            <form onSubmit={handleSalvar}>
              <div className={styles.field}>
                <label htmlFor="senha">Nova senha</label>
                <div className={styles.inputWrap}>
                  <span className={styles.ico}>🔒</span>
                  <input
                    id="senha"
                    type="password"
                    className={styles.input}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="confirma">Confirmar nova senha</label>
                <div className={styles.inputWrap}>
                  <span className={styles.ico}>🔒</span>
                  <input
                    id="confirma"
                    type="password"
                    className={styles.input}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    value={confirma}
                    onChange={(e) => setConfirma(e.target.value)}
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
                    Salvando...
                  </>
                ) : (
                  "Salvar nova senha"
                )}
              </button>
            </form>
          </>
        ) : (
          <div className={styles.successState}>
            <div className={styles.check}>✅</div>
            <h2>Senha alterada!</h2>
            <p>Sua nova senha já está ativa. Você pode entrar normalmente.</p>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => router.push("/login")}
            >
              Ir para o login
            </button>
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
