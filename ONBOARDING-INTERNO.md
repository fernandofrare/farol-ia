# 🎯 Onboarding dos Fundadores — Guia interno (para o Fernando)

Como conduzir a entrada dos 10 primeiros clientes do beta. Este é o SEU roteiro de operação. O material que vai PARA o fundador está no arquivo `ONBOARDING-FUNDADOR.md`.

---

## Antes de chamar qualquer fundador

- [ ] Você já rodou o `ROTEIRO-TESTE.md` inteiro com o seu próprio número e passou em tudo
- [ ] App no ar, motor no ar, banco no ar
- [ ] Documentos legais com CNPJ/CPF e e-mail do DPO preenchidos
- [ ] Você tem um número reserva pensado, caso o de algum fundador seja bloqueado

> Regra de ouro do beta: **você é o suporte**. Com 10 pessoas, o diferencial é o atendimento humano direto. Isso é uma vantagem, não um peso — é o que vai gerar os primeiros depoimentos.

---

## Quem convidar (perfil ideal para o beta)

Escolha fundadores que:
- têm um WhatsApp com **movimento real** (pra gerar conversas de teste de verdade)
- são **pacientes e parceiros** (vão encontrar bugs — você quer quem reporta com boa vontade)
- representam **segmentos variados** (salão, oficina, petshop, loja...) — testa a IA em contextos diferentes
- **não** dependem 100% daquele número pro faturamento (porque há risco de bloqueio no beta)

Evite, no beta: quem tem volume enorme (passa do fair use), quem é impaciente, e quem usa o número pra algo crítico e único.

---

## O fluxo de onboarding (por fundador)

### Passo 1 — Conversa de entrada (10 min, por chamada ou áudio)
Explique com honestidade:
- o que a Farol IA faz (atende o WhatsApp por você, 24h)
- que é **beta**: vai evoluir, pode ter ajustes, e você está perto pra resolver
- que é **gratuito durante o teste** — sem mencionar preço futuro nem permanência
- **o risco do número** (ver abaixo, é o ponto mais importante)
- que você vai acompanhar de perto

### Passo 2 — Aceite dos termos
- [ ] Fundador leu (ou você explicou) os Termos e a Política de Privacidade
- [ ] Ele entende e aceita o uso de WhatsApp não oficial e o risco de bloqueio
- Registre esse aceite (um "ok, entendi e topo" por escrito no WhatsApp já serve como trilha)

### Passo 3 — Criar a conta
- [ ] Criar o usuário dele no Supabase (Authentication → Add user)
- [ ] Enviar o e-mail/senha inicial (ou link de definição de senha)
- [ ] Orientar a trocar a senha no primeiro acesso

### Passo 4 — Configurar a IA juntos (15 min)
- [ ] Acompanhe ele preenchendo a tela **Minha IA** (ou preencha com ele por chamada)
- [ ] Capriche no "tom" e no "contexto extra" — é o que faz a IA soar como o negócio dele
- [ ] Salvar e conferir a prévia

### Passo 5 — Conectar o WhatsApp
- [ ] Conectar o número dele na Evolution (QR Code)
- [ ] Gravar a `instancia_evolution` no `config_ia` dele
- [ ] Ligar a IA e fazer **um teste ao vivo** com ele assistindo (manda uma msg de outro celular)

### Passo 6 — Primeiras 48h (acompanhamento)
- [ ] No dia seguinte, olhe o dashboard dele e pergunte como foi
- [ ] Ajuste o tom/respostas conforme o feedback
- [ ] Peça um print ou um áudio de reação (vira depoimento, com permissão)

---

## ⚠️ O assunto "risco do número" — como falar

Este é o ponto que exige honestidade e cuidado, porque o WhatsApp não oficial pode levar a bloqueio. Não esconda, mas também não assuste. Sugestão de fala:

> "A Farol IA conecta no seu WhatsApp por uma tecnologia não oficial — a mesma que a maioria das automações usa. Funciona muito bem, mas existe um risco de o WhatsApp bloquear o número, principalmente se houver uso fora do padrão. Por isso eu recomendo: no começo, se puder, use um número que não seja o único do seu negócio. Se acontecer qualquer coisa, eu te ajudo a reconectar na hora com um número reserva, e suas configurações ficam todas salvas. Durante o beta eu vou estar perto pra cuidar disso com você."

Boas práticas que reduzem o risco (e que o motor já aplica):
- delay de 5–9s antes de cada resposta (humanização) — **já automático**
- a IA só responde quem manda mensagem; **nunca dispara em massa** — isso é regra do produto
- aquecer o número aos poucos no começo (não sair respondendo 500 pessoas no dia 1)

---

## Metas do beta (o que você quer extrair)

1. **Confirmar que a IA atende bem** em segmentos diferentes
2. Colher **3–5 depoimentos** reais (com print/áudio)
3. Mapear os **ajustes mais pedidos** (vira backlog)
4. Validar a **estabilidade** (número aguentou? motor caiu? quantas conversas?)
5. Sentir o **ponto de preço** pra quando o beta virar pago

> Quando 3 fundadores disserem "isso me ajudou de verdade" e você tiver os depoimentos, está pronto pra abrir além do beta.
