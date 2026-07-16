import Link from "next/link";
import { LogoFarol } from "@/components/LogoFarol";
import "./landing.css";

export const metadata = {
  title: "Farol IA — Pare de perder cliente no WhatsApp enquanto você dorme",
  description:
    "Uma IA treinada no seu negócio responde, qualifica e agenda 24h por dia, no seu número de sempre. Sem você precisar entender de tecnologia.",
};

// ⚠️ AJUSTAR ANTES DO LANÇAMENTO:
// Trocar pelo número real de WhatsApp dedicado (apenas dígitos, com DDI 55).
const WHATS = "5554991873855";
const wa = (texto: string) =>
  `https://wa.me/${WHATS}?text=${encodeURIComponent(texto)}`;

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
            <a href="#fundador">Quem somos</a>
            <a href="#faq">Dúvidas</a>
          </nav>
          <div className="nav-cta">
            <Link href="/login" className="btn btn-ghost">Já sou cliente</Link>
            <a href="#ativar" className="btn btn-primary">Quero participar</a>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <span className="eyebrow">A mesma IA das grandes · sem a complexidade · sem o preço absurdo</span>
          <h1>Pare de perder cliente no WhatsApp <em>enquanto você dorme.</em></h1>
          <p className="lead">Uma IA treinada no seu negócio responde, qualifica e agenda 24 horas por dia. No seu número de sempre. Sem você precisar entender de tecnologia.</p>
          <p className="sub">Pronto em menos de 24 horas. Sem contrato. Cancele quando quiser.</p>
          <div className="price-row">
            <span className="eyebrow" style={{ marginBottom: 0 }}>★ Programa Fundador · vagas limitadas para o beta</span>
          </div>
          <div className="hero-cta">
            <a href={wa("Oi! Quero testar a Farol IA")} className="btn btn-wa">💬 Conversar com a IA agora</a>
            <a href="#ativar" className="btn btn-primary">Quero ser fundador →</a>
          </div>
          <p className="guarantee"><b>Ativo em até 24h</b> · Seu número continua o mesmo · Sem fidelidade</p>
        </div>
        <div className="trust">
          <div className="wrap trust-inner">
            <span>⚡ Ativo em até 24 horas</span>
            <span>🔒 Sem contrato de fidelidade</span>
            <span>📱 Seu número, sem mudanças</span>
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
            <div className="card"><span className="ico">📵</span><h3>Parecia inacessível</h3><p>IA, automação, atendimento inteligente. Você ouvia falar, mas era caro e feito para empresa grande. Não para a sua realidade.</p></div>
            <div className="card"><span className="ico">🌙</span><h3>Cliente sem resposta de madrugada</h3><p>Mensagem às 22h. Você vê de manhã. Ele já fechou com quem respondeu primeiro. Toda noite. E você nem sabe quantas vezes.</p></div>
            <div className="card"><span className="ico">🔁</span><h3>As mesmas perguntas todo dia</h3><p>&quot;Qual o horário?&quot; &quot;Tem entrega?&quot; &quot;Aceita cartão?&quot; Dezenas de vezes por dia, enquanto você deveria estar cuidando do negócio.</p></div>
            <div className="card"><span className="ico">📉</span><h3>Sem visibilidade do que acontece</h3><p>Quantos clientes você perdeu essa semana? Quais perguntas mais aparecem? Quem são seus melhores leads? Sem ferramenta, você não sabe.</p></div>
          </div>
        </div>
      </section>

      <section id="solucao" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap">
          <p className="sec-eyebrow">O que muda no seu negócio</p>
          <h2 className="sec-title">Presença, atendimento e dados <em>de empresa de elite.</em> No seu controle.</h2>
          <div className="grid grid-3" style={{ marginTop: 40 }}>
            <div className="card"><span className="ico">🧠</span><h3>IA treinada na linguagem do seu negócio</h3><p>Você responde um questionário simples — horários, serviços, preços, tom de voz. A IA aprende e passa a responder como se fosse você. Sem código, sem técnico.</p></div>
            <div className="card"><span className="ico">⏰</span><h3>Atendimento automático 24 horas</h3><p>Enquanto você dorme, a IA trabalha. Fora do horário, ela avisa o cliente e retoma quando você abre. Nenhuma mensagem perdida.</p></div>
            <div className="card"><span className="ico">🎯</span><h3>Identifica e separa os leads quentes</h3><p>A IA reconhece quem está pronto para comprar, coleta os dados e te avisa. Você entra só na hora de fechar.</p></div>
            <div className="card"><span className="ico">📊</span><h3>Painel completo nas suas mãos</h3><p>Veja cada conversa em tempo real, acompanhe métricas e saiba o que aconteceu com cada lead. Dados de empresa grande, simples de entender.</p></div>
            <div className="card"><span className="ico">🎛️</span><h3>Controle total sem complicação</h3><p>Liga e desliga a IA quando quiser. Ajusta uma resposta sem refazer nada. Assume o atendimento manualmente quando precisar.</p></div>
            <div className="card"><span className="ico">📱</span><h3>Seu número atual, sem mudar nada</h3><p>Conectamos no seu número existente por QR Code. Seus clientes não percebem nenhuma mudança. Funciona no celular que você já usa.</p></div>
          </div>
        </div>
      </section>

      <section id="como">
        <div className="wrap">
          <p className="sec-eyebrow">Do zero ao funcionando</p>
          <h2 className="sec-title">Sem conhecimento técnico. Sem complicação. <em>Pronto hoje.</em></h2>
          <div className="steps" style={{ marginTop: 40 }}>
            <div className="step"><div className="num">01</div><h3>Você entra no programa e acessa o painel</h3><p>Cadastro simples, sem contrato. Em segundos você já está dentro do painel — limpo e direto.</p><span className="time">⚡ 2 minutos</span></div>
            <div className="step"><div className="num">02</div><h3>Responde o questionário do seu negócio</h3><p>Horários, serviços, preços, tom de voz. Perguntas simples, como uma conversa. Você faz uma vez, a IA nunca esquece.</p><span className="time">📝 15 minutos</span></div>
            <div className="step"><div className="num">03</div><h3>Conecta seu WhatsApp com um QR Code</h3><p>Abre o celular, escaneia o código. Seu número continua o mesmo e a IA já começa a receber mensagens.</p><span className="time">📱 5 minutos</span></div>
            <div className="step"><div className="num">04</div><h3>A IA atende, você acompanha</h3><p>Cada conversa aparece no painel em tempo real. Você ajusta o que quiser e assume quando precisar. O controle é sempre seu.</p><span className="time">✅ Ativo hoje</span></div>
          </div>
        </div>
      </section>

      <section id="demo">
        <div className="wrap">
          <div className="demo">
            <h2>Não acredite na gente. <span className="amber">Converse com a IA.</span></h2>
            <p>Manda uma mensagem agora e veja a Farol IA respondendo como ela responderia no seu negócio. Leva 30 segundos.</p>
            <a href={wa("Oi! Quero testar a Farol IA")} className="btn btn-wa">💬 Testar a IA no WhatsApp</a>
            <p className="tag">✓ Sem cadastro · Sem compromisso · É só conversar</p>
          </div>
        </div>
      </section>

      <section id="fundador" className="founder">
        <div className="wrap">
          <p className="sec-eyebrow">Quem está por trás disso</p>
          <h2 className="sec-title" style={{ marginBottom: 48 }}>Feito por quem conhece <em>de perto</em> a sua realidade</h2>
          <div className="founder-grid">
            <div className="founder-card">
              <div className="founder-avatar">FF</div>
              <b>Fernando Frare</b>
              <span>Fundador · Farol IA</span>
            </div>
            <div className="founder-text">
              <p><strong>Cresci vendo minha família construir no braço.</strong> Interior dos anos 90. Indústria, suor, tijolo por tijolo. Sem tecnologia, sem atalho — só trabalho e vontade de prosperar.</p>
              <p>Comecei a trabalhar em fábrica aos 12 anos. Aprendi cedo que o empresário brasileiro de verdade não tem medo de trabalhar. O que ele não tem é tempo, ferramenta e acesso.</p>
              <p>Passei pelo banco. Virei trader. Empreendi. Hoje sou graduando em Gestão de Inteligência Artificial para Empresas. E em cada etapa percebi a mesma coisa: a tecnologia que as grandes usam para crescer estava fora do alcance de quem mais precisa dela.</p>
              <p>As pequenas e médias empresas geram mais de 70% dos empregos formais do Brasil. São o motor real da economia — e os menos assistidos quando o assunto é inovação. Eu conheço esse empresário. Cresci ao lado dele.</p>
              <p><strong>A Farol IA nasceu disso.</strong> De um compromisso pessoal: colocar nas mãos de quem trabalha de verdade a mesma tecnologia que as grandes já usam há anos — de forma simples, acessível e com resultado real.</p>
              <p className="sign">— Fernando Frare, Fundador da Farol IA</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <p className="sec-eyebrow">Por que a Farol IA</p>
          <h2 className="sec-title">Compare e veja o que <em>faz sentido para você</em></h2>
          <div className="cmp" style={{ marginTop: 40 }}>
            <table>
              <thead><tr><th></th><th>Funcionário</th><th>Apps genéricos</th><th className="col-us">Farol IA</th></tr></thead>
              <tbody>
                <tr><td>Atendimento 24h</td><td className="no">✗</td><td className="yes">✓</td><td className="col-us yes">✓</td></tr>
                <tr><td>IA treinada no seu negócio</td><td className="no">✗</td><td className="no">✗</td><td className="col-us yes">✓</td></tr>
                <tr><td>Setup incluído</td><td className="no">✗</td><td className="no">✗</td><td className="col-us yes">✓</td></tr>
                <tr><td>Sem conhecimento técnico</td><td className="yes">✓</td><td className="no">✗</td><td className="col-us yes">✓</td></tr>
                <tr><td>Cancele quando quiser</td><td className="no">✗</td><td className="yes">✓</td><td className="col-us yes">✓</td></tr>
                <tr><td>Atendimento que entende seu negócio</td><td className="no">✗</td><td className="no">✗</td><td className="col-us yes">✓</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="ativar">
        <div className="wrap">
          <div className="fp">
            <span className="badge">★ Programa Fundador · Vagas limitadas</span>
            <h2>Seja um dos <span className="gold">10 primeiros</span> a usar a Farol IA</h2>
            <p>A Farol IA está abrindo as primeiras vagas do beta. Os fundadores entram com acesso antecipado e ajudam a moldar o produto — em troca, recebem suporte direto comigo durante todo o período de testes.</p>
            <p className="slots">🔥 Acesso antecipado ao beta · Condição especial de fundador · Suporte direto com o fundador</p>
            <a href={wa("Quero ser fundador da Farol IA")} className="btn btn-primary" style={{ fontSize: 17, padding: "15px 32px" }}>Quero minha vaga de fundador →</a>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 18 }}>Sem fidelidade · Ativo em até 24h · Cancele quando quiser</p>
          </div>
        </div>
      </section>

      <section id="faq">
        <div className="wrap">
          <p className="sec-eyebrow">Dúvidas</p>
          <h2 className="sec-title">Perguntas frequentes</h2>
          <div className="faq" style={{ marginTop: 40 }}>
            <details><summary>Preciso entender de tecnologia para usar?</summary><div className="ans">Não. O processo inteiro foi desenhado para quem nunca mexeu com IA. Você responde um questionário simples, escaneia um QR Code com o celular e está pronto. Se você sabe usar WhatsApp, você consegue usar a Farol IA.</div></details>
            <details><summary>Meu número do WhatsApp vai mudar?</summary><div className="ans">Não. Conectamos ao seu número atual pelo QR Code. Seus clientes continuam te encontrando normalmente, sem perceber nenhuma mudança.</div></details>
            <details><summary>Quantas conversas estão incluídas?</summary><div className="ans">O plano inclui até 2.000 conversas por mês — mais do que suficiente para a grande maioria dos negócios. Se o seu volume crescer além disso, a gente conversa sobre um plano sob medida. Sem surpresa na fatura.</div></details>
            <details><summary>Como eu acompanho o que a IA está fazendo?</summary><div className="ans">Tudo aparece no seu painel em tempo real. Você vê cada conversa, cada lead, cada métrica. Pode assumir o atendimento manualmente, ajustar qualquer resposta da IA, ou só observar o sistema trabalhando por você.</div></details>
            <details><summary>E se a IA não souber responder algo?</summary><div className="ans">Quando a IA não sabe responder, ela informa o cliente com educação e transfere o atendimento para você. Você recebe um alerta no painel e assume a conversa diretamente, sem o cliente perceber a transição.</div></details>
            <details><summary>Posso cancelar quando quiser?</summary><div className="ans">Sim. Sem contrato, sem multa, sem burocracia. Cancela pelo painel em menos de 2 minutos.</div></details>
            <details><summary>Em quanto tempo começa a funcionar?</summary><div className="ans">A maioria dos clientes ativa em menos de 1 hora. O prazo máximo é 24 horas após o questionário e a conexão do WhatsApp.</div></details>
          </div>
        </div>
      </section>

      <section className="final">
        <div className="wrap">
          <h2>Seu negócio com a tecnologia <em>que ele sempre mereceu ter.</em></h2>
          <p>Atendimento 24h · Painel completo · Pronto em menos de 24 horas</p>
          <div className="hero-cta" style={{ justifyContent: "center" }}>
            <a href={wa("Oi! Quero testar a Farol IA")} className="btn btn-wa">💬 Conversar com a IA</a>
            <a href="#ativar" className="btn btn-primary">Quero minha vaga de fundador →</a>
          </div>
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
                <a href="#ativar">Programa Fundador</a>
                <a href="#faq">Dúvidas</a>
              </div>
              <div className="foot-col">
                <h4>Empresa</h4>
                <a href="#fundador">Quem somos</a>
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
            <span>© 2026 Farol IA · Automações Inteligentes · <span style={{ color: "var(--gold)" }}>[CNPJ a inserir]</span></span>
            <span>Feito para quem trabalha de verdade.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
