"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoFarol } from "./LogoFarol";
import { Icon, type IconName } from "./Icon";
import styles from "./painel.module.css";

type Usuario = {
  nome: string;
  plano: string;
};

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const a = partes[0]?.[0] ?? "";
  const b = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (a + b).toUpperCase() || "U";
}

const PRINCIPAL: { href: string; ico: IconName; label: string }[] = [
  { href: "/dashboard", ico: "dashboard", label: "Dashboard" },
  { href: "/minha-ia", ico: "bot", label: "Minha IA" },
  { href: "/crm", ico: "users", label: "Contatos & CRM" },
  { href: "/conectar", ico: "phone", label: "Conexão WhatsApp" },
];

const CONFIG: { href: string; ico: IconName; label: string }[] = [
  { href: "/configuracoes", ico: "gear", label: "Configurações" },
  { href: "/assinatura", ico: "card", label: "Assinatura" },
  { href: "/suporte", ico: "help", label: "Suporte" },
];

const MOBILE: { href: string; ico: IconName; label: string }[] = [
  { href: "/dashboard", ico: "dashboard", label: "Painel" },
  { href: "/minha-ia", ico: "bot", label: "IA" },
  { href: "/crm", ico: "users", label: "CRM" },
  { href: "/configuracoes", ico: "gear", label: "Config" },
];

export function Sidebar({ usuario }: { usuario: Usuario }) {
  const pathname = usePathname();

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <LogoFarol width={140} height={40} />
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.navSection}>Principal</div>
          {PRINCIPAL.map((item) => {
            const ativo = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${ativo ? styles.navItemActive : ""}`}
              >
                <span className={styles.navIco}>
                  <Icon name={item.ico} size={19} />
                </span>
                {item.label}
              </Link>
            );
          })}

          <div className={styles.navSection}>Configurações</div>
          {CONFIG.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navItem}>
              <span className={styles.navIco}>
                <Icon name={item.ico} size={19} />
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          {/* O logout é um POST real para encerrar a sessão no servidor. */}
          <form action="/api/auth/signout" method="post">
            <button type="submit" className={styles.userRow} title="Sair">
              <div className={styles.avatar}>{iniciais(usuario.nome)}</div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>{usuario.nome}</div>
                <div className={styles.userPlan}>{usuario.plano}</div>
              </div>
            </button>
          </form>
        </div>
      </aside>

      <nav className={styles.mobileNav}>
        {MOBILE.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.mobileItem} ${pathname.startsWith(item.href) ? styles.mobileItemActive : ""}`}
          >
            <span className={styles.mobileIco}>
              <Icon name={item.ico} size={22} />
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
