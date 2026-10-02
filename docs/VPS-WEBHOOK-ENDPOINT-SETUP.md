# VPS — endpoint público HTTPS para o webhook da Meta

Descoberto em 02/10/2026: o DNS de farolia.store NÃO tem nenhum registro apontando pro VPS
(179.197.226.145). O webhook da Evolution era interno. A Meta exige uma URL pública HTTPS
(porta 443, cert válido). Plano: subdomínio `webhook.farolia.store` → VPS → Caddy (HTTPS automático)
→ proxy reverso pro motor em localhost:3000.

## Passo A — DNS (no hPanel da Hostinger) — AÇÃO DO FERNANDO / liberação
Adicionar 1 registro na zona de farolia.store:
- Tipo: A
- Nome: webhook
- Conteúdo/Valor: 179.197.226.145
- TTL: 300 (ou padrão)
Resultado: webhook.farolia.store resolve pro VPS. (Claude pode adicionar no painel com teu ok.)

## Passo B — no VPS (Web console da Hostinger) — rodar em ordem
Pré-checagem (ver o que já escuta nas portas e se Caddy/Nginx existem):
```bash
ss -tlnp | grep -E ':80 |:443 |:3000 ' || echo "nada em 80/443/3000"
which caddy nginx 2>/dev/null
pm2 describe farol-motor | grep -E "status|script path" | head
```
> Se já houver algo escutando em 80/443 (ex.: Nginx), NÃO instalar Caddy por cima — me avisa
> que a gente adapta (vira um server block no Nginx + certbot). O passo abaixo assume 80/443 livres.

Abrir firewall (UFW, se ativo) e conferir firewall da Hostinger (painel → Firewall):
```bash
ufw status 2>/dev/null; ufw allow 80/tcp 2>/dev/null; ufw allow 443/tcp 2>/dev/null; true
```

Instalar Caddy:
```bash
apt-get update
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install -y caddy
```

Configurar o Caddyfile (proxy pro motor na 3000):
```bash
cat > /etc/caddy/Caddyfile <<'CADDY'
webhook.farolia.store {
    reverse_proxy localhost:3000
}
CADDY
systemctl reload caddy
```

Validar (depois do DNS propagar, ~minutos):
```bash
curl -s https://webhook.farolia.store/health   # deve responder {"ok":true,...} do motor
```
> O motor já tem a rota GET /health. Se responder o JSON por HTTPS, o endpoint está pronto
> e a URL do webhook da Meta será: https://webhook.farolia.store/webhook/meta

## Passo C — arquivos novos do motor (dormentes até ligar o server.js)
Colar em /opt/farol-motor/src/: meta.js, transporte.js, meta-webhook.js (já no repo em docs/motor-meta/).
Eles ficam inertes até o server.js/db.js serem ligados — fazer isso só na hora do teste,
junto com os segredos no .env (META_APP_SECRET, META_TOKEN, META_VERIFY_TOKEN, META_PHONE_NUMBER_ID).
