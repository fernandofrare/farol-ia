import Link from "next/link";
import { LogoFarol } from "@/components/LogoFarol";
import "./landing.css";
import { wa } from "@/lib/whats";

export const metadata = {
  title: "Farol IA — Pare de perder cliente no WhatsApp enquanto você dorme",
  description:
    "Uma IA treinada no seu negócio responde, qualifica e agenda 24h por dia. Sem você precisar entender de tecnologia.",
};

// Icones monolinha (stroke herda a cor do badge .ico)
const I = {
  chip: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" /><rect x="10" y="10" width="4" height="4" /><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" /></svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.3" /></svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="4" y1="20" x2="4" y2="12" /><line x1="10" y1="20" x2="10" y2="5" /><line x1="16" y1="20" x2="16" y2="9" /><line x1="21" y1="20" x2="3" y2="20" /></svg>
  ),
  sliders: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6" /><circle cx="9" cy="6" r="2.2" /><line x1="4" y1="12" x2="20" y2="12" /><circle cx="15" cy="12" r="2.2" /><line x1="4" y1="18" x2="20" y2="18" /><circle cx="8" cy="18" r="2.2" /></svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2.5" /><line x1="11" y1="18.5" x2="13" y2="18.5" /></svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9.5 14.5l5-5" /><path d="M10.5 6l1-1a4 4 0 0 1 6 6l-1 1" /><path d="M13.5 18l-1 1a4 4 0 0 1-6-6l1-1" /></svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></svg>
  ),
  gift: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M5 12v9h14v-9" /><line x1="12" y1="8" x2="12" y2="21" /><path d="M12 8C11 5 9 4 7.8 4.6 6.4 5.3 7.3 8 10 8z" /><path d="M12 8c1-3 3-4 4.2-3.4C17.6 5.3 16.7 8 14 8z" /></svg>
  ),
};

