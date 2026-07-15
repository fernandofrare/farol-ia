import Link from "next/link";

export const metadata = {
  title: "Termos de Uso — Farol IA",
  description: "Termos e condições de uso da plataforma Farol IA.",
};

export default function TermosPage() {
  const atualizacao = "17 de junho de 2026";

  return (
    <main className="legal">
      <div className="legal-wrap">
        <Link href="/" className="legal-back">
          ← Voltar para o site
        </Link>

        <header className="legal-head">
          <h1>Termos de Uso</h1>
          <p className="legal-date">Última atualização: {atualizacao}</p>
        </header>

        <div className="legal-intro">
          <p>
            Bem-vindo à Farol IA. Estes Termos de Uso regem o acesso e a
            utilização da nossa plataforma de atendimento automatizado por
            WhatsApp com inteligência artificial. Ao contratar ou usar o
            serviço, você concorda integralmente com as condições abaixo. Leia
            com atenção — especialmente os itens 4 e 7, que tratam de
            responsabilidades sobre o número de WhatsApp e dos limites do
            serviço.
          </p>
        </div>

        <section className="legal-sec">
          <h2>1. Quem somos</h2>
          <p>
            A Farol IA é um serviço operado por Fernando Frare, sediado em
            Guaporé, Rio Grande do Sul, Brasil{" "}
            <span className="legal-note">
              [inserir CNPJ ou, em caso de pessoa física, CPF e indicação de
              atuação como empresário individual]
            </span>
            . Para qualquer comunicação relativa a estes Termos, utilize os
            canais oficiais informados no site farolia.store.
          </p>
        </section>

        <section className="legal-sec">
          <h2>2. O que é o serviço</h2>
          <p>
            A Farol IA fornece um assistente de inteligência artificial que
            responde automaticamente, em seu nome, às mensagens recebidas no seu
            WhatsApp. O assistente é configurado por você e responde apenas a
            contatos que iniciaram a conversa. O serviço inclui painel de
            configuração, registro de conversas e ferramentas de gestão de
            contatos.
          </p>
        </section>

        <section className="legal-sec legal-highlight">
          <h2>3. Uso de tecnologia não oficial do WhatsApp</h2>
          <p>
            <strong>
              Leia este item com especial atenção antes de contratar.
            </strong>
          </p>
          <p>
            A Farol IA conecta-se ao WhatsApp por meio de uma integração não
            oficial (baseada na tecnologia Evolution API), e não por meio da API
            oficial do WhatsApp Business fornecida pela Meta Platforms, Inc. O
            WhatsApp é uma marca da Meta, que não possui qualquer relação,
            patrocínio ou endosso com a Farol IA.
          </p>
          <p>
            O uso de integrações não oficiais pode, em tese, contrariar os
            termos de serviço do WhatsApp e resultar em medidas por parte da
            Meta, incluindo o bloqueio temporário ou permanente do número
            conectado. Ao contratar, você declara estar ciente dessa natureza e
            dos riscos envolvidos, e opta livremente por utilizar o serviço
            nessas condições.
          </p>
        </section>

        <section className="legal-sec legal-highlight">
          <h2>4. Responsabilidade sobre o número de WhatsApp</h2>
          <p>
            O número de WhatsApp conectado à plataforma é de sua exclusiva
            titularidade e responsabilidade. Você é o único responsável por:
          </p>
          <ul>
            <li>
              garantir que possui autorização para usar o número e para
              automatizar o atendimento nele;
            </li>
            <li>
              o conteúdo das configurações, mensagens e instruções fornecidas à
              inteligência artificial;
            </li>
            <li>
              a conformidade do seu atendimento com a legislação aplicável,
              incluindo normas de defesa do consumidor e de proteção de dados;
            </li>
            <li>
              não utilizar o serviço para envio de mensagens não solicitadas
              (spam), conteúdo ilícito, enganoso, discriminatório ou que viole
              direitos de terceiros.
            </li>
          </ul>
          <p>
            Recomendamos fortemente o uso de um número dedicado ao atendimento,
            separado do seu número pessoal.
          </p>
        </section>

        <section className="legal-sec legal-highlight">
          <h2>5. Isenção de responsabilidade por bloqueio de número</h2>
          <p>
            Considerando a natureza não oficial da integração descrita no item
            3, a Farol IA <strong>não garante</strong> a continuidade ininterrupta
            da conexão e <strong>não se responsabiliza</strong> por bloqueios,
            suspensões, banimentos ou quaisquer restrições impostas pela Meta ou
            pelo WhatsApp ao número conectado, ainda que decorrentes do uso do
            serviço.
          </p>
          <p>
            Em caso de bloqueio, você poderá conectar um número reserva por meio
            do painel, e suas configurações e histórico permanecerão
            preservados. Eventuais prejuízos comerciais decorrentes da
            indisponibilidade do número são de sua responsabilidade.
          </p>
        </section>

        <section className="legal-sec">
          <h2>6. Comportamento da inteligência artificial</h2>
          <p>
            A inteligência artificial gera respostas automaticamente com base nas
            instruções e no contexto que você fornece. Embora trabalhemos para
            que as respostas sejam úteis e adequadas, a IA pode, ocasionalmente,
            produzir informações imprecisas ou inadequadas. Você é responsável
            por revisar e ajustar a configuração do assistente e por monitorar o
            atendimento. A Farol IA não responde por decisões, acordos ou
            informações transmitidas automaticamente aos seus clientes.
          </p>
          <p>
            Para reduzir o risco de bloqueio e tornar a conversa mais natural, o
            sistema aguarda alguns segundos antes de responder cada mensagem.
            Esse comportamento é intencional.
          </p>
        </section>

        <section className="legal-sec legal-highlight">
          <h2>7. Limite de uso justo (fair use)</h2>
          <p>
            O plano inclui um limite de uso justo de{" "}
            <strong>2.000 conversas por mês</strong>. Uma conversa corresponde a
            uma interação contínua com um mesmo contato. Esse limite é mais do
            que suficiente para a ampla maioria dos micro e pequenos negócios.
          </p>
          <p>
            Caso o uso ultrapasse esse volume de forma recorrente, entraremos em
            contato para avaliar a melhor solução, que poderá incluir ajuste de
            plano. Reservamo-nos o direito de limitar ou suspender usos que
            caracterizem abuso, automação de disparo em massa ou tentativa de
            burlar as proteções do serviço.
          </p>
        </section>

        <section className="legal-sec">
          <h2>8. Planos, pagamento e cancelamento</h2>
          <p>
            O serviço é oferecido por assinatura mensal, sem fidelidade e sem
            taxa de instalação. Durante o período beta, o acesso poderá ser
            concedido de forma gratuita aos participantes convidados, sem que
            isso gere qualquer obrigação de continuidade gratuita após o
            encerramento do beta. Os valores e condições vigentes são os
            informados no site no momento da contratação. Você pode cancelar a
            qualquer momento; o cancelamento encerra a renovação seguinte e não
            gera multa.
          </p>
        </section>

        <section className="legal-sec">
          <h2>9. Disponibilidade e suporte</h2>
          <p>
            Empenhamo-nos para manter o serviço disponível de forma contínua,
            mas ele pode sofrer interrupções por manutenção, falhas técnicas,
            indisponibilidade de terceiros (incluindo o próprio WhatsApp) ou
            causas fora do nosso controle. O serviço é fornecido "no estado em
            que se encontra", sem garantias de resultado comercial específico.
          </p>
        </section>

        <section className="legal-sec">
          <h2>10. Proteção de dados (LGPD)</h2>
          <p>
            O tratamento de dados pessoais segue a Lei nº 13.709/2018 (LGPD) e
            está detalhado na nossa{" "}
            <Link href="/privacidade" className="legal-link">
              Política de Privacidade
            </Link>
            , que é parte integrante destes Termos. Ao usar o serviço, você atua
            como controlador dos dados dos seus próprios clientes e é
            responsável por possuir base legal adequada para o atendimento
            automatizado.
          </p>
        </section>

        <section className="legal-sec">
          <h2>11. Limitação de responsabilidade</h2>
          <p>
            Na máxima extensão permitida pela lei, a responsabilidade total da
            Farol IA perante você fica limitada ao valor efetivamente pago pelo
            serviço nos três meses anteriores ao evento que originou a demanda.
            Não respondemos por danos indiretos, lucros cessantes ou perda de
            oportunidades de negócio.
          </p>
        </section>

        <section className="legal-sec">
          <h2>12. Alterações destes Termos</h2>
          <p>
            Podemos atualizar estes Termos periodicamente. Mudanças relevantes
            serão comunicadas pelos canais oficiais. O uso continuado do serviço
            após a atualização representa concordância com a nova versão.
          </p>
        </section>

        <section className="legal-sec">
          <h2>13. Foro</h2>
          <p>
            Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro
            da comarca de Guaporé, Rio Grande do Sul, para dirimir questões
            decorrentes deste contrato, salvo disposição legal em contrário
            aplicável a relações de consumo.
          </p>
        </section>

        <footer className="legal-foot">
          <p>
            Ao contratar ou utilizar a Farol IA, você declara ter lido,
            compreendido e aceito estes Termos de Uso.
          </p>
          <Link href="/privacidade" className="legal-link">
            Ler a Política de Privacidade →
          </Link>
        </footer>
      </div>
    </main>
  );
}
