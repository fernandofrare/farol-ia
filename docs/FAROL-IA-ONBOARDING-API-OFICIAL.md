# Farol IA — Onboarding do cliente na API oficial (rascunho de conteúdo)

_Preparado em 23/09/2026. Conteúdo pronto para revisar/usar quando o motor oficial estiver no ar. Textos são ponto de partida — ajuste o tom conforme preferir._

---

## A. Os dois caminhos de conexão

Na hora de conectar o WhatsApp, o cliente cai em um de dois fluxos:

**Caminho 1 — Já tem conta Meta Business (rápido):**
Conecta pelo **Embedded Signup** dentro do painel da Farol, em poucos cliques. Autoriza a Farol, escolhe o número, pronto. Minutos.

**Caminho 2 — Não tem conta Meta Business (assistido):**
Precisa primeiro criar a conta Meta Business e cadastrar o número. Aí entra o passo a passo (seção B) + a sequência de e-mails (seção C) para não largar o cliente sozinho no processo.

A landing/onboarding deve **detectar/perguntar** logo no começo: "Você já tem uma conta de WhatsApp Business pela Meta?" → direciona para o caminho certo.

---

## Política de público (CPF x CNPJ)

- **Autônomo (CPF):** pode criar a conta Meta Business e rodar a Farol já, em modo **não verificado**. Limite ~**250 conversas/24h** (somando os números) e até **2 números** — suficiente para volume pequeno/médio, e esse teto pesa mais em mensagens iniciadas pela empresa (a IA responde quem inicia, então o alcance prático é maior).
- **MEI/CNPJ (upgrade):** ao verificar o negócio, sobe para **1.000+/dia**, até **20 números** e menos risco de bloqueio por volume.
- **Posicionamento:** "comece hoje com seu CPF; vire MEI para destravar volume". CNPJ é caminho de crescimento, não pré-requisito. Só sinalizar a verificação para leads de alto volume.

---

## B. Passo a passo para quem NÃO tem conta Meta (flyer)

Título: **Como preparar seu WhatsApp para a Farol IA (10–15 min)**

1. **Tenha em mãos:** um número de celular dedicado ao atendimento (chip novo ou e-SIM, que NÃO esteja logado no app WhatsApp comum). **CPF já basta para começar** — CNPJ (MEI) só é necessário depois, para destravar mais volume (ver "Política de público" abaixo).
2. **Crie a conta Meta Business:** acesse business.facebook.com → "Criar conta" → informe nome do negócio, seu nome e e-mail comercial.
3. **Adicione o WhatsApp:** no Gerenciador, vá em "Contas do WhatsApp" → adicionar → siga o assistente.
4. **Cadastre o número dedicado:** informe o número, receba o código por SMS/ligação e confirme. (Esse número passa a ser o do atendimento da IA — não use ele no app comum.)
5. **(Opcional, para crescer) Verifique o negócio:** com CPF você já opera na conta não verificada (até ~250 conversas/24h, 2 números — sobra para volume pequeno/médio). Quando quiser mais volume, envie o CNPJ (MEI) + comprovante de endereço; a verificação leva de 1 a 5 dias úteis e libera 1.000+/dia e até 20 números.
6. **Volte à Farol e conecte:** no painel, clique em "Conectar WhatsApp" → autorize a Farol a usar seu número. Fim.

> Dica no flyer: "Não precisa entender de tecnologia — a gente te acompanha por e-mail em cada etapa. Travou? Responde o e-mail que a gente resolve com você."

---

## C. Sequência de e-mails de acompanhamento (Resend)

Disparar conforme o estágio do cliente no caminho 2.

**E-mail 1 — na hora do cadastro (boas-vindas + primeiro passo)**
Assunto: Bem-vindo à Farol IA — vamos preparar seu WhatsApp
Corpo: "Que bom ter você aqui! Para a IA começar a atender, o primeiro passo é preparar seu WhatsApp Business pela Meta. É mais simples do que parece e leva ~15 min. Comece por aqui: [link do flyer/passo a passo]. Qualquer dúvida, é só responder este e-mail."

**E-mail 2 — +1 dia, se ainda não conectou (empurrão gentil)**
Assunto: Falta pouco para sua IA entrar no ar
Corpo: "Vi que você ainda não conectou o WhatsApp. O passo que costuma travar é a criação da conta Meta Business — te deixei um guia com telas aqui: [link]. Se preferir, me responde que a gente faz junto, no seu ritmo."

**E-mail 3 — +3 dias, se em verificação (tranquilizar)**
Assunto: Sua verificação com a Meta está a caminho
Corpo: "A Meta está analisando seu negócio — isso costuma levar de 1 a 5 dias úteis. Assim que liberar, é só voltar ao painel e clicar em Conectar. Enquanto isso, você já pode deixar a IA configurada na aba 'Minha IA' para ela atender do jeitinho do seu negócio."

**E-mail 4 — conectou! (ativação)**
Assunto: Sua IA está no ar 🎉
Corpo: "Pronto! Seu WhatsApp está conectado e a Farol IA já está atendendo. Manda uma mensagem de teste para o seu número e veja a mágica. Acompanhe tudo no painel."

**E-mail 5 — +2 dias sem conectar após verificação (resgate)**
Assunto: Precisa de uma mãozinha para ativar?
Corpo: "Estou aqui para destravar o que faltar. Me responde com o print da tela onde você parou que eu te oriento no passo exato."

---

## D. Templates da Meta (rascunho — para cadastrar/aprovar depois)

Templates são necessários para enviar mensagem FORA da janela de 24h. Categoria "Utility" tende a aprovar mais fácil e é mais barata que "Marketing". Variáveis entre chaves.

**Template 1 — retomada de lead frio (utility)**
Nome: `retomada_atendimento`
Corpo: "Oi, {{1}}! Vi que você entrou em contato com a {{2}} e a conversa ficou pela metade. Posso te ajudar a continuar de onde paramos?"

**Template 2 — confirmação/lembrete de agendamento (utility)**
Nome: `lembrete_agendamento`
Corpo: "Olá, {{1}}! Passando para lembrar do seu horário na {{2}} em {{3}}. Precisa remarcar? É só responder por aqui."

> Observação: o lembrete de FIM DE TRIAL da própria Farol (Farol → dono do negócio) continua sendo por **e-mail (Resend)**, que já está pronto — não precisa de template da Meta.

---

## E. Ajustes de copy na landing (quando for a hora)

- Trocar a etapa "Conecta seu WhatsApp com um QR Code" por "Conecta sua conta oficial de WhatsApp Business em poucos cliques".
- Adicionar a ressalva: "Ativação rápida para quem já tem conta Meta Business. Não tem? A gente te acompanha na criação, passo a passo."
- Público: **autônomos (CPF) E empreendedores/MEIs**. Comunicar "comece hoje só com o CPF" e posicionar o **MEI como upgrade de volume** (não como pré-requisito). Deixar claro só para leads de alto volume que a verificação (CNPJ) destrava mais.
- Ajustar o chip verde "Conecta direto no seu WhatsApp" para refletir número dedicado + conta oficial.

_(Não aplicar na landing pública ainda — só quando o motor oficial estiver funcionando, para não prometer o que não entrega.)_
