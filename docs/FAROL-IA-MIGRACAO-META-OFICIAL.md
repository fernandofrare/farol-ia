# Farol IA — Migração para a API Oficial da Meta (WhatsApp Cloud API)

_Decidido em 22/09/2026. Este documento é a planta da migração. Reflete o estado REAL do que muda, não intenções vagas._

## 1. Por que migrar (decisão)

A base atual (Evolution API / Baileys, não-oficial) roda num **único VPS / único IP compartilhado por todos os clientes**. Isso cria um **ponto único de falha sistêmico**: o número de **um** cliente com uso errado, disparo indevido ou problema qualquer pode fazer o WhatsApp aplicar um **cooldown no IP do VPS** e **derrubar o atendimento de TODOS os clientes ao mesmo tempo**. Com público-alvo pouco técnico, isso aconteceria cedo e repetidamente.

Vivemos um preview disso em 21–22/09: o vínculo de dispositivo foi bloqueado em múltiplos números (inclusive um número pessoal confiável) através do IP do VPS — bloqueio opaco, sem prazo, não corrigível por código.

Conclusão: a stack não-oficial não é base sólida para um SaaS multi-cliente. Migramos para a **API Oficial da Meta antes do lançamento**.

## 2. O que MUDA e o que FICA

**Fica (reaproveitável, ~70% do produto):**
- Cérebro de IA: `src/claude.js`, `src/prompt.js` (o buildSystemPrompt com todos os campos da "Minha IA") — intocados.
- Painel/central: CRM, "Minha IA", dashboard, cadastro, indicação, páginas legais — intocados.
- Supabase (Auth, RLS, tabela `clients` com a config do negócio) — intocado, com pequenos acréscimos de colunas (ver §5).
- Lógica de debounce/junção de rajadas (`src/debounce.js`) — reaproveitável.

**Muda (só a camada de transporte do WhatsApp):**
- `src/evolution.js` → substituído por `src/meta.js` (envio via Graph API).
- `src/whatsapp.js` (rotas de QR/status/conexão via Evolution) → substituído pelo fluxo de webhook + Embedded Signup da Meta.
- `src/server.js`: o webhook deixa de receber o formato Evolution e passa a receber o formato da Meta (verificação GET + POST com validação de assinatura).
- **Anti-ban (delay 5–9s)**: deixa de ser necessário na API oficial (ela tem rate limits próprios e não bane uso normal). Simplifica o motor.

## 3. Como a API oficial funciona (o essencial pro nosso caso)

- **Recebimento:** a Meta envia cada mensagem recebida para um **webhook** nosso (uma URL pública). Precisa: (a) responder o desafio GET de verificação com o `VERIFY_TOKEN`; (b) validar a assinatura `X-Hub-Signature-256` (HMAC com o App Secret) em cada POST.
- **Envio:** `POST https://graph.facebook.com/vXX.0/{PHONE_NUMBER_ID}/messages` com `Authorization: Bearer {ACCESS_TOKEN}`.
- **Janela de 24h (mensagem de serviço):** quando o cliente inicia a conversa, abre uma janela de 24h em que podemos responder com **texto livre** (é o que a IA faz). **Encaixa perfeitamente** no nosso modelo "a IA só responde quem inicia".
- **Fora da janela / iniciar conversa:** exige **template pré-aprovado** pela Meta. Relevante para: lembrete de fim de trial, reengajamento. Precisaremos cadastrar 1–2 templates.
- **Custo:** mensagem de serviço é grátis hoje (franquia 1.000/mês), mas passa a ser cobrada a partir de **01/10/2026** (tarifa a confirmar). Ajustar o preço do plano conforme a tarifa, mantendo margem disruptiva abaixo do mercado.

## 4. Multi-tenant: cada cliente com sua própria conta (o ganho principal)

Cada cliente conecta a **própria conta WhatsApp Business (WABA)** — isolada. Problema de um não afeta os outros. Conexão via **Embedded Signup** da Meta (fluxo dentro do nosso app, poucos cliques para quem já tem conta Meta).

Guardamos por cliente: `phone_number_id`, `waba_id` e o `access_token` do cliente. O motor usa o token do cliente para enviar as respostas daquele número.

## 5. Mudanças no banco (`clients`)

Acrescentar colunas (mantendo `evolution_instance` durante a transição):
- `meta_phone_number_id` (text)
- `meta_waba_id` (text)
- `meta_token` (text — idealmente cifrado / guardado com cuidado; nunca exposto ao front)
- `provider` (text: `evolution` | `meta`) — permite cutover gradual por cliente

## 6. Estratégia de execução (abstração de provider)

Para não quebrar o que roda hoje: introduzir uma **camada de abstração** de transporte.
1. Criar `src/meta.js` (enviarTexto, enviarTemplate) espelhando a interface de `src/evolution.js`.
2. `src/server.js` escolhe o provider por cliente (coluna `provider`).
3. Webhook da Meta em paralelo ao da Evolution durante a transição.
4. Testar com a conta do próprio Fernando (fundador) como primeiro cliente `meta`.
5. Depois de validado, `meta` vira o padrão e a Evolution é aposentada.

## 7. Onboarding do cliente (mantendo o pitch perto de "rápido")

- **Quem já tem conta Meta/Business:** Embedded Signup — conecta em poucos cliques dentro do app.
- **Quem não tem:** flyer com passo a passo de criação da conta Meta oficial + acompanhamento por e-mail (sequência de mensagens ao longo do processo). Assumir que vira "onboarding assistido em alguns dias" — filtra por clientes mais sérios (com CNPJ/MEI), menos churn.
- **Público-alvo:** empreendedores e **MEIs** (a oficial precisa de CNPJ para limites decentes; MEI é o CNPJ barato/rápido).

## 8. O que depende do Fernando (bloqueadores da execução do código)

Não dá pra construir/testar o motor novo sem estes itens. Quando tiver:
- **CNPJ** (MEI serve) — em andamento.
- **Conta Meta Business + App** no developers.facebook.com, com o produto WhatsApp adicionado.
- Dados NÃO-secretos que eu posso usar: `App ID`, `WABA ID`, `Phone Number ID`, e o `Verify Token` (esse eu mesmo defino).
- Dados SECRETOS: `App Secret` e `Access Token` (permanente / system user) → **o Fernando coloca no `.env` do VPS**. Eu nunca vejo, não peço, não registro.

## 9. Ordem de execução assim que a conta estiver pronta

1. Migration no Supabase: colunas do §5.
2. `src/meta.js` + validação de assinatura no webhook (`src/server.js`).
3. Endpoint/rota do webhook da Meta + configurar a URL no painel da Meta.
4. Ajustar `configParaClient`/leitura para o provider `meta`.
5. Cadastrar template(s) (lembrete de trial / reengajamento).
6. Testar ponta a ponta com o número do Fundador.
7. Trocar o fluxo de "Conectar" no app (QR → Embedded Signup).
8. Atualizar a landing (etapa de conexão + ressalva "processo rápido para quem já tem conta Meta").
9. Aposentar Evolution (manter desligada como fallback por um tempo).

## 10. O que NÃO fazer agora

- Não derrubar a Evolution nem o motor atual (segue de pé; nada quebrado).
- Não mudar a landing pública ainda (não prometer conexão oficial antes do motor suportar).
- Não tocar em chaves/tokens da Meta — isso é sempre do Fernando, direto no `.env` do VPS.
