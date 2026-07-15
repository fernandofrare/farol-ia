// ============================================================
// Rate limiting simples em memória (janela deslizante por chave).
// Suficiente para o beta (1 instância). Para escala horizontal,
// migrar para Upstash Redis — ver nota no fim do arquivo.
// ============================================================

type Registro = { contagem: number; reinicia: number };

// Mapa global persistente entre requisições no mesmo processo.
const baldes = new Map<string, Registro>();

// Limpeza periódica para não vazar memória.
let ultimaLimpeza = Date.now();
function limparExpirados(agora: number) {
  if (agora - ultimaLimpeza < 60_000) return;
  ultimaLimpeza = agora;
  for (const [chave, reg] of baldes) {
    if (reg.reinicia < agora) baldes.delete(chave);
  }
}

/**
 * Verifica e consome 1 unidade do limite para `chave`.
 * @param chave identificador (ex.: "login:IP" ou "config:userId")
 * @param max número de requisições permitidas na janela
 * @param janelaMs tamanho da janela em milissegundos
 * @returns { permitido, restante, esperaSeg }
 */
export function rateLimit(
  chave: string,
  max: number,
  janelaMs: number
): { permitido: boolean; restante: number; esperaSeg: number } {
  const agora = Date.now();
  limparExpirados(agora);

  const reg = baldes.get(chave);

  if (!reg || reg.reinicia < agora) {
    baldes.set(chave, { contagem: 1, reinicia: agora + janelaMs });
    return { permitido: true, restante: max - 1, esperaSeg: 0 };
  }

  if (reg.contagem >= max) {
    return {
      permitido: false,
      restante: 0,
      esperaSeg: Math.ceil((reg.reinicia - agora) / 1000),
    };
  }

  reg.contagem += 1;
  return { permitido: true, restante: max - reg.contagem, esperaSeg: 0 };
}

// Extrai um IP utilizável dos headers (Vercel/proxy).
export function ipDaRequisicao(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "desconhecido";
}

// NOTA DE ESCALA:
// Em memória, o limite é por instância. Na Vercel, múltiplas instâncias
// significam que o limite efetivo é maior que o configurado. Para limite
// rígido e global, trocar este módulo por Upstash Redis (@upstash/ratelimit).
