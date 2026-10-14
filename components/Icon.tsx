import type { SVGProps } from "react";

/**
 * Ícones monolinha da marca Farol IA.
 * stroke=currentColor → herdam a cor do contexto (nav, botão, card).
 * Uso: <Icon name="dashboard" size={20} />
 */
export type IconName =
  | "dashboard"
  | "bot"
  | "users"
  | "phone"
  | "gear"
  | "card"
  | "help"
  | "bell"
  | "chat"
  | "target"
  | "bolt"
  | "trending"
  | "user"
  | "warning"
  | "link"
  | "check"
  | "gift"
  | "clock"
  | "shield"
  | "mail"
  | "lock"
  | "doc"
  | "sparkles"
  | "store"
  | "star"
  | "eye"
  | "sliders"
  | "refresh"
  | "wrench"
  | "search"
  | "arrow";

const P: Record<IconName, React.ReactNode> = {
  dashboard: (
    <>
      <line x1="4" y1="20" x2="4" y2="10" />
      <line x1="10" y1="20" x2="10" y2="4" />
      <line x1="16" y1="20" x2="16" y2="13" />
      <line x1="2" y1="20" x2="20" y2="20" />
    </>
  ),
  bot: (
    <>
      <rect x="4" y="8" width="16" height="11" rx="3" />
      <line x1="12" y1="8" x2="12" y2="4" />
      <circle cx="12" cy="3" r="1" />
      <circle cx="9" cy="13" r="1" />
      <circle cx="15" cy="13" r="1" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 4.2a3 3 0 0 1 0 5.6" />
      <path d="M17.5 14.2c2 .9 3.5 2.9 3.5 5.3" />
    </>
  ),
  phone: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="3" />
      <line x1="10.5" y1="18" x2="13.5" y2="18" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M4.2 7l2.6 1.5M17.2 15.5l2.6 1.5M4.2 17l2.6-1.5M17.2 8.5l2.6-1.5" />
    </>
  ),
  card: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <line x1="2.5" y1="9.5" x2="21.5" y2="9.5" />
      <line x1="6" y1="14.5" x2="10" y2="14.5" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M5.5 5.5l3.7 3.7M14.8 14.8l3.7 3.7M18.5 5.5l-3.7 3.7M9.2 14.8l-3.7 3.7" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  bolt: (
    <>
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </>
  ),
  trending: (
    <>
      <path d="M3 17l6-6 4 4 7-8" />
      <path d="M15 7h5v5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c0-3.6 3.4-6.5 7.5-6.5s7.5 2.9 7.5 6.5" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3 2.5 20h19L12 3z" />
      <line x1="12" y1="10" x2="12" y2="14.5" />
      <circle cx="12" cy="17.3" r="0.6" />
    </>
  ),
  link: (
    <>
      <path d="M9 15l6-6" />
      <path d="M11 6.5l1.5-1.5a4 4 0 0 1 5.7 5.7L16.5 12.5" />
      <path d="M13 17.5l-1.5 1.5a4 4 0 0 1-5.7-5.7L7.5 11.5" />
    </>
  ),
  check: (
    <>
      <path d="M4 12.5l5 5 11-11" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <line x1="4" y1="13" x2="20" y2="13" />
      <line x1="12" y1="9" x2="12" y2="20" />
      <path d="M12 9S10.5 4 8 4.5 9 9 12 9zM12 9s1.5-5 4-4.5S15 9 12 9z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 2.5v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9v-5z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  doc: (
    <>
      <path d="M6 3h8l4 4v14a0 0 0 0 1 0 0H6a0 0 0 0 1 0 0V3z" />
      <path d="M14 3v4h4" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="15" y2="16" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" />
      <path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z" />
    </>
  ),
  arrow: (
    <>
      <line x1="4" y1="12" x2="19" y2="12" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  store: (
    <>
      <path d="M4 9.5 5.2 4.5h13.6L20 9.5" />
      <path d="M4 9.5c0 1.5 1 2.5 2.3 2.5S8.7 11 8.7 9.5c0 1.5 1 2.5 2.3 2.5s2.3-1 2.3-2.5c0 1.5 1 2.5 2.3 2.5s2.4-1 2.1-2.5" />
      <path d="M5.5 12v7.5h13V12" />
      <path d="M10 19.5v-4h4v4" />
    </>
  ),
  star: (
    <>
      <path d="M12 3.5l2.6 5.3 5.9.8-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8-4.3-4.1 5.9-.8z" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  sliders: (
    <>
      <line x1="4" y1="8" x2="20" y2="8" />
      <line x1="4" y1="16" x2="20" y2="16" />
      <circle cx="9" cy="8" r="2.2" />
      <circle cx="15" cy="16" r="2.2" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 1 0-.9 4.5" />
      <path d="M20 5v6h-6" />
    </>
  ),
  wrench: (
    <>
      <path d="M15 7a4 4 0 0 1-5.2 5.2L5 17l2 2 4.8-4.8A4 4 0 0 0 17 9l-2.2 2.2-2-2L15 7z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <line x1="16" y1="16" x2="21" y2="21" />
    </>
  ),
};

export function Icon({
  name,
  size = 20,
  ...rest
}: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {P[name]}
    </svg>
  );
}
