// docs/motor-meta/meta-demo.js
// DEMO "Teste sua IA" — handler do MOTOR no VPS.
//
// O cliente conversa com a PRÓPRIA IA treinada no negócio, SEM passar pela Meta.
// Reusa a MESMA geração do atendimento real: buildSystemPrompt (src/prompt.js) +
// gerarResposta (src/claude.js) + o client Supabase (src/db.js). Rate-limit por
// cliente via RPC demo_consume (Supabase), pra conter custo de token.
//
// DEPLOY (no VPS /opt/farol-motor/src): copiar este arquivo e montar no server.js,
// junto das outras rotas (pode ser depois do app.listen, como o /meta/onboard):
//   app.use("/demo", require("./meta-demo").router);
//
// ENV: nenhuma nova além de MOTOR_TOKEN (já usado pelo /meta/onboard) e, opcional,
//   DEMO_MSG_LIMIT (default 15). Supabase/Anthropic já vêm de db.js e claude.js.

const express = require("express");
const { supabase } = require("./db");
const { buildSystemPrompt } = require("./prompt");
const { gerarResposta } = require("./claude");

const LIMITE = Number(process.env.DEMO_MSG_LIMIT || 15);

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

    // MESMA geração do atendimento real (prompt + claude do motor).
    const historico = messages.map((m) => ({ role: m.role, content: String(m.content) }));
    const reply = await gerarResposta(buildSystemPrompt(client), historico);
    if (!reply) {
      return res.status(502).json({ erro: "Não consegui responder agora. Tente de novo." });
    }

    return res.json({ reply, remaining });
  } catch (e) {
    console.error("[demo/gerar]", e.message);
    return res.status(502).json({ erro: "Falha ao gerar a resposta de teste." });
  }
});

module.exports = { router };
