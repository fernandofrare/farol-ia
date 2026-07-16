import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade — Farol IA",
  description:
    "Como a Farol IA coleta, usa e protege dados pessoais, em conformidade com a LGPD.",
};

export default function PrivacidadePage() {
  const atualizacao = "17 de junho de 2026";

  return (
    <main className="legal">
      <div className="legal-wrap">
        <Link href="/" className="legal-back">
          ← Voltar para o site
        </Link>

        <header className="legal-head">
          <h1>Política de Privacidade</h1>
          <p className="legal-date">Última atualização: {atualizacao}</p>
        </header>

        <div className="legal-intro">
          <p>
            Esta Política explica como a Farol IA coleta, utiliza, armazena e
            protege dados pessoais, em conformidade com a Lei nº 13.709/2018 (Lei
            Geral de Proteção de Dados — LGPD). Ela se aplica tanto aos dados dos
            nossos clientes contratantes quanto aos dados das pessoas que entram
            em contato com eles pelo WhatsApp.
          </p>
        </div>

        <section className="legal-sec">
          <h2>1. Papéis no tratamento de dados</h2>
          <p>
            É importante distinguir dois papéis previstos na LGPD:
          </p>
          <ul>
            <li>
              <strong>Você (cliente contratante)</strong> é o{" "}
              <strong>controlador</strong> dos dados dos seus próprios clientes.
              Você decide por que e como esses dados são tratados no seu
              atendimento.
            </li>
            <li>
              <strong>A Farol IA</strong> atua como{" "}
              <strong>operadora</strong>, tratando esses dados em seu nome e
              conforme suas instruções, para viabilizar o atendimento
              automatizado. Em relação aos seus próprios dados de cadastro,
              somos controladores.
            </li>
          </ul>
        </section>

        <section className="legal-sec">
          <h2>2. Dados que coletamos</h2>
          <p>
            <strong>Dados de cadastro do cliente contratante:</strong> nome,
            e-mail, telefone, dados do negócio (nome, segmento, horários, formas
            de pagamento) e dados necessários à cobrança quando aplicável.
          </p>
          <p>
            <strong>Dados de atendimento (em nome do cliente):</strong> número de
            telefone dos contatos que escrevem ao cliente, conteúdo das mensagens
            trocadas e horários das interações. Esses dados são tratados para
            gerar respostas automáticas e manter o histórico das conversas.
          </p>
          <p>
            <strong>Dados técnicos:</strong> registros de acesso, endereço IP e
            informações de uso da plataforma, para segurança e funcionamento do
            serviço.
          </p>
        </section>

        <section className="legal-sec">
          <h2>3. Para que usamos os dados</h2>
          <ul>
            <li>fornecer e operar o atendimento automatizado por WhatsApp;</li>
            <li>gerar respostas da inteligência artificial conforme a sua configuração;</li>
            <li>manter o histórico de conversas e a gestão de contatos no painel;</li>
            <li>realizar cobrança e gestão da assinatura, quando aplicável;</li>
            <li>prestar suporte e comunicar avisos importantes do serviço;</li>
            <li>garantir a segurança, prevenir fraudes e cumprir obrigações legais.</li>
          </ul>
        </section>

        <section className="legal-sec">
          <h2>4. Bases legais</h2>
          <p>
            O tratamento se apoia, conforme o caso, na execução do contrato, no
            cumprimento de obrigação legal, no legítimo interesse para segurança
            e melhoria do serviço, e no consentimento quando exigido. Como
            controlador dos dados dos seus clientes, cabe a você assegurar a base
            legal adequada para o atendimento automatizado dessas pessoas.
          </p>
        </section>

        <section className="legal-sec">
          <h2>5. Compartilhamento e operadores subcontratados</h2>
          <p>
            Para operar o serviço, utilizamos fornecedores de tecnologia que
            tratam dados em nosso nome, sob obrigações de confidencialidade e
            segurança, incluindo:
          </p>
          <ul>
            <li>
              <strong>Anthropic</strong> — processamento das mensagens pela
              inteligência artificial para gerar respostas;
            </li>
            <li>
              <strong>Supabase</strong> — armazenamento de dados em banco de
              dados (região da América do Sul);
            </li>
            <li>
              <strong>Vercel</strong> — hospedagem da aplicação web;
            </li>
            <li>
              <strong>provedor de envio de e-mail transacional</strong> —
              comunicações de conta, como recuperação de senha;
            </li>
            <li>
              <strong>provedor de infraestrutura (VPS)</strong> — operação da
              conexão com o WhatsApp.
            </li>
          </ul>
          <p>
            Não vendemos dados pessoais. Eventual compartilhamento adicional
            ocorrerá apenas por obrigação legal ou ordem de autoridade
            competente.
          </p>
        </section>

        <section className="legal-sec">
          <h2>6. Transferência internacional</h2>
          <p>
            Alguns dos fornecedores acima podem processar dados fora do Brasil.
            Nesses casos, buscamos garantir que a transferência ocorra com
            salvaguardas adequadas, conforme previsto na LGPD.
          </p>
        </section>

        <section className="legal-sec">
          <h2>7. Por quanto tempo guardamos</h2>
          <p>
            Mantemos os dados pelo tempo necessário às finalidades descritas e ao
            cumprimento de obrigações legais. Dados de atendimento permanecem
            disponíveis no painel enquanto a conta estiver ativa. Após o
            encerramento da conta, os dados podem ser eliminados ou anonimizados,
            ressalvadas as hipóteses de guarda obrigatória previstas em lei.
          </p>
        </section>

        <section className="legal-sec">
          <h2>8. Segurança</h2>
          <p>
            Adotamos medidas técnicas e organizacionais para proteger os dados,
            incluindo controle de acesso, segregação por cliente no banco de
            dados e criptografia em trânsito. Nenhum sistema é totalmente imune a
            incidentes; em caso de incidente de segurança relevante, adotaremos as
            providências exigidas pela LGPD.
          </p>
        </section>

        <section className="legal-sec">
          <h2>9. Seus direitos</h2>
          <p>
            Nos termos da LGPD, o titular de dados pode solicitar confirmação de
            tratamento, acesso, correção, anonimização, portabilidade,
            eliminação e informações sobre compartilhamento, entre outros
            direitos. Pedidos relativos aos dados dos clientes finais devem,
            preferencialmente, ser dirigidos ao respectivo controlador (o cliente
            contratante). Para exercer direitos sobre dados que tratamos como
            controladores, utilize os canais oficiais informados no site.
          </p>
        </section>

        <section className="legal-sec">
          <h2>10. Encarregado pelo tratamento de dados (DPO)</h2>
          <p>
            O contato do encarregado pelo tratamento de dados pessoais é o
            e-mail <strong>contato@farolia.store</strong>. Por esse canal você
            pode encaminhar dúvidas e solicitações relativas a esta Política.
          </p>
        </section>

        <section className="legal-sec">
          <h2>11. Alterações</h2>
          <p>
            Esta Política pode ser atualizada para refletir mudanças no serviço
            ou na legislação. Alterações relevantes serão comunicadas pelos
            canais oficiais, e a data no topo indica a versão vigente.
          </p>
        </section>

        <footer className="legal-foot">
          <p>
            Esta Política integra e complementa os{" "}
            <Link href="/termos" className="legal-link">
              Termos de Uso
            </Link>{" "}
            da Farol IA.
          </p>
        </footer>
      </div>
    </main>
  );
}
