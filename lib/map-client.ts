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
  schedule?: unknown; // jsonb
  payment?: string[] | null; // array
  cancelamento?: string | null;
  scheduling_info?: string | null;
  collect_data?: boolean | null;
  data_fields?: string[] | null;
  off_hours_message?: string | null;
  welcome_message?: string | null;
  evolution_instance?: string | null;
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

  return {
    ...CONFIG_PADRAO,
    nome_negocio: row.nome ?? "",
    segmento: row.segment ?? CONFIG_PADRAO.segmento,
    tom: TOM_PARA_UI[(row.tone ?? "").toLowerCase()] ?? "amigavel",
    nome_ia: row.assistant_name ?? "",
    servicos,
    formas_pagamento: Array.isArray(row.payment)
      ? row.payment
      : CONFIG_PADRAO.formas_pagamento,
    horarios,
    msg_saudacao: row.welcome_message ?? CONFIG_PADRAO.msg_saudacao,
    msg_fora_horario: row.off_hours_message ?? CONFIG_PADRAO.msg_fora_horario,
    perguntar_nome: row.collect_data ?? false,
    link_agendamento: row.scheduling_info ?? "",
    ativa: row.ia_active ?? false,
    numero_whatsapp: row.evolution_instance ?? null,
  };
}

// ---- ConfigIA (UI) → colunas de clients (banco) ----
export function configParaClient(cfg: ConfigIA): ClientRow {
  return {
    nome: cfg.nome_negocio,
    segment: cfg.segmento,
    tone: cfg.tom,
    assistant_name: cfg.nome_ia || null,
    services: cfg.servicos, // grava como jsonb (array de strings)
    schedule: mapScheduleParaBanco(cfg.horarios),
    payment: cfg.formas_pagamento,
    scheduling_info: cfg.link_agendamento || null,
    collect_data: cfg.perguntar_nome,
    welcome_message: cfg.msg_saudacao,
    off_hours_message: cfg.msg_fora_horario,
    ia_active: cfg.ativa,
    updated_at: new Date().toISOString(),
  };
}

// Horários: a UI usa { seg: {aberto,abre,fecha}, ... }.
// Guardamos no schedule (jsonb) no MESMO formato — simples e reversível.
function mapScheduleParaUI(schedule: unknown): ConfigIA["horarios"] {
  if (schedule && typeof schedule === "object" && !Array.isArray(schedule)) {
    const s = schedule as Record<string, unknown>;
    // Se já está no formato da UI (tem 'seg'), usa direto.
    if (s.seg || s.dom) return schedule as ConfigIA["horarios"];
  }
  return CONFIG_PADRAO.horarios;
}

function mapScheduleParaBanco(horarios: ConfigIA["horarios"]): unknown {
  // Guarda no mesmo formato da UI (jsonb aceita).
  return horarios;
}
