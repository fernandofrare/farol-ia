# CLAUDE.md — Farol IA

Contexto para o Claude (Cowork ou Claude Code) trabalhar neste projeto. Leia antes de mexer em arquitetura, banco ou motor. Fonte de verdade detalhada: `FAROL-IA-KNOWLEDGE.md` (no knowledge do projeto).

> Última revisão: 03/11/2026.

## O que é
SaaS de atendimento por WhatsApp com IA para empresas e profissionais autônomos brasileiros. Uma IA treinada no negócio do cliente responde/qualifica/agenda 24h no WhatsApp dele. Domínio: farolia.store · app: app.farolia.store. Fundador: Fernando Frare (Guaporé/RS). Razão social: FERNANDO CLAUS FRARE DESENVOLVIMENTO DE PROGRAMAS LTDA, CNPJ 69.420.755/0001-41.

## Arquitetura de conexão — CASO 1 (Tech Provider / Embedded Signup)
**Decisão FINAL (27/10/2026, firme — não reabrir):** cada cliente cria a PRÓPRIA conta Meta + WABA pelo **Embedded Signup**; o número vive no portfólio do CLIENTE. A Farol opera como **Tech Provider** via API oficial da Meta.
- Motivo: em 16/10 um número queimado (histórico de Baileys/Evolution) derrubou TODO o portfólio WhatsApp Business da Farol, em caráter PERMANENTE. No Caso 1 o risco fica contido no portfólio de cada cliente.
- O modelo antigo "números no portfólio da Farol" (Caso 2) está ENCERRADO. **NÃO usar Baileys/Evolution** — stack não-oficial abandonada.

## Infra (híbrida — NÃO mexer sem motivo forte)
- **App Next.js 14 (App Router)** no **Vercel** — este repositório (`fernandofrare/farol-ia`). Deploy: push no GitHub → Vercel builda automático (verificar build READY).
- **Motor** Node/Express no **VPS Hostinger** (`/opt/farol-motor`, PM2 `farol-motor`, código em `src/`). Recebe webhook da Meta (`/webhook/meta`), debounce, checa takeover humano, gera resposta com Claude (ANTHROPIC_MODEL=claude-haiku-4-5), envia e grava. Vive FORA do repo. normalizarBR() adiciona o 9º dígito.
- **Supabase** (projeto `wvpponovopsgpepdxpty`, sa-east-1): Auth + Postgres + RLS. Free tier pausa por inatividade — keep-alive via GitHub Actions (`.github/workflows/keepalive.yml`, a cada 6h).

## Ambiente Meta ATUAL (03/11/2026)
- Portfólio empresarial: **"Farol IA Atendimento"**, business_id **1641175154689853** (verificado). O portfólio antigo "Farol IA" (1128320789732547) está BANIDO e abandonado.
- App Meta: **App ID 28626141177088716** (público), caso de uso "Conectar-se com clientes pelo WhatsApp", vinculado ao portfólio novo. Status: não publicado.
- Facebook Login for Business: Configuration "Onboarding WhatsApp" → **config_id 894112427046988** (público). Token de usuário do sistema, nunca expira, permissões whatsapp_business_messaging + whatsapp_business_management. OAuth: JS SDK ligado, domínio/redirect app.farolia.store.
- Chip novo da Farol (atendimento próprio): **+55 54 99942-8333** (VIVO, limpo) — GUARDADO, só registrar depois do App Review.
- (IDs antigos OBSOLETOS que podem aparecer em docs velhos: App ID 1825340775266895, WABA 1371566068085782/1135798689102492 — eram do ambiente banido/teste.)

## Banco (Supabase) — nomes em INGLÊS
Tabelas: `clients`, `conversations`, `messages`. NÃO inventar tabelas em português.
- `clients`: nome, email, user_id, tone, services(jsonb), schedule(jsonb), welcome_message, off_hours_message, ia_active, status, cpf_cnpj, razao_social, tipo_pessoa. Colunas Meta: `provider` ('evolution' default|'meta'), `meta_phone_number_id`, `meta_waba_id`, `meta_token` (sensível, server-side only), `onboarding_status`, `whatsapp_e164`, `display_name`, `suspended` (kill-switch).
- `client_meta_secrets` (service_role only): two_step_pin, abuse_flag, abuse_checked_at.
- A linha em `clients` nasce no 1º salvar do "Minha IA".

## Fluxo Embedded Signup (código — branch feat/embedded-signup, em revisão)
- `app/conectar/page.tsx`: botão → FB.login com config_id + extras WhatsApp ES; escuta `WA_EMBEDDED_SIGNUP`; envia o `code`.
- `app/api/whatsapp/meta/embedded-signup/route.ts`: proxy autenticado → motor.
- `docs/motor-meta/meta-embedded-signup.js`: handler do VPS (troca code→token com App Secret server-side, assina webhook na WABA do cliente, grava clients).
- Env PÚBLICAS (browser): NEXT_PUBLIC_META_APP_ID, NEXT_PUBLIC_META_CONFIG_ID, NEXT_PUBLIC_META_GRAPH_VERSION. Env SECRETAS (só motor/VPS): META_APP_SECRET, token do cliente.

## Regras de segurança (ABSOLUTAS)
- NUNCA solicitar, aceitar ou registrar chaves, senhas, tokens ou credenciais.
- Se o Fernando colar um segredo no chat (service_role, ANTHROPIC_API_KEY, App Secret, senha), ALERTAR que ele deve revogar e gerar outro. Não usar, não repetir.
- SUPABASE_SERVICE_KEY, chave da Anthropic, App Secret/token da Meta: só no `.env` do VPS. Jamais no app Next, no repo ou em chat.
- anon key do Supabase é pública por design (RLS) — pode usar.

## Como trabalhar
- Português, direto, sem enrolação. Avaliação honesta SEMPRE acima de tranquilização — apontar pontos fracos e riscos.
- Máxima autonomia: fazer o que dá sem pedir permissão; sinalizar só o que exige ação do Fernando (senha, aceite de termos irreversível, segredos).
- Antes de dizer "pronto", VALIDAR: build, type-check ou testar a lógica. Não entregar código não verificado.
- Adaptar-se ao código existente em vez de recriar do zero.

## Decisões de produto atuais
- Beta gratuito / Founders ENCERRADO. Trial de 7 dias mantido → depois pago.
- Preço a RECALCULAR (precificação única, a definir) — NÃO cravar preço nem mexer em cobrança (Asaas value 147, consentimento) sem o Fernando bater o martelo.
- Landing: sem preço/promocional na vitrine (opção b). Cor: laranja é a marca; verde só tático p/ WhatsApp.
- Copy: público é "empresas e profissionais autônomos" — NUNCA "pequenos negócios".

## Riscos no radar
1. Ban da Meta — existencial; já se materializou. Caso 1 isola por cliente, não elimina.
2. Fundador é ponto único de falha.
3. Mercado lotado — preço/simplicidade validam os primeiros, não são fosso.
4. Custo de API/mensagem — manter teto de gasto Anthropic configurado.
5. Supabase free pausa por inatividade — keep-alive por GitHub Actions.

## Próximos passos (03/11/2026)
1. (Fernando) "Torne-se Provedor de Tecnologia" no painel do app (IRREVERSÍVEL).
2. App Review (2 vídeos — ver `FAROL-IA-APP-REVIEW-DOSSIE.md`).
3. Deploy do meta-embedded-signup.js no VPS + env do motor (META_APP_SECRET).
4. Setar NEXT_PUBLIC_META_* no Vercel.
5. Registrar o chip 99942-8333.
