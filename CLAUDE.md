# CLAUDE.md — Farol IA

Contexto para o Claude (Cowork ou Claude Code) trabalhar neste projeto. Leia antes de mexer em arquitetura, banco ou motor. Fonte de verdade detalhada: `FAROL-IA-KNOWLEDGE.md` (no knowledge do projeto) + os docs de migração Meta.

## O que é
SaaS de atendimento por WhatsApp com IA para micro e pequenos negócios brasileiros. Uma IA treinada no negócio do cliente responde/qualifica/agenda 24h no WhatsApp dele. Preço pós-beta: R$147/mês fixo. Domínio: farolia.store · app: app.farolia.store. Fundador: Fernando Frare (Guaporé/RS).

## Arquitetura (híbrida — NÃO mexer sem motivo forte)
- **App Next.js 14 (App Router)** no **Vercel** — este repositório (`fernandofrare/farol-ia`). Landing, login, dashboard, minha-ia, crm, assinatura, configurações, suporte, indicação, páginas legais.
- **Motor** Node/Express no **VPS Hostinger** (`/opt/farol-motor`, PM2 `farol-motor`, porta 3000). Recebe webhook do WhatsApp, faz debounce, checa takeover humano, gera resposta com Claude, envia e grava. Vive FORA do repo (é editado no VPS).
- **Supabase** (projeto `wvpponovopsgpepdxpty`, sa-east-1): Auth + Postgres + RLS. Plano free pausa por inatividade — keep-alive via GitHub Actions (`.github/workflows/keepalive.yml`).
- **WhatsApp**: hoje Evolution API (não-oficial, Docker no VPS). **EM MIGRAÇÃO para a API Oficial da Meta antes do lançamento** (ver seção abaixo).

Por que híbrido: o delay anti-ban (5–9s) não combina com serverless. Na Meta oficial o anti-ban some.

## Banco (Supabase) — nomes em INGLÊS
Tabelas: `clients`, `conversations`, `messages`. NÃO inventar tabelas em português.
- `clients` = config da IA ("Minha IA"): nome, email, user_id, tone, services(jsonb), schedule(jsonb), payment, welcome_message, off_hours_message, ia_active, evolution_instance, status. Colunas Meta: `provider` (evolution|meta), `meta_phone_number_id`, `meta_waba_id`, `meta_token`.
- `conversations`: tem `grupo` (lead|cliente|alerta, default lead) para o CRM.
- A linha em `clients` nasce no 1º salvar do "Minha IA", não no login.

## Migração Meta oficial (em andamento)
Motivo: Evolution num único VPS/IP é ponto único de falha sistêmico (um cliente derruba todos). Meta dá conta isolada por cliente. Docs: `FAROL-IA-MIGRACAO-META-OFICIAL.md`, `META-INTEGRACAO-MOTOR.md`, `FAROL-IA-ONBOARDING-API-OFICIAL.md`.
Código já escrito (colar em `/opt/farol-motor/src/` quando a conta estiver no ar): `meta.js` (envio Graph API), `transporte.js` (dispatch por provider), `meta-webhook.js` (recebimento + validação de assinatura). Ainda NÃO testado ponta-a-ponta.
Bloqueadores (dependem do Fernando): CNPJ (MEI→ME, em andamento), conta Meta Business + App, IDs não-secretos (App ID, WABA ID, Phone Number ID) e segredos (App Secret, Access Token) que vão só no `.env` do VPS.

## Regras de segurança (ABSOLUTAS)
- NUNCA solicitar, aceitar ou registrar chaves, senhas, tokens ou credenciais.
- Se o Fernando colar um segredo no chat (service_role, ANTHROPIC_API_KEY, App Secret, senha), ALERTAR que ele deve revogar e gerar outro. Não usar, não repetir.
- service_role do Supabase, chave da Anthropic, AUTHENTICATION_API_KEY da Evolution, App Secret/Access Token da Meta: só no `.env` do VPS. Jamais no app Next, no repo ou em chat.
- anon key do Supabase é pública por design (protegida por RLS) — pode usar normalmente.

## Como trabalhar
- Português, direto, sem enrolação. Avaliação honesta SEMPRE acima de tranquilização — apontar pontos fracos e riscos.
- Máxima autonomia: fazer o que dá sem pedir permissão; sinalizar só o que exige ação do Fernando.
- Antes de dizer "pronto", VALIDAR: build, type-check ou testar a lógica. Não entregar código não verificado.
- Adaptar-se ao código existente em vez de recriar do zero.
- Deploy: push no GitHub → Vercel builda automático. Verificar build READY antes de confiar.

## Decisões tomadas (não reabrir sem motivo forte)
- Beta gratuito → Asaas fora do caminho crítico (mas a landing atual vende trial 7 dias → R$147/mês).
- Landing não promete preço futuro nem desconto vitalício — só "acesso antecipado + condição de fundador".
- Cor: laranja é a marca; verde só tático para elementos de WhatsApp.
- Lançar o beta com 3 fundadores, não 10.
- Anti-ban (enquanto Evolution): delay 5–9s, só responde quem inicia, nunca dispara em massa.

## Riscos no radar
1. Ban do WhatsApp (Evolution) — existencial; a migração Meta resolve o risco sistêmico.
2. Fundador é ponto único de falha (trading + faculdade + outros projetos + suporte).
3. Mercado lotado — preço/simplicidade validam os primeiros, não são fosso.
4. Beta gratuito = custo de API sai do bolso do Fernando. Manter teto de gasto configurado.
5. Supabase free pausa por inatividade — keep-alive por GitHub Actions.

## Meta oficial — estado atual (02/10/2026)
App criado no Meta for Developers (portfólio empresarial "Farol IA", com CNPJ/MEI). IDs não-secretos:
- App ID: 1825340775266895
- WABA ID: 1371566068085782
- Phone Number ID (número de TESTE da Meta, +1 555 630-0508): 1333360969866822
- META_VERIFY_TOKEN (webhook): farol_1b98850a2ac4b884131e8b114d1c9c0a
Segredos (App Secret, Access Token) NÃO ficam aqui — só no .env do VPS.
Número de teste manda p/ até 5 telefones verificados → dá p/ testar o motor sem tocar na Evolution.
BLOQUEADOR atual: o VPS não tem endpoint público HTTPS (DNS não aponta pro IP 179.197.226.145).
A Meta exige webhook https. Plano: subdomínio webhook.farolia.store → VPS → Caddy → localhost:3000
(ver docs/VPS-WEBHOOK-ENDPOINT-SETUP.md). Depois: ligar server.js/db.js + segredos no .env + configurar webhook no painel da Meta.
