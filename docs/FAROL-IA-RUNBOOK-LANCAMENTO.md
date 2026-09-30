# Farol IA — Runbook de Lançamento

_Checklist de go-live. Reflete a decisão de migrar para a API oficial da Meta antes de lançar. Marque conforme avança._

## 0. Pré-requisitos (bloqueiam a migração)
- [ ] **CNPJ** definido (ME para a Farol; ver doc de tributação) — ou CPF, se lançar o beta antes.
- [ ] **Conta Meta Business + App** (developers.facebook.com) com o produto WhatsApp adicionado.
- [ ] **Número dedicado** para o atendimento (chip/e-SIM), fora do app WhatsApp comum.
- [ ] IDs não-secretos entregues ao Claude: `App ID`, `WABA ID`, `Phone Number ID`.
- [ ] Secretos no `.env` do VPS (você mesmo): `App Secret`, `Access Token`. Claude nunca vê.
- [ ] `VERIFY_TOKEN` do webhook definido (Claude gera; você cola nos dois lados).

## 1. Migração do motor (Claude executa — ver MIGRACAO-META-OFICIAL.md §9)
- [ ] Migration Supabase (colunas meta_* já criadas em 23/09 ✓).
- [ ] `src/meta.js` (Graph API) + validação de assinatura no webhook.
- [ ] Rota do webhook + configurar a URL no painel da Meta.
- [ ] Provider `meta` por cliente; testar com o número do Fundador.
- [ ] Template(s) aprovado(s) na Meta (lembrete de trial / reengajamento).
- [ ] Trocar "Conectar" do app (QR → Embedded Signup).
- [ ] Atualizar copy de conexão (landing + dicas do Suporte) — item adiado até aqui.
- [ ] Aposentar Evolution (manter desligada como fallback por um tempo).

## 2. Checklist técnico prè-lançamento
- [ ] Deploy Vercel **READY** no último commit.
- [ ] **Ligar proteção de senha vazada** no Supabase (Auth → Password security). _(toggle seu)_
- [ ] Configurar **limite de gasto** na API da Anthropic (o custo por resposta é seu no beta).
- [ ] `RESEND_API_KEY` + domínio verificado (para boas-vindas e lembrete de trial).
- [ ] Testar **cadastro → painel** (empresa e autônomo).
- [ ] Testar **IA ponta a ponta**: mensagem de fora → resposta da IA → aparece no CRM.
- [ ] Testar **atendimento manual**: abrir chat, "Assumir", responder.
- [ ] Testar **grupos** (Lead/Cliente/Alerta) e sub-grupos (IA/Humano/Frios).
- [ ] Testar **PWA**: instalar na tela inicial (Android e iPhone).
- [ ] Conferir número de WhatsApp de contato (lib/whats.ts) — hoje 5554994009947.

## 3. Lançamento (soft launch)
- [ ] Começar com **poucos clientes** (3 fundadores), não abrir amplo de cara.
- [ ] Acompanhar de perto os primeiros dias (respostas da IA, conexões, erros).
- [ ] ~1h/dia: análise, atendimento do que a IA não resolveu, ajustes.
- [ ] ~1h/dia: marketing (vídeos, posts, prospecção local).

## 4. Antes do 1º trial vencer (~7 dias após o 1º cadastro)
- [ ] **Asaas** pronto (KYC aprovado) + webhook de pagamento no motor.
- [ ] **Lembrete de fim de trial** ativo (Resend).
- [ ] Definir o gatilho **Lead → Cliente** no perfil Fundador (contratou o trial = cliente).

## 5. Riscos a vigiar
- **Custo por mensagem:** mensagem de serviço passa a ser cobrada a partir de 01/10/2026 — ajustar preço mantendo margem disruptiva.
- **Ponto único de falha (você):** trading + faculdade + outros projetos + suporte do SaaS. Priorize automação de suporte e não prometa SLA que não sustenta sozinho.
- **Público:** autônomo (CPF) começa não-verificado (~250 conv/24h); MEI/CNPJ destrava volume. Deixar claro no onboarding.
- **Bom:** na API oficial, cada cliente tem conta isolada — acabou o risco de um cliente derrubar todos (que existia na Evolution).

## 6. O que já está pronto (não precisa refazer)
- Painel de atendimento redesenhado (grupos + botões de cor + chat + auto-update).
- Responsividade mobile + PWA instalável.
- Cadastro/login, dashboard, Minha IA, CRM, assinatura, configurações, suporte, indicação, páginas legais.
- Landing com verde estratégico unificado + número centralizado.
- Banco preparado para o provider Meta.
