// docs/motor-meta/meta-demo.js
// DEMO "Teste sua IA" — handler do MOTOR no VPS.
//
// O cliente conversa com a PRÓPRIA IA treinada no negócio, SEM passar pela Meta.
// Reusa a MESMA montagem de prompt do atendimento real (src/prompt.js ->
// buildSystemPrompt), então o teste responde igual ao WhatsApp. Rate-limit por
// cliente via RPC demo_consume (Supabase), pra conter custo de token.
//
// DEPLOY (no VPS /opt/farol-motor/src): copiar este arquivo e montar no server.js:
//   app.use("/demo", require("./meta-demo").router);
//
// ENV necessárias no .env do motor (já existem hoje):
//   SUPABASE_URL / SUPABASE_SERVICE_KEY
//   ANTHROPIC_API_KEY
//   ANTHROPIC_MODEL        (ex.: claude-haiku-4-5 — o MESMO do atendimento)
//   MOTOR_TOKEN            (token compartilhado com o Next; header x-motor-token)
//   DEMO_MSG_LIMIT         (opcional, default 15) — mensagens de teste por cliente
//
// IMPORTANTE: importa buildSystemPrompt de ./prompt (o MESMO do atendimento).
// Se no teu motor o nome/caminho for outro, ajusta SÓ o require abaixo.

const express = require("express");
const { createClient } = require("@supabase/supabase-js");

// Fonte única da verdade do prompt (mesma do atendimento real):
const { buildSystemPrompt } = require("./prompt");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";
const LIMITE = Number(process.env.DEMO_MSG_LIMIT || 15);

async function gerarComClaude(systemPrompt, messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: String(m.content) })),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `anthropic ${res.status}`);
  return (data.content || []).map((c) => c.text || "").join("").trim();
}

const router = express.Router();

// Só aceita chamadas do Next com o token compartilhado.
router.use((req, res, next) => {
  if (req.get("x-motor-token") !== process.env.MOTOR_TOKEN) {
    return res.status(401).json({ erro: "não autorizado" });
  }
  next();
});

// POST /demo/gerar  { clientId, messages:[{role,content}] }
router.post("/gerar", express.json({ limit: "64kb" }), async (req, res) => {
  const { clientId, messages } = req.body || {};
  if (!clientId || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ erro: "clientId e messages são obrigatórios." });
  }

  try {
    // Linha real do cliente (config salva no "Minha IA").
    const { data: client, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!client) return res.status(404).json({ erro: "Cliente não encontrado." });
    if (client.suspended) return res.status(403).json({ erro: "Conta suspensa." });

    // Rate-limit ANTES de gastar token. remaining = -1 => limite atingido.
    const { data: remaining, error: rlErr } = await supabase.rpc("demo_consume", {
      p_client_id: clientId,
      p_limit: LIMITE,
    });
    if (rlErr) throw new Error(rlErr.message);
    if (remaining === -1) {
      return res.status(429).json({ erro: "Limite de mensagens de teste atingido.", remaining: 0 });
    }

    // MESMO prompt do atendimento real (await é seguro mesmo se for síncrono).
    const systemPrompt = await buildSystemPrompt(client);
    const reply = await gerarComClaude(systemPrompt, messages);

    return res.json({ reply, remaining });
  } catch (e) {
    console.error("[demo/gerar]", e.message);
    return res.status(502).json({ erro: "Falha ao gerar a resposta de teste." });
  }
});

module.exports = { router };
