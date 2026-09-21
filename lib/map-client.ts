import type { ConfigIA } from "./config-ia";
import { CONFIG_PADRAO } from "./config-ia";

// ============================================================
// Camada de tradução entre o formato da UI (ConfigIA) e as
// colunas REAIS da tabela `clients` no Supabase.
// A UI não muda; aqui convertemos nos dois sentidos.
// ============================================================

// Linha da tabela clients (apenas as colunas que usamos).
export type ClientRow = {
  id?: string;
  user_id?: string;
  nome?: string | null;
  email?: string | null;
  segment?: string | null;
  tone?: string | null;
  ia_active?: boolean | null;
  assistant_name?: string | null;
  services?: unknown; // jsonb
  catalogo?: string | null;
  schedule?: unknown; // jsonb
  payment?: string[] | null; // array
  scheduling_info?: string | null;
  collect_data?: boolean | null;
  off_hours_message?: string | null;
  welcome_message?: string | null;
  contexto_extra?: string | null;
  evolution_instance?: string | null;
  // Localização
  uf?: string | null;
  cidade?: string | null;
  bairro?: string | null;
  // Comunicação / atendimento
  emojis?: string | null;
  entrega?: string | null;
  agendamento?: string | null;
  msg_encerramento?: string | null;
  // Toggles de horário
  responder_fora_horario?: boolean | null;
  informar_reabertura?: boolean | null;
  // Toggles de comportamento
  pode_informar_precos?: boolean | null;
  pode_agendar?: boolean | null;
  transferir_humano?: boolean | null;
  receber_reclamacoes?: boolean | null;
  updated_at?: string | null;
};

// Mapeia o tom da UI (enum) para texto livre de `clients.tone` e volta.
const TOM_PARA_UI: Record<string, ConfigIA["tom"]> = {
  amigavel: "amigavel",
  amigável: "amigavel",
  profissional: "profissional",
  direto: "direto",
  sofisticado: "sofisticado",
};

const EMOJIS_VALIDOS: ConfigIA["emojis"][] = ["moderado", "bastante", "nenhum"];
const AGEND_VALIDOS: ConfigIA["agendamento"][] = ["sim", "nao", "link"];

// ---- clients (banco) → ConfigIA (UI) ----
export function clientParaConfig(row: ClientRow | null): ConfigIA {
  if (!row) return CONFIG_PADRAO;

  // services pode ser array de strings ou de objetos {nome}.
  let servicos: string[] = [];
  if (Array.isArray(row.services)) {
    servicos = row.services
      .map((s) => (typeof s === "string" ? s : (s as { nome?: string })?.nome))
      .filter((s): s is string => Boolean(s));
  }

  // schedule (jsonb) — tenta casar com o formato de horários da UI.
  const horarios = mapScheduleParaUI(row.schedule);

  const emojis = EMOJIS_VALIDOS.includes(row.emojis as ConfigIA["emojis"])
    ? (row.emojis as ConfigIA["emojis"])
    : CONFIG_PADRAO.emojis;
  const agendamento = AGEND_VALIDOS.includes(row.agendamento as ConfigIA["agendamento"])
    ? (row.agendamento as ConfigIA["agendamento"])
    : CONFIG_PADRAO.agendamento;

  return {
    ...CONFIG_PADRAO,
    nome_negocio: row.nome ?? "",
    segmento: row.segment ?? CONFIG_PADRAO.segmento,
    uf: row.uf ?? CONFIG_PADRAO.uf,
    cidade: row.cidade ?? "",
    bairro: row.bairro ?? "",
    tom: TOM_PARA_UI[(row.tone ?? "").toLowerCase()] ?? "amigavel",
    emojis,
    nome_ia: row.assistant_name ?? "",
    servicos,
    catalogo: row.catalogo ?? "",
    formas_pagamento: Array.isArray(row.payment)
      ? row.payment
      : CONFIG_PADRAO.formas_pagamento,
    entrega: row.entrega ?? CONFIG_PADRAO.entrega,
    agendamento,
    link_agendamento: row.scheduling_info ?? "",
    contexto_extra: row.contexto_extra ?? "",
    horarios,
    responder_fora_horario: row.responder_fora_horario ?? CONFIG_PADRAO.responder_fora_horario,
    informar_reabertura: row.informar_reabertura ?? CONFIG_PADRAO.informar_reabertura,
    msg_saudacao: row.welcome_message ?? CONFIG_PADRAO.msg_saudacao,
    msg_fora_horario: row.off_hours_message ?? CONFIG_PADRAO.msg_fora_horario,
    msg_encerramento: row.msg_encerramento ?? CONFIG_PADRAO.msg_encerramento,
    pode_informar_precos: row.pode_informar_precos ?? CONFIG_PADRAO.pode_informar_precos,
    pode_agendar: row.pode_agendar ?? CONFIG_PADRAO.pode_agendar,
    perguntar_nome: row.collect_data ?? false,
    transferir_humano: row.transferir_humano ?? CONFIG_PADRAO.transferir_humano,
    receber_reclamacoes: row.receber_reclamacoes ?? CONFIG_PADRAO.receber_reclamacoes,
    ativa: row.ia_active ?? false,
    numero_whatsapp: row.evolution_instance ?? null,
  };
}

// ---- ConfigIA (UI) → colunas de clients (banco) ----
export function configParaClient(cfg: ConfigIA): ClientRow {
  return {
    nome: cfg.nome_negocio,
    segment: cfg.segmento,
    uf: cfg.uf,
    cidade: cfg.cidade || null,
    bairro: cfg.bairro || null,
    tone: cfg.tom,
    emojis: cfg.emojis,
    assistant_name: cfg.nome_ia || null,
    services: cfg.servicos, // grava como jsonb (array de strings)
    catalogo: cfg.catalogo || null,
    schedule: mapScheduleParaBanco(cfg.horarios),
    payment: cfg.formas_pagamento,
    entrega: cfg.entrega,
    agendamento: cfg.agendamento,
    scheduling_info: cfg.link_agendamento || null,
    contexto_extra: cfg.contexto_extra || null,
    responder_fora_horario: cfg.responder_fora_horario,
    informar_reabertura: cfg.informar_reabertura,
    welcome_message: cfg.msg_saudacao,
    off_hours_message: cfg.msg_fora_horario,
    msg_encerramento: cfg.msg_encerramento,
    pode_informar_precos: cfg.pode_informar_precos,
    pode_agendar: cfg.pode_agendar,
    collect_data: cfg.perguntar_nome,
    transferir_humano: cfg.transferir_humano,
    receber_reclamacoes: cfg.receber_reclamacoes,
    ia_active: cfg.ativa,
    updated_at: new Date().toISOString(),
  };
}

// Horários: a UI usa { seg: {aberto,abre,fecha}, ... }.
// Guardamos no schedule (jsonb) no MESMO formato — simples e reversível.
function mapScheduleParaUI(schedule: unknown): ConfigIA["horarios"] {
  if (schedule && typeof schedule === "object" && !Array.isArray(schedule)) {
    const s = schedule as Record<string, unknown>;
    if (s.seg || s.dom) return schedule as ConfigIA["horarios"];
  }
  return CONFIG_PADRAO.horarios;
}

function mapScheduleParaBanco(horarios: ConfigIA["horarios"]): unknown {
  return horarios;
}
