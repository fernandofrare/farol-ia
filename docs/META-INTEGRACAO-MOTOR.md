# Meta oficial — integração no motor (passo a passo do cutover)

Arquivos prontos: `meta.js` e `meta-webhook.js` (colar em `/opt/farol/src/`).
Ambos passam no `node --check`. **Não testados ponta-a-ponta** — só dá pra validar com a conta Meta no ar.

## 1. `.env` do VPS (você coloca; Claude nunca vê os segredos)

```
META_GRAPH_VERSION=v21.0
META_VERIFY_TOKEN=<string que você inventa; cola igual no painel da Meta>
META_APP_SECRET=<App Secret — SEGREDO>
META_TOKEN=<Access Token permanente/system user — SEGREDO>
META_PHONE_NUMBER_ID=<Phone Number ID do número do beta>
```

No beta com um número só, `META_TOKEN` e `META_PHONE_NUMBER_ID` no `.env` bastam.
Multi-cliente depois: preencher `meta_token` e `meta_phone_number_id` na linha de cada `clients` (colunas já criadas em 23/09).

## 2. Mudanças no `server.js`

a) **Corpo bruto no webhook da Meta** (a assinatura HMAC exige o raw). Antes das rotas:
```js
const { montarWebhookMeta } = require("./meta-webhook");
app.use("/webhook/meta", express.raw({ type: "*/*" }));
```
> Cuidado: não deixar um `express.json()` global capturar `/webhook/meta` antes disso, senão o raw se perde.

b) **Registrar o webhook**, passando o mesmo pipeline que hoje processa a mensagem da Evolution:
```js
montarWebhookMeta(app, {
  onMensagem: async (m) => {
    // m = { de, nome, texto, messageId, phoneNumberId, timestamp }
    // 1. achar o client pelo phoneNumberId (ou pelo número, no beta)
    // 2. jogar no MESMO fluxo de debounce/junção que a Evolution usa hoje
    // 3. a resposta da IA sai por meta.enviarTexto(m.de, resposta, client)
  },
});
```

c) **Escolha de provider no envio.** Onde hoje chama `evolution.enviarTexto(...)`, trocar por:
```js
const transporte = client.provider === "meta" ? require("./meta") : require("./evolution");
await transporte.enviarTexto(numero, resposta, client);
```

## 3. Painel da Meta
- Webhook URL: `https://<seu-dominio-do-motor>/webhook/meta`
- Verify token: o mesmo `META_VERIFY_TOKEN` do `.env`.
- Inscrever o campo `messages`.

## 4. O que NÃO está aqui (fases seguintes)
- **Mídia** (foto/áudio/vídeo/arquivo): `extrairMensagens` hoje só pega `type:"text"`. Receber mídia = baixar pelo `media_id` via Graph; enviar = payload `type:"image"/"audio"/...`. Fica pra quando o chat com mídia entrar.
- **Embedded Signup** (conectar cliente em poucos cliques): é front + troca de token; separado do motor.
- **Templates**: `enviarTemplate` já existe; falta cadastrar/aprovar os templates na Meta (rascunhos no doc de onboarding).
- **Anti-ban delay 5–9s**: remover do fluxo quando `provider === "meta"` (a oficial não precisa).

## 5. Ordem de teste quando a conta estiver pronta
1. `.env` preenchido → `pm2 restart farol-motor`.
2. Configurar webhook no painel da Meta → o GET de verificação tem que responder 200.
3. Mandar msg do seu celular pro número do beta → conferir no log que `onMensagem` disparou.
4. Ver a resposta da IA chegar no WhatsApp e o registro aparecer no CRM.
