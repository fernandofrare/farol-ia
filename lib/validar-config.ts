import type { ConfigIA } from "./config-ia";

// ============================================================
// Validação forte da ConfigIA antes de gravar no banco.
// Objetivo: impedir payloads maliciosos/malformados —
// tamanho excessivo, tipos errados, injeção via campos livres.
// ============================================================

// Limites de tamanho por campo (caracteres). Generosos, mas finitos.
const LIM = {
  curto: 120, // nomes, cidade, etc.
  medio: 500, // mensagens
  longo: 2000, // contexto_extra
  item: 80, // cada serviço/pagamento
  maxItens: 50, // nº de serviços/pagamentos
  maxJsonBytes: 100_000, // teto do payload inteiro (~100 KB)
};

const TONS = ["amigavel", "profissional", "direto", "sofisticado"];
const EMOJIS = ["moderado", "bastante", "nenhum"];
const AGEND = ["sim", "nao", "link"];
const DIAS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
const HORA_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const UF_RE = /^[A-Z]{2}$/;

export type ResultadoValidacao =
  | { ok: true; config: ConfigIA }
  | { ok: false; erro: string };

function str(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  // Remove caracteres de controle (exceto \n e \t) e corta no limite.
  // eslint-disable-next-line no-control-regex
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").slice(0, max);
}

function bool(v: unknown, padrao = false): boolean {
  return typeof v === "boolean" ? v : padrao;
}

function umDe<T extends string>(v: unknown, lista: T[], padrao: T): T {
  return typeof v === "string" && lista.includes(v as T) ? (v as T) : padrao;
}

function listaStrings(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => typeof x === "string")
    .slice(0, LIM.maxItens)
    .map((x) => str(x, LIM.item))
    .filter(Boolean);
}

export function validarConfig(entrada: unknown): ResultadoValidacao {
  // 1) Teto de tamanho do payload inteiro (anti-DoS / anti-storage abuse).
  try {
    const bytes = Buffer.byteLength(JSON.stringify(entrada ?? {}), "utf8");
    if (bytes > LIM.maxJsonBytes) {
      return { ok: false, erro: "Configuração excede o tamanho máximo permitido." };
    }
  } catch {
    return { ok: false, erro: "Configuração inválida." };
  }

  if (!entrada || typeof entrada !== "object") {
    return { ok: false, erro: "Configuração ausente ou inválida." };
  }
  const e = entrada as Record<string, unknown>;

  // 2) Horários: reconstrói apenas dias válidos com horas no formato certo.
  const horarios: ConfigIA["horarios"] = {};
  const hEntrada = (e.horarios ?? {}) as Record<string, unknown>;
  for (const dia of DIAS) {
    const h = (hEntrada[dia] ?? {}) as Record<string, unknown>;
    const abre = typeof h.abre === "string" && HORA_RE.test(h.abre) ? h.abre : "09:00";
    const fecha = typeof h.fecha === "string" && HORA_RE.test(h.fecha) ? h.fecha : "18:00";
    horarios[dia] = { aberto: bool(h.aberto, false), abre, fecha };
  }

  // 3) Monta a config saneada — campo a campo, nada passa cru.
  const uf = typeof e.uf === "string" && UF_RE.test(e.uf) ? e.uf : "RS";

  const config: ConfigIA = {
    nome_negocio: str(e.nome_negocio, LIM.curto),
    segmento: str(e.segmento, LIM.curto),
    uf,
    cidade: str(e.cidade, LIM.curto),
    bairro: str(e.bairro, LIM.curto),
    tom: umDe(e.tom, TONS, "amigavel") as ConfigIA["tom"],
    emojis: umDe(e.emojis, EMOJIS, "moderado") as ConfigIA["emojis"],
    nome_ia: str(e.nome_ia, LIM.curto),
    servicos: listaStrings(e.servicos),
    formas_pagamento: listaStrings(e.formas_pagamento),
    entrega: str(e.entrega, LIM.curto),
    agendamento: umDe(e.agendamento, AGEND, "sim") as ConfigIA["agendamento"],
    link_agendamento: str(e.link_agendamento, LIM.curto),
    contexto_extra: str(e.contexto_extra, LIM.longo),
    horarios,
    responder_fora_horario: bool(e.responder_fora_horario, true),
    informar_reabertura: bool(e.informar_reabertura, true),
    msg_saudacao: str(e.msg_saudacao, LIM.medio),
    msg_fora_horario: str(e.msg_fora_horario, LIM.medio),
    msg_encerramento: str(e.msg_encerramento, LIM.medio),
    pode_informar_precos: bool(e.pode_informar_precos, true),
    pode_agendar: bool(e.pode_agendar, true),
    perguntar_nome: bool(e.perguntar_nome, false),
    transferir_humano: bool(e.transferir_humano, true),
    receber_reclamacoes: bool(e.receber_reclamacoes, false),
    ativa: bool(e.ativa, false),
    // numero_whatsapp: só dígitos, com tamanho de telefone. null se inválido.
    numero_whatsapp:
      typeof e.numero_whatsapp === "string"
        ? (e.numero_whatsapp.replace(/\D/g, "").slice(0, 15) || null)
        : null,
  };

  // 4) Link de agendamento: se informado, precisa ser http(s) válido.
  if (config.link_agendamento) {
    try {
      const u = new URL(config.link_agendamento);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        config.link_agendamento = "";
      }
    } catch {
      config.link_agendamento = "";
    }
  }

  return { ok: true, config };
}
