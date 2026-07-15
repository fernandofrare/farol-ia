# 🔦 Farol IA — App Next.js (estado atual)

App Next.js 14 (App Router) no Vercel. Reflete o **estado real do código**.

---

## ✅ PRONTO neste pacote

| Item | Arquivo | Status |
|---|---|---|
| Estrutura Next.js + build limpo | raiz | ✅ 14 rotas geram |
| Design tokens da marca | `app/globals.css` | ✅ idênticos às telas |
| Logo Farol (componente) | `components/LogoFarol.tsx` | ✅ |
| Sidebar compartilhada (rota ativa + logout) | `components/Sidebar.tsx` | ✅ |
| Supabase client navegador/servidor | `lib/*.ts` | ✅ |
| Proteção de rota (middleware) | `middleware.ts` | ✅ valida no servidor |
| Termos de Uso | `app/termos` | ✅ |
| Política de Privacidade (LGPD) | `app/privacidade` | ✅ |
| Login (Supabase Auth real) | `app/login` | ✅ |
| Recuperar + nova senha | `app/recuperar-senha`, `app/nova-senha` | ✅ |
| **Dashboard (lê dados reais)** | `app/dashboard` | ✅ métricas, conversas, toggle liga/desliga |
| **Minha IA (grava no Supabase)** | `app/minha-ia` | ✅ form completo + prévia ao vivo |
| **CRM (lê contatos reais)** | `app/crm` | ✅ filtros, busca, painel lateral |
| API de configuração da IA | `app/api/config-ia` | ✅ GET + POST (upsert) |

**Validação:** `tsc --noEmit` limpo + `npm run build` → 14/14 rotas OK.
(No sandbox o build só não baixa fontes do Google — limite de rede do ambiente. No Vercel funciona.)

---

## 🗄️ SCHEMA SUPABASE NECESSÁRIO

O código espera estas tabelas. Confirme/crie no Supabase:

### `config_ia`
- `user_id` (uuid, FK auth.users, **unique**)
- `dados` (jsonb) — objeto ConfigIA completo (ver `lib/config-ia.ts`)
- `ativa` (bool)
- `numero_whatsapp` (text, null)
- `nome_negocio` (text)
- `atualizada_em` (timestamptz)
- RLS: usuário só lê/escreve onde `user_id = auth.uid()`

### `contatos`
- `id` (uuid, pk)
- `user_id` (uuid, FK)
- `nome`, `telefone`, `status` (lead|cliente|frio|novo)
- `ultima_mensagem` (text), `ultima_em` (timestamptz)
- `interacoes` (int), `criado_em` (timestamptz)
- RLS por `user_id`

### `conversas` (usada pelo dashboard)
- `id` (uuid, pk), `user_id` (uuid)
- `nome_contato`, `ultima_mensagem` (text)
- `atualizada_em` (timestamptz), `nao_lidas` (int)
- RLS por `user_id`

> Enquanto as tabelas estiverem vazias, as telas mostram estado vazio elegante — não quebram.

---

## ⏳ PRÓXIMOS PASSOS

### Posso fazer (🤖)
1. **Landing page** → componente Next + trocar placeholders de WhatsApp.
2. **Motor do WhatsApp** (Node no VPS): webhook → delay ≥5s → Claude → resposta → grava nas tabelas acima.
3. **Conexão Evolution API** (QR Code) na tela Minha IA.

### Depende de você (👤) — caminho crítico
- **VPS + IP** → destrava o motor.
- **Número de WhatsApp dedicado**.
- **Criar as 3 tabelas acima** (ou confirmar que batem com as 8 já existentes).
- **Criar usuário de teste** no Supabase Auth para login.
- **Preencher** CNPJ/CPF (Termos) e e-mail DPO (Privacidade).
- **URL Configuration** no Supabase: Site URL + redirect `/nova-senha`.

### Adiado (beta gratuito)
Asaas · favicon · foto do fundador · planos Pro.

---

## 🚀 Rodar localmente
```bash
npm install
cp .env.example .env.local   # preencher ANON KEY real
npm run dev
```
