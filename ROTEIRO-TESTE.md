# ✅ Roteiro de Teste — Farol IA (ponta a ponta)

Use este roteiro **na ordem**, assim que o VPS estiver no ar. Cada etapa só avança se a anterior passou. Marque ✅ ou ❌ — se algo falhar, pare ali e resolva antes de seguir (o erro mais comum é uma etapa quebrar silenciosamente as seguintes).

> Faça este teste **com o seu próprio número** antes de chamar qualquer fundador. Você é o cliente-zero.

---

## FASE A — Infraestrutura no ar

**A1. Banco de dados**
- [ ] Rodou `00-diagnostico.sql` no Supabase e analisou o resultado
- [ ] Rodou `01-schema-farol-ia.sql` (ou o ALTER ajustado) sem erro
- [ ] No Table Editor, as 4 tabelas aparecem com cadeado de RLS: `config_ia`, `contatos`, `conversas`, `mensagens`

**A2. App no Vercel**
- [ ] Deploy do `farol-ia` concluído sem erro de build
- [ ] Variáveis de ambiente preenchidas no Vercel (anon key, app url)
- [ ] Abrir `https://app.farolia.store` → a landing carrega com as fontes certas e o logo âmbar
- [ ] Abrir `/termos` e `/privacidade` → as duas páginas abrem (não dão 404)

**A3. VPS + Evolution API**
- [ ] Evolution API instalada e respondendo (ex.: `curl http://localhost:8080`)
- [ ] Motor `farol-motor` instalado, `.env` preenchido
- [ ] `curl http://localhost:3333/health` → retorna `{"ok":true}`
- [ ] Motor rodando como serviço (PM2) e sobrevive a `reboot`

---

## FASE B — Autenticação

**B1. Criar usuário de teste**
- [ ] No Supabase → Authentication → Add user → criar com SEU e-mail
- [ ] (Se "Confirm email" estiver ligado) confirmar o e-mail

**B2. Login**
- [ ] Abrir `/login`, entrar com o usuário de teste → cai no `/dashboard`
- [ ] Tentar `/dashboard` numa aba anônima (sem login) → redireciona pro `/login` ✓ (proteção de rota)
- [ ] Errar a senha 9 vezes seguidas → na 9ª aparece "muitas tentativas" ✓ (rate limit)

**B3. Recuperação de senha**
- [ ] Em `/recuperar-senha`, pedir reset → e-mail chega
- [ ] Clicar no link → abre `/nova-senha` e aceita nova senha
- [ ] Abrir `/nova-senha` direto, sem link → mostra "link inválido ou expirado" ✓

---

## FASE C — Configuração da IA (a peça que alimenta o motor)

**C1. Preencher a Minha IA**
- [ ] Em `/minha-ia`, preencher: nome do negócio, segmento, serviços, horários, mensagens
- [ ] Clicar **Salvar** → aparece "✓ Configurações salvas"
- [ ] Recarregar a página → os dados continuam lá ✓ (gravou no banco)
- [ ] No Supabase → tabela `config_ia` → existe 1 linha com seu `user_id` e o JSON em `dados`

**C2. Ligar a conexão WhatsApp**
- [ ] Conectar seu número na Evolution via QR Code
- [ ] Anotar o nome da instância e gravar em `config_ia.instancia_evolution` (a coluna que liga a instância ao seu user)
- [ ] No dashboard, o toggle da IA está **ligado** (ou ligue)

---

## FASE D — O teste que importa: a IA respondendo

**D1. Primeira mensagem**
- [ ] De OUTRO celular, mande uma mensagem pro número conectado: "Qual o horário de vocês?"
- [ ] **Espere 5–9 segundos** (o delay anti-ban é proposital)
- [ ] A IA respondeu, no tom configurado, com a informação certa ✓

**D2. Verificar o registro**
- [ ] No `/dashboard`, a conversa apareceu em "conversas recentes" e a métrica subiu
- [ ] No `/crm`, o contato apareceu na tabela
- [ ] No Supabase → `mensagens` → tem 2 linhas (uma `origem: cliente`, uma `origem: ia`)

**D3. Memória da conversa**
- [ ] Mande uma segunda mensagem que dependa do contexto: "E aos domingos?"
- [ ] A IA respondeu levando em conta a conversa anterior ✓ (histórico funcionando)

**D4. Comportamento dos toggles**
- [ ] Em `/minha-ia`, desligue "informar preços" e salve
- [ ] Pergunte um preço pelo WhatsApp → a IA NÃO informa, redireciona ✓
- [ ] Desligue a IA no dashboard → mande mensagem → a IA NÃO responde ✓

**D5. Fora do horário**
- [ ] Ajuste o horário pra "fechado agora" e salve
- [ ] Mande mensagem → recebe a mensagem de fora do horário (se ativado) ✓

---

## FASE E — Segurança (rápida)

- [ ] Logado como usuário A, no Supabase confirme que não há como ver dados de outro `user_id` pelo app
- [ ] No navegador (DevTools → Network), nenhuma resposta expõe a `service_role` key ✓
- [ ] Headers de segurança presentes: abrir DevTools → Network → uma requisição → ver `Content-Security-Policy` e `X-Frame-Options` na resposta ✓

---

## Se algo falhar — diagnóstico rápido

| Sintoma | Provável causa |
|---|---|
| IA não responde | instância não ligada a `config_ia.instancia_evolution`; ou IA pausada; ou webhook da Evolution não aponta pro motor |
| Responde mas não grava no banco | service key errada no `.env` do motor; ou tabela `mensagens` não existe |
| Login não entra | usuário não criado no Supabase Auth; ou "Confirm email" ligado e e-mail não confirmado |
| Reset de senha não volta | falta o redirect `/nova-senha` em Supabase → Auth → URL Configuration |
| Responde rápido demais (sem delay) | `DELAY_MIN/MAX` não lidos; checar `.env` do motor |
| Erro de fonte/visual na landing | variáveis do Vercel ou DNS do subdomínio |

**Logs úteis:**
- Motor: `pm2 logs farol-motor`
- Evolution: logs da instância
- App: Vercel → Deployments → Functions → Logs
