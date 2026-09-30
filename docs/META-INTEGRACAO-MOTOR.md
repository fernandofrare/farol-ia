# Meta oficial — integração no motor (alinhado ao código REAL)

Base lida direto do VPS em 30/09/2026: `/opt/farol-motor/src/` (server.js 144 linhas, evolution.js 46).
Arquivos prontos p/ colar em `/opt/farol-motor/src/`: `meta.js`, `transporte.js`, `meta-webhook.js`.
Todos passam no `node --check`. **NÃO testados ponta-a-ponta** — só validam com a conta Meta no ar.

## Como o motor funciona hoje (resumo do real)
- Webhook único: `POST /webhook/:secret` (segredo na URL, validado timing-safe com `config.webhookSecret`). Formato Evolution/Baileys.
- `express.json()` é global (server.js linha ~19), antes das rotas.
- `processar(body)`: ignora fromMe, grupos (`@g.us`), status. `instance = body.instance||body.instanceName`; `data = body.data[0]`; `contactPhone = remoteJid.split("@")[0]`; `contactName = data.pushName`.
- Resolve cliente: `db.getClientByInstance(instance)`. Checa `ia_active`, `getOrCreateConversation`, `saveMessage("user")`, takeover (`db.emTakeover`), off-hours (`estaAberto(client.schedule)`), `enfileira` (debounce) → `buildSystemPrompt(client)` + `claude.gerarResposta` → `responder(...)`.
- `responder(client, conversa, contactPhone, texto)`: `delayAntiBan()` → `evo.mostrarDigitando(client.evolution_instance, contactPhone, ms)` → `evo.enviarTexto(client.evolution_instance, contactPhone, texto)` → `saveMessage("assistant")`.
- `evolution.js`: `enviarTexto(instance, number, text)`, `mostrarDigitando(instance, number, ms)`.

## 1. `.env` do VPS (você coloca; Claude nunca vê os segredos)
```
META_GRAPH_VERSION=v21.0
META_VERIFY_TOKEN=<string que você inventa; cola igual no painel da Meta>
META_APP_SECRET=<App Secret — SEGREDO>
META_TOKEN=<Access Token permanente/system user — SEGREDO>
META_PHONE_NUMBER_ID=<Phone Number ID do número do beta>
```
Beta com um número só: `META_TOKEN` + `META_PHONE_NUMBER_ID` no `.env` bastam.
Multi-cliente: preencher `meta_token` e `meta_phone_number_id` na linha de cada `clients` (colunas já criadas em 23/09).

## 2. Mudança MÍNIMA no envio (transporte.js)
`transporte.js` faz o dispatch por `client.provider`. Em `server.js`, dentro de `responder`, trocar só duas linhas:
```js
// no topo:
const transporte = require("./transporte");
// dentro de responder(...), no lugar de evo.*:
const espera = client.provider === "meta" ? 0 : await delayAntiBan(); // Meta não precisa de anti-ban
await transporte.mostrarDigitando(client, contactPhone, Math.min(espera, 3000));
await esperar(Math.min(espera, 1500)); // vira ~0 no Meta
await transporte.enviarTexto(client, contactPhone, texto);
```
`evolution.js` fica INTACTO (o transporte chama `evo.enviarTexto(client.evolution_instance, ...)` por baixo).

## 3. Recebimento (meta-webhook.js) + refatoração do pipeline
O webhook da Meta é SEPARADO do da Evolution (formato e validação diferentes). Passos:

a) **Raw body ANTES do json global.** Como `express.json()` é global, montar o raw só para o path da Meta antes dele:
```js
app.use("/webhook/meta", express.raw({ type: "*/*" })); // ANTES de app.use(express.json())
```

b) **Extrair o miolo de `processar` num passo compartilhado**, para os dois providers usarem a MESMA lógica (ia_active, conversa, saveMessage, takeover, off-hours, debounce, claude, responder). Ou seja, de `processar(body)` separar:
```js
async function processarMensagem(client, contactPhone, contactName, texto) { /* do "getOrCreateConversation" até o enfileira/responder */ }
```
O `processar` atual (Evolution) passa a chamar `processarMensagem(client, contactPhone, contactName, texto)` depois de resolver o client por instance.

c) **Montar o webhook Meta** chamando o mesmo passo:
```js
const { montarWebhookMeta } = require("./meta-webhook");
montarWebhookMeta(app, {
  onMensagem: async (m) => {
    // m = { de, nome, texto, messageId, phoneNumberId, timestamp }
    const client = await db.getClientByPhoneNumberId(m.phoneNumberId); // NOVA função no db.js
    if (!client || client.ia_active === false) return;
    await processarMensagem(client, m.de, m.nome, m.texto);
  },
});
```

d) **Nova função no `db.js`:** `getClientByPhoneNumberId(id)` — espelha `getClientByInstance`, mas filtra por `meta_phone_number_id`.

## 4. Painel da Meta
- Webhook URL: `https://<dominio-do-motor>/webhook/meta`
- Verify token: o mesmo `META_VERIFY_TOKEN` do `.env`.
- Inscrever o campo `messages`.

## 5. O que NÃO está aqui (fases seguintes)
- **Mídia**: `extrairMensagens` só pega `type:"text"`. Receber = baixar pelo `media_id` via Graph; enviar = payload `type:"image"/"audio"/...`.
- **Embedded Signup** (conectar cliente em poucos cliques): front + troca de token; separado do motor.
- **Templates**: `enviarTemplate` já existe; falta cadastrar/aprovar na Meta.
- **mostrarDigitando** no Meta é no-op (a Cloud API não tem o "digitando" livre da Evolution).

## 6. Ordem de teste quando a conta estiver pronta
1. `.env` preenchido → `pm2 restart farol-motor`.
2. Configurar webhook no painel da Meta → o GET de verificação tem que responder 200.
3. Mandar msg do seu celular pro número do beta → conferir no log que `onMensagem`/`processarMensagem` dispararam.
4. Ver a resposta da IA chegar no WhatsApp e o registro aparecer no CRM.
