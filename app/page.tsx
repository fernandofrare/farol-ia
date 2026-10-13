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
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
  ),
  moon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4 6.3 6.3 0 0 0 20 14.5z" /></svg>
  ),
  repeat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 2l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
  ),
  trendDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7l6 6 4-4 8 8" /><path d="M21 13v4h-4" /></svg>
  ),
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
            <LogoFarol width={150} height={43} />
          </Link>
          <nav className="nav-links">
            <a href="#problema">O problema</a>
            <a href="#solucao">A solução</a>
            <a href="#como">Como funciona</a>
            <a href="#faq">Dúvidas</a>
            <a href="#parceiro">Parceiros</a>
          </nav>
          <div className="nav-cta">
            <Link href="/login" className="btn btn-primary">Já sou cliente</Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <span className="eyebrow" style={{ color: "#25d366", textShadow: "0 0 10px rgba(37,211,102,.55)", fontWeight: 700, borderColor: "rgba(37,211,102,.4)" }}>A mesma IA das grandes · sem a complexidade · sem o preço absurdo</span>
          <div className="wa-chip"><svg className="wa-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.5 2 2 6 2 11c0 1.77.62 3.4 1.67 4.74L2.5 21.5l5-1.3A10.7 10.7 0 0 0 12 21c5.5 0 10-4 10-9S17.5 2 12 2z" /></svg>Sua IA atendendo no WhatsApp, 24 horas por dia</div>
          <h1>Pare de perder cliente no <span className="wa-word">WhatsApp</span> <em>enquanto você dorme.</em></h1>
          <p className="lead">Uma IA treinada no seu negócio responde, qualifica e agenda 24 horas por dia. Sem você precisar entender de tecnologia.</p>
          <p className="sub">Pronto em menos de 24 horas. Cancele quando quiser.</p>
          <div className="hero-cta">
            <Link href="/cadastro" className="btn btn-primary">Quero testar 1 semana grátis →</Link>
          </div>
          <p className="sub" style={{ marginTop: 10, fontSize: 13 }}>7 dias grátis, sem cartão. R$147/mês é preço promocional de 2026 — quem assina agora trava esse valor durante todo o 2027.</p>
          <p className="guarantee"><b>Ativo em até 24h</b> · Sem taxa de instalação · Sem fidelidade</p>
        </div>
        <div className="trust">
          <div className="wrap trust-inner">
            <span>⚡ Ativo em até 24 horas</span>
            <span>🆓 7 dias grátis, sem cartão</span>
            <span>🔒 Sem contrato de fidelidade</span>
            <span>🧾 Sem taxa e burocracia de instalação</span>
            <span>🤖 IA de ponta do mercado</span>
          </div>
        </div>
      </section>

      <section id="problema">
        <div className="wrap">
          <p className="sec-eyebrow">A realidade de quem empreende no Brasil</p>
          <h2 className="sec-title">Tecnologia de ponta sempre pareceu <em>coisa de empresa grande.</em></h2>
          <p className="sec-sub">Atendimento automatizado, dados em tempo real, IA treinada no seu negócio. Você via isso e pensava: &quot;não é para mim&quot;. Era caro. Era complicado. Acabou.</p>
          <div className="grid grid-4">
            <div className="card"><span className="ico">{I.lock}</span><h3>Parecia inacessível</h3><p>IA, automação, atendimento inteligente. Você ouvia falar, mas era caro e feito para empresa grande. Não para a sua realidade.</p></div>
            <div className="card"><span className="ico">{I.moon}</span><h3>Cliente sem resposta de madrugada</h3><p>Mensagem às 22h. Você vê de manhã. Ele já fechou com quem respondeu primeiro. Toda noite. E você nem sabe quantas vezes.</p></div>
            <div className="card"><span className="ico">{I.repeat}</span><h3>As mesmas perguntas todo dia</h3><p>&quot;Qual o horário?&quot; &quot;Tem entrega?&quot; &quot;Aceita cartão?&quot; Dezenas de vezes por dia, enquanto você deveria estar cuidando do negócio.</p></div>
            <div className="card"><span className="ico">{I.trendDown}</span><h3>Sem visibilidade do que acontece</h3><p>Quantos clientes você perdeu essa semana? Quais perguntas mais aparecem? Quem são seus melhores leads? Sem ferramenta, você não sabe.</p></div>
          </div>
        </div>
      </section>

      <section id="solucao" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap">
          <p className="sec-eyebrow">O que muda no seu negócio</p>
          <h2 className="sec-title">Presença, atendimento e dados <em>de empresa de elite.</em> No seu controle.</h2>
          <div className="grid grid-3" style={{ marginTop: 40 }}>
            <div className="card"><span className="ico">{I.chip}</span><h3>IA treinada na linguagem do seu negócio</h3><p>Você responde um questionário simples — horários, serviços, preços, tom de voz. A IA aprende e passa a responder como se fosse você. Sem código, sem técnico.</p></div>
            <div className="card"><span className="ico">{I.clock}</span><h3>Atendimento automático 24 horas</h3><p>Enquanto você dorme, a IA trabalha. Fora do horário, ela avisa o cliente e retoma quando você abre. Nenhuma mensagem perdida.</p></div>
            <div className="card"><span className="ico">{I.target}</span><h3>Identifica e separa os leads quentes</h3><p>A IA reconhece quem está pronto para comprar, coleta os dados e te avisa. Você entra só na hora de fechar.</p></div>
            <div className="card"><span className="ico">{I.chart}</span><h3>Painel completo nas suas mãos</h3><p>Veja cada conversa em tempo real, acompanhe métricas e saiba o que aconteceu com cada lead. Dados de empresa grande, simples de entender.</p></div>
            <div className="card"><span className="ico">{I.sliders}</span><h3>Controle total sem complicação</h3><p>Liga e desliga a IA quando quiser. Ajusta uma resposta sem refazer nada. Assume o atendimento manualmente quando precisar.</p></div>
            <div className="card"><span className="ico">{I.phone}</span><h3>Número dedicado, longe do pessoal</h3><p>A IA trabalha em um número novo e exclusivo do seu atendimento. Seu número pessoal fica protegido e o profissional fica organizado — do seu jeito.</p></div>
          </div>
        </div>
      </section>

      <section id="como">
        <div className="wrap">
          <p className="sec-eyebrow">Do zero ao funcionando</p>
          <h2 className="sec-title">Sem conhecimento técnico. Sem complicação. <em>Pronto hoje.</em></h2>
          <div className="steps" style={{ marginTop: 40 }}>
            <div className="step"><div className="num">01</div><h3>Você entra e acessa o painel</h3><p>Cadastro simples, sem contrato. Em segundos você já está dentro do painel — limpo e direto.</p><span className="time">⚡ 2 minutos</span></div>
            <div className="step"><div className="num">02</div><h3>Responde o questionário do seu negócio</h3><p>Horários, serviços, preços, tom de voz. Perguntas simples, como uma conversa. Você faz uma vez, a IA nunca esquece.</p><span className="time">📝 15 minutos</span></div>
            <div className="step"><div className="num">03</div><h3>Conecta um número dedicado por QR Code</h3><p>Um número novo e exclusivo do seu atendimento. Abre o celular, escaneia o código e a IA já começa a receber mensagens.</p><span className="time">📱 5 minutos</span></div>
            <div className="step"><div className="num">04</div><h3>A IA atende, você acompanha</h3><p>Cada conversa aparece no painel em tempo real. Você ajusta o que quiser e assume quando precisar. O controle é sempre seu.</p><span className="time">✅ Ativo hoje</span></div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <p className="sec-eyebrow">Por que a Farol IA</p>
          <h2 className="sec-title">Compare com as opções <em>do mercado atual</em></h2>
          <div className="cmp" style={{ marginTop: 40 }}>
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
          <div className="faq" style={{ marginTop: 40 }}>
            <details><summary>Preciso entender de tecnologia para usar?</summary><div className="ans">Não. O processo inteiro foi desenhado para quem nunca mexeu com IA. Você responde um questionário simples, escaneia um QR Code com o celular e está pronto. Se você sabe usar WhatsApp, você consegue usar a Farol IA.</div></details>
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
          <p className="sec-eyebrow" style={{ color: "#25d366", textShadow: "0 0 10px rgba(37,211,102,.55)" }}>Programa Parceiro</p>
          <h2 className="sec-title">Indique e ganhe <em>mensalidades grátis.</em></h2>
          <p className="sec-sub">Cada negócio que entra pelo seu convite e paga a primeira mensalidade vale <b>1 mês grátis</b> pra você. Indicou 3 que assinaram? 3 meses sem pagar. Vire parceiro da Farol IA.</p>
          <div className="grid grid-3" style={{ marginTop: 40 }}>
            <div className="card"><span className="ico">{I.link}</span><h3>Seu link exclusivo</h3><p>No painel você gera um link só seu e manda para donos de negócio que conhece. Quanto mais gente atendendo bem, melhor para todos.</p></div>
            <div className="card"><span className="ico">{I.check}</span><h3>Ele assina, você ganha</h3><p>Quando o indicado entra pelo seu link e paga a primeira mensalidade, o desconto cai automaticamente na sua próxima fatura.</p></div>
            <div className="card"><span className="ico">{I.gift}</span><h3>1 indicação = 1 mês grátis</h3><p>Cada cliente que você trouxer e que assinar zera uma mensalidade sua. Sem limite: indicou vários, ficou vários meses sem pagar.</p></div>
          </div>
        </div>
      </section>

      <section className="final">
        <div className="wrap">
          <h2>Seu negócio com a tecnologia <em>que ele sempre mereceu ter.</em></h2>
          <p>Atendimento 24h · Painel completo · Pronto em menos de 24 horas</p>
          <div className="hero-cta" style={{ justifyContent: "center" }}>
            <Link href="/cadastro" className="btn btn-primary">Quero testar 1 semana grátis →</Link>
          </div>
          <p className="sub" style={{ marginTop: 10, fontSize: 13 }}>Cancele dentro da primeira semana e não pague nada.</p>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <LogoFarol width={150} height={43} />
              <p>Automações inteligentes para quem trabalha de verdade.</p>
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
            <span>Feito para quem trabalha de verdade.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
