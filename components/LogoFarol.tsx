// Logo Farol IA — wordmark (URW Gothic vetorizado em paths; independente de fonte).
// Drop-in: mantem props width/height/showTagline. "IA" em laranja da marca (#FB7A2A).

export function LogoFarol({
  width = 160,
  height = 46,
  showTagline = false,
  color = "#f4f4f6",
}: {
  width?: number;
  height?: number;
  showTagline?: boolean;
  color?: string;
}) {
  const vbH = 915 + (showTagline ? 360 : 0);
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 5562 ${vbH}`}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Farol IA"
    >
      <g transform="translate(88,827) scale(1,-1)">
        <g fill={color} dangerouslySetInnerHTML={{ __html: `<path transform="translate(0,0)" d="M76 0H150V338H440V405H150V672H451V739H76Z"/><path transform="translate(630,0)" d="M11 0H89L197 249H541L648 0H729L411 739H328ZM225 316 370 655 512 316Z"/><path transform="translate(1515,0)" d="M359 276C501 291 577 369 577 502C577 594 538 664 466 703C420 728 357 739 259 739H76V0H150V672H254C332 672 384 664 424 645C474 621 502 571 502 504C502 420 464 367 390 348C355 339 307 335 225 335L474 0H566Z"/><path transform="translate(2267,0)" d="M435 752C223 752 44 579 44 374C44 159 218 -13 436 -13C649 -13 825 160 825 369C825 580 649 752 435 752ZM435 684C608 684 750 541 750 368C750 197 607 55 436 55C260 55 119 197 119 372C119 541 264 684 435 684Z"/><path transform="translate(3281,0)" d="M76 0H456V67H150V739H76Z"/>` }} />
        <g fill="#FB7A2A" dangerouslySetInnerHTML={{ __html: `<path transform="translate(4275,0)" d="M76 0H150V739H76Z"/><path transform="translate(4646,0)" d="M11 0H89L197 249H541L648 0H729L411 739H328ZM225 316 370 655 512 316Z"/>` }} />
      </g>
      {showTagline && (
        <text
          x="88"
          y="1145"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="130"
          letterSpacing="38"
          fill="#9a9aa6"
        >
          AUTOMACOES INTELIGENTES
        </text>
      )}
    </svg>
  );
}
