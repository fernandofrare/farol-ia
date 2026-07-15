// ============================================================
// Rate limiting com Upstash Redis (REST) — limite GLOBAL, ideal
// para Vercel serverless. Cai para in-memory se o Redis não estiver
// configurado, então nada quebra antes de você criar a conta.
// ============================================================

import { rateLimit as rateLimitMemoria } from "./rate-limit";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const redisAtivo = Boolean(REDIS_URL && REDIS_TOKEN);

type Resultado = { permitido: boolean; restante: number; esperaSeg: number };

// Implementa janela fixa via INCR + EXPIRE (atômico no Redis).
// Usa pipeline REST do Upstash para 1 ida e volta.
async function rateLimitRedis(
  chave: string,
  max: number,
  janelaSeg: number
): Promise<Resultado> {
  try {
    const resp = await fetch(`${REDIS_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      // INCR conta a requisição; EXPIRE só age na primeira (NX).
      body: JSON.stringify([
        ["INCR", `rl:${chave}`],
        ["EXPIRE", `rl:${chave}`, String(janelaSeg), "NX"],
        ["TTL", `rl:${chave}`],
      ]),
      // Timeout defensivo: se o Redis demorar, não trava a requisição.
      signal: AbortSignal.timeout(2000),
    });

    if (!resp.ok) throw new Error(`upstash ${resp.status}`);
    const dados = (await resp.json()) as Array<{ result: number }>;
    const contagem = dados[0]?.result ?? 1;
    const ttl = dados[2]?.result ?? janelaSeg;

    if (contagem > max) {
      return { permitido: false, restante: 0, esperaSeg: ttl > 0 ? ttl : janelaSeg };
    }
    return { permitido: true, restante: Math.max(0, max - contagem), esperaSeg: 0 };
  } catch (err) {
    // Falha do Redis NÃO deve bloquear usuários legítimos.
    // Cai para o limite em memória desta instância (degradação graciosa).
    console.error("[ratelimit] Redis indisponível, usando memória:", (err as Error).message);
    return rateLimitMemoria(chave, max, janelaSeg * 1000);
  }
}

/**
 * Rate limit unificado. Usa Redis se configurado; senão, memória.
 * @param chave identificador (ex.: "login:IP")
 * @param max requisições permitidas na janela
 * @param janelaSeg janela em SEGUNDOS
 */
export async function checarLimite(
  chave: string,
  max: number,
  janelaSeg: number
): Promise<Resultado> {
  if (redisAtivo) {
    return rateLimitRedis(chave, max, janelaSeg);
  }
  return rateLimitMemoria(chave, max, janelaSeg * 1000);
}

export function ipDaRequisicao(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "desconhecido";
}

export const usandoRedis = redisAtivo;