export default function LandingPage() {
  return (
    <div className="landing-root">
      <header className="nav">
        <div className="wrap nav-inner">
          <Link href="/" aria-label="Farol IA">
            <LogoFarol width={190} height={54} />
          </Link>
          <nav className="nav-links">
            <a href="#solucao">A solução</a>
            <a href="#como">Como funciona</a>
            <a href="#faq">Dúvidas</a>
            <a href="#parceiro">Parceiros</a>
          </nav>
          <div className="nav-cta">
            <Link href="/login" className="btn btn-ghost">Já sou cliente</Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <h1>Pare de perder cliente no <span className="wa-word">WhatsApp</span> <em>enquanto você dorme.</em></h1>
          <p className="lead">Uma IA treinada no seu negócio responde, qualifica e agenda 24 horas por dia. Sem você precisar entender de tecnologia.</p>
          <div className="hero-cta">
            <Link href="/cadastro" className="btn btn-primary">Quero testar 1 semana grátis →</Link>
          </div>
          <p className="sub" style={{ marginTop: 14, fontSize: 13 }}>7 dias grátis, sem cartão · Ativo em até 24h · Sem fidelidade</p>
        </div>
        <div className="trust">
          <div className="wrap trust-inner">
            <span>Ativo em até 24 horas</span>
            <span>7 dias grátis, sem cartão</span>
            <span>Sem contrato de fidelidade</span>
            <span>Sem taxa de instalação</span>
            <span>IA de ponta do mercado</span>
          </div>
        </div>
      </section>

      <section id="solucao">
        <div className="wrap">
          <p className="sec-eyebrow">O que a Farol IA faz por você</p>
          <h2 className="sec-title">Presença, atendimento e dados <em>de empresa de elite.</em> No seu controle.</h2>
          <div className="grid grid-3" style={{ marginTop: 44 }}>
            <div className="card"><span className="ico">{I.chip}</span><h3>IA treinada na linguagem do seu negócio</h3><p>Você responde um questionário simples — horários, serviços, preços, tom de voz. A IA aprende e passa a responder como se fosse você. Sem código, sem técnico.</p></div>
            <div className="card"><span className="ico">{I.clock}</span><h3>Atendimento automático 24 horas</h3><p>Enquanto você dorme, a IA trabalha. Fora do horário, ela avisa o cliente e retoma quando você abre. Nenhuma mensagem perdida.</p></div>
            <div className="card"><span className="ico">{I.target}</span><h3>Identifica e separa os leads quentes</h3><p>A IA reconhece quem está pronto para comprar, coleta os dados e te avisa. Você entra só na hora de fechar.</p></div>
            <div className="card"><span className="ico">{I.chart}</span><h3>Painel completo nas suas mãos</h3><p>Veja cada conversa em tempo real, acompanhe métricas e saiba o que aconteceu com cada lead. Dados de empresa grande, simples de entender.</p></div>
            <div className="card"><span className="ico">{I.sliders}</span><h3>Controle total sem complicação</h3><p>Liga e desliga a IA quando quiser. Ajusta uma resposta sem refazer nada. Assume o atendimento manualmente quando precisar.</p></div>
            <div className="card"><span className="ico">{I.phone}</span><h3>Número dedicado, longe do pessoal</h3><p>A IA trabalha em um número novo e exclusivo do seu atendimento. Seu número pessoal fica protegido e o profissional fica organizado — do seu jeito.</p></div>
          </div>
        </div>
      </section>

      <section id="como" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap">
          <p className="sec-eyebrow">Do zero ao funcionando</p>
          <h2 className="sec-title">Sem conhecimento técnico. Pronto hoje.</h2>
          <div className="steps" style={{ marginTop: 44 }}>
            <div className="step"><span className="num">01</span><div className="step-body"><h3>Você entra e acessa o painel</h3><p>Cadastro simples, sem contrato. Em segundos você já está dentro do painel.</p></div><span className="time">2 minutos</span></div>
            <div className="step"><span className="num">02</span><div className="step-body"><h3>Responde o questionário do seu negócio</h3><p>Horários, serviços, preços, tom de voz. Você faz uma vez, a IA nunca esquece.</p></div><span className="time">15 minutos</span></div>
            <div className="step"><span className="num">03</span><div className="step-body"><h3>Conecta um número dedicado</h3><p>Um número novo e exclusivo do seu atendimento, pronto para receber mensagens.</p></div><span className="time">5 minutos</span></div>
            <div className="step"><span className="num">04</span><div className="step-body"><h3>A IA atende, você acompanha</h3><p>Cada conversa no painel em tempo real. Você ajusta e assume quando precisar.</p></div><span className="time">Ativo hoje</span></div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <p className="sec-eyebrow">Por que a Farol IA</p>
          <h2 className="sec-title">Compare com as opções do mercado atual</h2>
          <div className="cmp" style={{ marginTop: 44 }}>
            <table>
              <thead><tr><th></th><th>Outras soluções do mercado</th><th className="col-us">Farol IA</th></tr></thead>
              <tbody>
                <tr><td>Teste grátis</td><td className="no">Raro — e quase sempre exige cartão</td><td className="col-us yes">7 dias, sem cartão</td></tr>
                <tr><td>Taxa de instalação</td><td className="no">R$800 a R$1.500</td><td className="col-us yes">Zero</td></tr>
                <tr><td>Tempo de instalação</td><td className="no">7 a 15 dias</td><td className="col-us yes">Menos de 24h</td></tr>
                <tr><td>Mensalidade</td><td className="no">Acima de R$400</td><td className="col-us yes">R$147/mês · promocional 2026</td></tr>
                <tr><td>Personalização</td><td className="no">Complexa, depende de técnico</td><td className="col-us yes">Simples, sem código</td></tr>
                <tr><td>Atualização constante</td><td className="no">Rara ou paga à parte</td><td className="col-us yes">Sempre incluída</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="faq">
        <div className="wrap">
          <p className="sec-eyebrow">Dúvidas</p>
          <h2 className="sec-title">Perguntas frequentes</h2>
          <div className="faq" style={{ marginTop: 44 }}>
            <details><summary>Preciso entender de tecnologia para usar?</summary><div className="ans">Não. O processo inteiro foi desenhado para quem nunca mexeu com IA. Você responde um questionário simples e a gente conecta seu número — se você sabe usar WhatsApp, você consegue usar a Farol IA.</div></details>
            <details><summary>Preciso usar o meu número pessoal do WhatsApp?</summary><div className="ans">Recomendamos usar um número novo e dedicado ao atendimento — com um SIM ou e-SIM novo. Isso separa o profissional do pessoal, protege a sua conta pessoal e deixa a IA trabalhando em um número exclusivo do seu negócio. É rápido e barato ativar um número novo, e a gente te orienta no passo a passo.</div></details>
            <details><summary>Quantas conversas estão incluídas?</summary><div className="ans">O plano inclui até 2.000 conversas por mês — mais do que suficiente para a grande maioria dos negócios. Se o seu volume crescer além disso, a gente conversa sobre um plano sob medida. Sem surpresa na fatura.</div></details>
            <details><summary>Como eu acompanho o que a IA está fazendo?</summary><div className="ans">Tudo aparece no seu painel em tempo real. Você vê cada conversa, cada lead, cada métrica. Pode assumir o atendimento manualmente, ajustar qualquer resposta da IA, ou só observar o sistema trabalhando por você.</div></details>
            <details><summary>E se a IA não souber responder algo?</summary><div className="ans">Quando a IA não sabe responder, ela informa o cliente com educação e transfere o atendimento para você. Você recebe um alerta no painel e assume a conversa diretamente, sem o cliente perceber a transição.</div></details>
            <details><summary>Posso cancelar quando quiser?</summary><div className="ans">Sim. Sem contrato, sem multa, sem burocracia. Cancela pelo painel em menos de 2 minutos.</div></details>
            <details><summary>Em quanto tempo começa a funcionar?</summary><div className="ans">A maioria dos clientes ativa em menos de 1 hora. O prazo máximo é 24 horas após o questionário e a conexão do número.</div></details>
          </div>
        </div>
      </section>

      <section id="parceiro" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap">
          <p className="sec-eyebrow" style={{ color: "#35b06a" }}>Programa Parceiro</p>
          <h2 className="sec-title">Indique e ganhe mensalidades grátis.</h2>
          <p className="sec-sub">Cada negócio que entra pelo seu convite e paga a primeira mensalidade vale <b>1 mês grátis</b> pra você. Indicou 3 que assinaram? 3 meses sem pagar. Vire parceiro da Farol IA.</p>
          <div className="grid grid-3" style={{ marginTop: 44 }}>
            <div className="card"><span className="ico">{I.link}</span><h3>Seu link exclusivo</h3><p>No painel você gera um link só seu e manda para donos de negócio que conhece. Quanto mais gente atendendo bem, melhor para todos.</p></div>
            <div className="card"><span className="ico">{I.check}</span><h3>Ele assina, você ganha</h3><p>Quando o indicado entra pelo seu link e paga a primeira mensalidade, o desconto cai automaticamente na sua próxima fatura.</p></div>
            <div className="card"><span className="ico">{I.gift}</span><h3>1 indicação = 1 mês grátis</h3><p>Cada cliente que você trouxer e que assinar zera uma mensalidade sua. Sem limite: indicou vários, ficou vários meses sem pagar.</p></div>
          </div>
        </div>
      </section>

      <section className="final">
        <div className="wrap">
          <h2>Seu negócio com a tecnologia <em>que ele sempre mereceu ter.</em></h2>
          <p>Atendimento 24h · Painel completo · Pronto em menos de 24 horas.</p>
          <div className="hero-cta" style={{ justifyContent: "center" }}>
            <Link href="/cadastro" className="btn btn-primary">Quero testar 1 semana grátis →</Link>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <LogoFarol width={170} height={48} />
              <p>Automações inteligentes.</p>
            </div>
            <div className="foot-links">
              <div className="foot-col">
                <h4>Produto</h4>
                <a href="#solucao">A solução</a>
                <a href="#como">Como funciona</a>
                <a href="#faq">Dúvidas</a>
              </div>
              <div className="foot-col">
                <h4>Empresa</h4>
                <a href={wa("Olá! Gostaria de falar com a Farol IA")}>Falar conosco</a>
                <Link href="/login">Área do cliente</Link>
              </div>
              <div className="foot-col">
                <h4>Legal</h4>
                <Link href="/termos">Termos de Uso</Link>
                <Link href="/privacidade">Política de Privacidade</Link>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Farol IA · Automações Inteligentes</span>
            <span>FERNANDO CLAUS FRARE DESENVOLVIMENTO DE PROGRAMAS LTDA · CNPJ 69.420.755/0001-41</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
