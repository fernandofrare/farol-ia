# 🔒 Farol IA — Segurança (estado atual)

Endurecimento aplicado e testado. Duas rodadas: correções críticas + preparação para cadastro público.

## ✅ RODADA 1 — Correções críticas (testadas)

### Validação forte de input
`lib/validar-config.ts` — saneamento campo a campo antes do banco/Claude.
Teto 100KB, limites por campo, tipos validados, telefone só dígitos, URLs só http(s), controle-chars removidos.
**Testado:** 6/6 ataques bloqueados (payload 700KB, texto gigante, tom inválido, array malicioso, `javascript:`, null bytes).

### Rate limiting
Login (8/5min por IP), recuperação (5/15min), config (20/min por usuário).
**Testado:** força bruta freada na 9ª tentativa, isolamento por IP.

### Timing-safe no webhook (motor)
`crypto.timingSafeEqual`. **Testado:** aceita correto, rejeita errado/tamanho diferente.

### Security headers + erros genéricos
X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS. Postgres não vaza mais detalhe.

## ✅ RODADA 2 — Preparação para público (testadas)

### Rate limit GLOBAL via Upstash Redis
`lib/rate-limit-redis.ts` — limite global real para Vercel serverless (INCR+EXPIRE atômico).
**Fallback automático para memória se o Redis não estiver configurado — testado, nada quebra sem Upstash.**
Para ativar: criar banco grátis em upstash.com e preencher `UPSTASH_REDIS_REST_URL` + `_TOKEN` no `.env`.

### CSP estrita (Content-Security-Policy)
Inventário real: Google Fonts (style/font) + Supabase (connect). Bloqueia script/objeto externo,
`frame-ancestors 'none'`, `form-action 'self'`, `object-src 'none'`.

### Proteção do /nova-senha
Só mostra o formulário com sessão de recuperação válida (evento PASSWORD_RECOVERY).
Link inválido/expirado → aviso claro + botão para novo link.

### Anti-CSRF no logout
Verificação de origem no POST de signout.

## 🟡 Pendente (config no Supabase, não código)
- **Confirmação de e-mail obrigatória:** Supabase → Authentication → Providers → Email →
  ativar "Confirm email". Impede cadastro com e-mail de terceiros.
- **Senha mínima:** Supabase → Authentication → Policies → definir tamanho/força mínima.
- **Captcha no login** (opcional): Supabase suporta hCaptcha/Turnstile nativo.

## 🟢 Confirmado correto
Auth real (`getUser` no servidor) · acesso por `user_id` + RLS · service key isolada no VPS.

## Veredito
- **Beta fechado:** pronto.
- **Cadastro público:** após ligar Upstash + os 3 itens 🟡 do Supabase, adequado.
- **Escala grande:** auditoria de profissional de segurança dedicado.
