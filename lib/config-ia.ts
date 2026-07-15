// Formato da configuração da IA — o que a tela Minha IA grava
// e o que o motor do WhatsApp lê para montar o prompt do Claude.

export type ConfigIA = {
  // Negócio
  nome_negocio: string;
  segmento: string;
  uf: string;
  cidade: string;
  bairro: string;
  // Tom
  tom: "amigavel" | "profissional" | "direto" | "sofisticado";
  emojis: "moderado" | "bastante" | "nenhum";
  nome_ia: string;
  // O que a IA sabe
  servicos: string[];
  formas_pagamento: string[];
  entrega: string;
  agendamento: "sim" | "nao" | "link";
  link_agendamento: string;
  contexto_extra: string;
  // Horários: cada dia com aberto + faixa
  horarios: Record<
    string,
    { aberto: boolean; abre: string; fecha: string }
  >;
  responder_fora_horario: boolean;
  informar_reabertura: boolean;
  // Mensagens
  msg_saudacao: string;
  msg_fora_horario: string;
  msg_encerramento: string;
  // Comportamento
  pode_informar_precos: boolean;
  pode_agendar: boolean;
  perguntar_nome: boolean;
  transferir_humano: boolean;
  receber_reclamacoes: boolean;
  // Estado
  ativa: boolean;
  numero_whatsapp: string | null;
};

export const DIAS = [
  "seg",
  "ter",
  "qua",
  "qui",
  "sex",
  "sab",
  "dom",
] as const;

export const CONFIG_PADRAO: ConfigIA = {
  nome_negocio: "",
  segmento: "Beleza e Estética",
  uf: "RS",
  cidade: "",
  bairro: "",
  tom: "amigavel",
  emojis: "moderado",
  nome_ia: "",
  servicos: [],
  formas_pagamento: ["Pix", "Cartão de crédito", "Dinheiro"],
  entrega: "Não fazemos entrega",
  agendamento: "sim",
  link_agendamento: "",
  contexto_extra: "",
  horarios: {
    seg: { aberto: true, abre: "09:00", fecha: "18:00" },
    ter: { aberto: true, abre: "09:00", fecha: "18:00" },
    qua: { aberto: true, abre: "09:00", fecha: "18:00" },
    qui: { aberto: true, abre: "09:00", fecha: "18:00" },
    sex: { aberto: true, abre: "09:00", fecha: "18:00" },
    sab: { aberto: true, abre: "09:00", fecha: "14:00" },
    dom: { aberto: false, abre: "09:00", fecha: "18:00" },
  },
  responder_fora_horario: true,
  informar_reabertura: true,
  msg_saudacao:
    "Olá! 😊 Bem-vindo ao {nome_negocio}! Sou a {nome_ia}. Como posso ajudar você hoje?",
  msg_fora_horario:
    "Olá! 😊 No momento o {nome_negocio} está fechado. Funcionamos {horario_funcionamento}. Assim que abrirmos eu te respondo!",
  msg_encerramento:
    "Foi um prazer atender! 😊 Qualquer coisa é só chamar. Tenha um ótimo dia! ☀️",
  pode_informar_precos: true,
  pode_agendar: true,
  perguntar_nome: false,
  transferir_humano: true,
  receber_reclamacoes: false,
  ativa: false,
  numero_whatsapp: null,
};
