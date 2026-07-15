// Logo Farol IA — Modelo 1 (aprovado).
// IMPORTANTE: o "IA" usa cor sólida #ff8a3d, nunca url(#gradiente) em tspan
// (o gradiente some quando o SVG é escalado).

export function LogoFarol({
  width = 160,
  height = 46,
  showTagline = true,
}: {
  width?: number;
  height?: number;
  showTagline?: boolean;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 280 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Farol IA"
    >
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f5b941" />
          <stop offset="1" stopColor="#e8590c" />
        </linearGradient>
        <linearGradient id="lg2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f5b941" stopOpacity=".85" />
          <stop offset="1" stopColor="#f5b941" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M38 26 L82 11 L82 18 L38 28 Z" fill="url(#lg2)" />
      <path d="M38 33 L82 33 L82 40 L38 35 Z" fill="url(#lg2)" opacity=".45" />
      <path d="M22 74 L26 34 L50 34 L54 74 Z" fill="url(#lg1)" />
      <rect x="26" y="42" width="24" height="4" fill="#0a0a0c" opacity=".38" />
      <rect x="27" y="52" width="22" height="4" fill="#0a0a0c" opacity=".38" />
      <rect x="28" y="62" width="20" height="4" fill="#0a0a0c" opacity=".38" />
      <rect x="30" y="21" width="16" height="14" rx="2" fill="#ff8a3d" />
      <circle cx="38" cy="28" r="4" fill="#fff2dc" />
      <path d="M31 21 L45 21 L42 15 L34 15 Z" fill="url(#lg1)" />
      <rect x="18" y="74" width="40" height="5" rx="2.5" fill="url(#lg1)" />
      <text
        x="68"
        y="45"
        fontFamily="Montserrat,sans-serif"
        fontWeight="800"
        fontSize="28"
        fill="#f4f4f6"
        letterSpacing="-0.8"
      >
        Farol <tspan fill="#ff8a3d">IA</tspan>
      </text>
      {showTagline && (
        <text
          x="69"
          y="62"
          fontFamily="Montserrat,sans-serif"
          fontWeight="600"
          fontSize="8"
          fill="#9a9aa6"
          letterSpacing="2.5"
        >
          AUTOMAÇÕES INTELIGENTES
        </text>
      )}
    </svg>
  );
}
