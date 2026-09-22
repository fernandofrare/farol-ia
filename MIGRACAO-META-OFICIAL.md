# Farol IA — Migração para a API Oficial da Meta (WhatsApp Cloud API)

_Decidido em 22/09/2026. Este documento é a planta da migração. Reflete o estado REAL do que muda._

## 1. Por que migrar (decisão)

A base atual (Evolution API / Baileys, não-oficial) roda num **único VPS / único IP compartilhado por todos os clientes**. Isso cria um **ponto único de falha sistêmico**: o número de **um** cliente com uso errado pode fazer o WhatsApp aplicar um **cooldown no IP do VPS** e **derrubar o atendimento de TODOS os clientes ao mesmo tempo**. Com público-alvo pouco técnico, isso aconteceria cedo e repetidamente. Preview vivido em 21–22/09: vínculo bloqueado em múltiplos números via o IP do VPS. Logo: migrar para a **API Oficial da Meta antes do lançamento**.

## 2. O que MUDA e o que FICA

**Fica (~70%):** `src/claude.js`, `src/prompt.js` (buildSystemPrompt), CRM, "Minha IA", dashboard, cadastro, indicação, Supabase, `src/debounce.js`.

**Muda (só o transporte do WhatsApp):**
- `src/evolution.js` -> `src/meta.js` (envio via Graph API).
- `src/whatsapp.js` (QR/status Evolution) -> webhook + Embedded Signup da Meta.
- `src/server.js`: webhook passa a receber o formato da Meta (GET verify + POST com validação de assinatura).
- Anti-ban (delay 5–9s): não é mais necessário na oficial. Simplifica o motor.

## 3. Como a oficial funciona (essencial)

- **Recebimento:** webhook nosso (URL pública). GET de verificação com `VERIFY_TOKEN`; validar `X-Hub-Signature-256` (HMAC com App Secret) em cada POST.
- **Envio:** `POST https://graph.facebook.com/vXX.0/{PHONE_NUMBER_ID}/messages` com `Bearer {ACCESS_TOKEN}`.
- **Janela 24h (mensagem de serviço):** cliente inicia -> respondemos com texto livre por 24h. Encaixa no modelo "IA só responde quem inicia".
- **Fora da janela:** exige **template pré-aprovado** (ex.: lembrete de trial, reengajamento).
- **Custo:** serviço grátis hoje (1.000/mês), passa a cobrar em **01/10/2026** (tarifa a confirmar). Ajustar preço mantendo margem disruptiva.

## 4. Multi-tenant (ganho principal)

Cada cliente conecta a **própria WABA** (isolada) via **Embedded Signup**. Guardamos por cliente: `phone_number_id`, `waba_id`, `access_token`. Problema de um não afeta os outros.

## 5. Banco (`clients`) — novas colunas

Manter `evolution_instance` na transição e acrescentar: `meta_phone_number_id`, `meta_waba_id`, `meta_token` (cifrado; nunca no front), `provider` (`evolution`|`meta`).

## 6. Execução com abstração de provider

1. `src/meta.js` espelhando a interface de `src/evolution.js`. 2. `src/server.js` escolhe provider por cliente. 3. Webhook Meta em paralelo. 4. Testar com o número do Fundador. 5. `meta` vira padrão; Evolution aposentada.

## 7. Onboarding (pitch perto de "rápido")

- Quem já tem conta Meta: Embedded Signup (poucos cliques).
- Quem não tem: flyer passo a passo + acompanhamento por e-mail. Vira "onboarding assistido em alguns dias" (filtra clientes mais sérios).
- Público: empreendedores e **MEIs** (oficial precisa de CNPJ; MEI é o caminho barato).

## 8. Depende do Fernando (bloqueadores)

- **CNPJ** (MEI serve) — em andamento.
- **Conta Meta Business + App** (developers.facebook.com) com produto WhatsApp.
- Não-secretos (posso usar): `App ID`, `WABA ID`, `Phone Number ID`, `Verify Token` (eu defino).
- Secretos: `App Secret` e `Access Token` -> **Fernando coloca no `.env` do VPS**. Eu nunca vejo/peço/registro.

## 9. Ordem de execução quando a conta estiver pronta

1. Migration Supabase (§5). 2. `src/meta.js` + validação de assinatura. 3. Rota do webhook + configurar URL na Meta. 4. Ajustar leitura/config para provider `meta`. 5. Template(s). 6. Teste ponta a ponta (Fundador). 7. Trocar "Conectar" (QR -> Embedded Signup). 8. Atualizar landing. 9. Aposentar Evolution.

## 10. Não fazer agora

- Não derrubar a Evolution/motor atual (segue de pé).
- Não mudar a landing pública ainda (não prometer conexão oficial antes do motor suportar).
- Não tocar em chaves/tokens da Meta — sempre do Fernando, no `.env` do VPS.
