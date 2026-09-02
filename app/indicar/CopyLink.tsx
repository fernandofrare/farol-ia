"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // silencioso: alguns navegadores bloqueiam clipboard sem gesto
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        style={{
          flex: 1,
          minWidth: 240,
          padding: "11px 12px",
          borderRadius: 10,
          border: "1px solid var(--line)",
          background: "transparent",
          color: "inherit",
          fontSize: 14,
        }}
      />
      <button
        type="button"
        onClick={copiar}
        className="btn btn-primary"
        style={{ padding: "11px 18px", borderRadius: 10, cursor: "pointer", whiteSpace: "nowrap" }}
      >
        {copiado ? "Copiado! ✓" : "Copiar link"}
      </button>
    </div>
  );
}
