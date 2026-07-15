"use client";

import { useState } from "react";
import { CONFIG_PADRAO, DIAS, type ConfigIA } from "@/lib/config-ia";
import painel from "@/components/painel.module.css";
import styles from "./minhaia.module.css";

const SEGMENTOS = [
  "Beleza e Estética",
  "Saúde e Bem-estar",
  "Alimentação e Restaurante",
  "Petshop e Veterinário",
  "Oficina e Mecânica",
  "Comércio / Loja",
  "Serviços Profissionais",
  "Educação e Cursos",
  "Imobiliária",
  "Outro",
];

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const PAGAMENTOS = ["Pix","Cartão de crédito","Cartão de débito","Dinheiro","Boleto","Transferência"];

const TONS: { id: ConfigIA["tom"]; ico: string; titulo: string; sub: string }[] = [
  { id: "amigavel", ico: "😊", titulo: "Amigável", sub: "Descontraído e caloroso" },
  { id: "profissional", ico: "👔", titulo: "Profissional", sub: "Formal e objetivo" },
  { id: "direto", ico: "⚡", titulo: "Direto", sub: "Rápido e sem rodeios" },
  { id: "sofisticado", ico: "💎", titulo: "Sofisticado", sub: "Elegante e premium" },
];

const ROTULO_DIA: Record<string, string> = {
  seg: "Seg", ter: "Ter", qua: "Qua", qui: "Qui", sex: "Sex", sab: "Sáb", dom: "Dom",
};

export function EditorIA({ inicial }: { inicial: ConfigIA }) {
  const [cfg, setCfg] = useState<ConfigIA>(inicial);
  const [servInput, setServInput] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  function set<K extends keyof ConfigIA>(chave: K, valor: ConfigIA[K]) {
    setCfg((c) => ({ ...c, [chave]: valor }));
  }

  function togglePagamento(p: string) {
    set(
      "formas_pagamento",
      cfg.formas_pagamento.includes(p)
        ? cfg.formas_pagamento.filter((x) => x !== p)
        : [...cfg.formas_pagamento, p]
    );
  }

  function addServico(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const v = servInput.trim().replace(/,/g, "");
      if (v && !cfg.servicos.includes(v)) {
        set("servicos", [...cfg.servicos, v]);
      }
      setServInput("");
    }
  }

  function removeServico(s: string) {
    set("servicos", cfg.servicos.filter((x) => x !== s));
  }

  function setDia(dia: string, patch: Partial<ConfigIA["horarios"][string]>) {
    set("horarios", {
      ...cfg.horarios,
      [dia]: { ...cfg.horarios[dia], ...patch },
    });
  }

  async function salvar() {
    setSalvando(true);
    setAviso(null);
    try {
      const resp = await fetch("/api/config-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: cfg }),
      });
      if (!resp.ok) throw new Error();
      setAviso("✓ Configurações salvas");
    } catch {
      setAviso("Não foi possível salvar. Tente novamente.");
    } finally {
      setSalvando(false);
      setTimeout(() => setAviso(null), 3000);
    }
  }

  // Prévia ao vivo: aplica as variáveis na saudação.
  const nomeIaPreview = cfg.nome_ia || "sua assistente";
  const saudacaoPreview = cfg.msg_saudacao
    .replace(/{nome_negocio}/g, cfg.nome_negocio || "seu negócio")
    .replace(/{nome_ia}/g, nomeIaPreview)
    .replace(/{nome_cliente}/g, "");

  return (
    <>
      <div className={painel.topbar}>
        <div className={styles.topbarLeft}>
          <h1>Minha IA</h1>
          <p>Configure como sua assistente atende seus clientes</p>
        </div>
        <div className={painel.topbarRight}>
          <span className={cfg.ativa ? styles.badgeOn : styles.badgeOff}>
            <span className={styles.dot} />
            {cfg.ativa ? "IA Ativa" : "IA Pausada"}
          </span>
          <button
            className={`${painel.btn} ${painel.btnPrimary} ${styles.btnSm}`}
            onClick={salvar}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "💾 Salvar"}
          </button>
        </div>
      </div>

      <div className={styles.contentNarrow}>
        {/* 1. NEGÓCIO + TOM */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.ico}>🏪</div>
            <div className={styles.cardHeadText}>
              <h2>Seu negócio</h2>
              <p>Quem você é e como a IA deve se comunicar</p>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Nome do negócio</label>
                <input
                  className={styles.input}
                  value={cfg.nome_negocio}
                  placeholder="Ex: Barbearia do Zé"
                  onChange={(e) => set("nome_negocio", e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>Segmento</label>
                <select
                  className={styles.select}
                  value={cfg.segmento}
                  onChange={(e) => set("segmento", e.target.value)}
                >
                  {SEGMENTOS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={`${styles.row} ${styles.rowTriple}`}>
              <div className={styles.field}>
                <label>Estado</label>
                <select
                  className={styles.select}
                  value={cfg.uf}
                  onChange={(e) => set("uf", e.target.value)}
                >
                  {UFS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Cidade</label>
                <input
                  className={styles.input}
                  value={cfg.cidade}
                  placeholder="Sua cidade"
                  onChange={(e) => set("cidade", e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>
                  Bairro <span className={styles.optional}>(opcional)</span>
                </label>
                <input
                  className={styles.input}
                  value={cfg.bairro}
                  placeholder="Ex: Centro"
                  onChange={(e) => set("bairro", e.target.value)}
                />
              </div>
            </div>

            <hr className={styles.divider} />

            <div className={styles.field} style={{ marginBottom: 14 }}>
              <label>Tom de voz da IA</label>
              <p className={styles.hint}>Como ela conversa com seus clientes</p>
            </div>
            <div className={styles.seg}>
              {TONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.segOpt} ${cfg.tom === t.id ? styles.segOn : ""}`}
                  onClick={() => set("tom", t.id)}
                >
                  <span className={styles.segIco}>{t.ico}</span>
                  <span className={styles.segTxt}>
                    <b>{t.titulo}</b>
                    <span>{t.sub}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className={styles.row} style={{ marginTop: 18 }}>
              <div className={styles.field}>
                <label>Uso de emojis</label>
                <select
                  className={styles.select}
                  value={cfg.emojis}
                  onChange={(e) =>
                    set("emojis", e.target.value as ConfigIA["emojis"])
                  }
                >
                  <option value="moderado">Moderado — 1 ou 2 por mensagem</option>
                  <option value="bastante">Bastante — tom bem descontraído</option>
                  <option value="nenhum">Nenhum — tom formal</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>
                  Nome da IA <span className={styles.optional}>(opcional)</span>
                </label>
                <input
                  className={styles.input}
                  value={cfg.nome_ia}
                  placeholder="Ex: Sofia — ou deixe vazio"
                  onChange={(e) => set("nome_ia", e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. O QUE A IA SABE */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.ico}>🧠</div>
            <div className={styles.cardHeadText}>
              <h2>O que a IA sabe sobre você</h2>
              <p>Quanto mais completo, melhor ela atende</p>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={`${styles.row} ${styles.rowSingle}`} style={{ marginBottom: 16 }}>
              <div className={styles.field}>
                <label>Serviços ou produtos</label>
                <p className={styles.hint}>
                  Digite e pressione Enter para adicionar cada item
                </p>
                <div
                  className={styles.tagsWrap}
                  onClick={(e) =>
                    (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()
                  }
                >
                  {cfg.servicos.map((s) => (
                    <span key={s} className={styles.tag}>
                      {s}
                      <button
                        type="button"
                        className={styles.tagDel}
                        onClick={() => removeServico(s)}
                        aria-label={`Remover ${s}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    className={styles.tagsInput}
                    placeholder="+ Adicionar..."
                    value={servInput}
                    onChange={(e) => setServInput(e.target.value)}
                    onKeyDown={addServico}
                  />
                </div>
              </div>
            </div>

            <div className={styles.field} style={{ marginBottom: 16 }}>
              <label>Formas de pagamento aceitas</label>
              <div className={styles.chips}>
                {PAGAMENTOS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`${styles.chipOpt} ${
                      cfg.formas_pagamento.includes(p) ? styles.chipOn : ""
                    }`}
                    onClick={() => togglePagamento(p)}
                  >
                    {cfg.formas_pagamento.includes(p) ? "✓ " : ""}
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label>Faz entrega / delivery?</label>
                <select
                  className={styles.select}
                  value={cfg.entrega}
                  onChange={(e) => set("entrega", e.target.value)}
                >
                  <option>Não fazemos entrega</option>
                  <option>Sim — na região</option>
                  <option>Sim — na cidade toda</option>
                  <option>Via iFood / Rappi / app</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Faz agendamento?</label>
                <select
                  className={styles.select}
                  value={cfg.agendamento}
                  onChange={(e) =>
                    set("agendamento", e.target.value as ConfigIA["agendamento"])
                  }
                >
                  <option value="sim">Sim — a IA agenda pelo chat</option>
                  <option value="nao">Não — ordem de chegada</option>
                  <option value="link">Sim — por link externo</option>
                </select>
              </div>
            </div>

            {cfg.agendamento === "link" && (
              <div className={`${styles.row} ${styles.rowSingle}`} style={{ marginTop: 16 }}>
                <div className={styles.field}>
                  <label>Link de agendamento</label>
                  <input
                    className={styles.input}
                    value={cfg.link_agendamento}
                    placeholder="https://calendly.com/seu-negocio"
                    onChange={(e) => set("link_agendamento", e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className={styles.field} style={{ marginTop: 16 }}>
              <label>
                Algo mais que a IA deve saber?{" "}
                <span className={styles.optional}>(opcional)</span>
              </label>
              <p className={styles.hint}>
                Detalhes, regras, diferenciais — a IA aprende com o que você
                escrever aqui
              </p>
              <textarea
                className={styles.textarea}
                rows={4}
                value={cfg.contexto_extra}
                placeholder="Ex: Somos especializados em cabelos cacheados. Não fazemos orçamento por mensagem — o cliente vem pessoalmente."
                onChange={(e) => set("contexto_extra", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* 3. HORÁRIOS */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.ico}>🕐</div>
            <div className={styles.cardHeadText}>
              <h2>Horários de funcionamento</h2>
              <p>Clique no dia para abrir ou fechar</p>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.horarioGrid}>
              {DIAS.map((dia) => {
                const h = cfg.horarios[dia];
                return (
                  <div key={dia} className={styles.diaCol}>
                    <div className={styles.diaLabel}>{ROTULO_DIA[dia]}</div>
                    <button
                      type="button"
                      className={`${styles.diaCheck} ${h.aberto ? styles.diaCheckOn : ""}`}
                      onClick={() => setDia(dia, { aberto: !h.aberto })}
                      aria-label={`${ROTULO_DIA[dia]} ${h.aberto ? "aberto" : "fechado"}`}
                    >
                      {h.aberto ? "✓" : ""}
                    </button>
                    <input
                      type="time"
                      className={styles.timeInput}
                      value={h.abre}
                      disabled={!h.aberto}
                      onChange={(e) => setDia(dia, { abre: e.target.value })}
                    />
                    <div className={styles.timeSep}>às</div>
                    <input
                      type="time"
                      className={styles.timeInput}
                      value={h.fecha}
                      disabled={!h.aberto}
                      onChange={(e) => setDia(dia, { fecha: e.target.value })}
                    />
                  </div>
                );
              })}
            </div>

            <div className={styles.toggleRow} style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
              <div className={styles.toggleInfo}>
                <h3>Responder fora do horário</h3>
                <p>Envia mensagem automática avisando que está fechado</p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={cfg.responder_fora_horario}
                  onChange={(e) => set("responder_fora_horario", e.target.checked)}
                />
                <div className={styles.toggleTrack} />
                <div className={styles.toggleThumb} />
              </label>
            </div>
            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <h3>Informar quando vai reabrir</h3>
                <p>Ex: &quot;Abrimos amanhã às 9h&quot;</p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={cfg.informar_reabertura}
                  onChange={(e) => set("informar_reabertura", e.target.checked)}
                />
                <div className={styles.toggleTrack} />
                <div className={styles.toggleThumb} />
              </label>
            </div>
          </div>
        </section>

        {/* 4. MENSAGENS */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.ico}>💬</div>
            <div className={styles.cardHeadText}>
              <h2>Mensagens principais</h2>
              <p>Use as variáveis em chave para personalizar</p>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.msgBlock}>
              <span className={styles.msgLabel}>Saudação (primeira mensagem)</span>
              <textarea
                className={styles.textarea}
                rows={2}
                value={cfg.msg_saudacao}
                onChange={(e) => set("msg_saudacao", e.target.value)}
              />
              <div className={styles.vars}>
                <span className={styles.varChip}>{"{nome_negocio}"}</span>
                <span className={styles.varChip}>{"{nome_ia}"}</span>
                <span className={styles.varChip}>{"{nome_cliente}"}</span>
              </div>
            </div>
            <div className={styles.msgBlock}>
              <span className={styles.msgLabel}>Fora do horário</span>
              <textarea
                className={styles.textarea}
                rows={2}
                value={cfg.msg_fora_horario}
                onChange={(e) => set("msg_fora_horario", e.target.value)}
              />
              <div className={styles.vars}>
                <span className={styles.varChip}>{"{nome_negocio}"}</span>
                <span className={styles.varChip}>{"{horario_funcionamento}"}</span>
              </div>
            </div>
            <div className={styles.msgBlock}>
              <span className={styles.msgLabel}>Encerramento</span>
              <textarea
                className={styles.textarea}
                rows={2}
                value={cfg.msg_encerramento}
                onChange={(e) => set("msg_encerramento", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* 5. COMPORTAMENTO */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.ico}>🎛️</div>
            <div className={styles.cardHeadText}>
              <h2>O que a IA pode fazer</h2>
              <p>Ligue ou desligue cada permissão</p>
            </div>
          </div>
          <div className={styles.cardBody}>
            {[
              { k: "pode_informar_precos", t: "Informar preços", s: "A IA pode responder sobre valores" },
              { k: "pode_agendar", t: "Fazer agendamentos pelo chat", s: "Coleta nome, serviço e horário" },
              { k: "perguntar_nome", t: "Perguntar o nome do cliente", s: "Personaliza o atendimento" },
              { k: "transferir_humano", t: "Chamar atendente humano quando necessário", s: "Transfere casos que ela não resolve" },
              { k: "receber_reclamacoes", t: "Receber reclamações pelo chat", s: "Desligue para redirecionar ao telefone" },
            ].map((row) => (
              <div key={row.k} className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <h3>{row.t}</h3>
                  <p>{row.s}</p>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={cfg[row.k as keyof ConfigIA] as boolean}
                    onChange={(e) =>
                      set(row.k as keyof ConfigIA, e.target.checked as never)
                    }
                  />
                  <div className={styles.toggleTrack} />
                  <div className={styles.toggleThumb} />
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* PRÉVIA */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.ico}>👁️</div>
            <div className={styles.cardHeadText}>
              <h2>Prévia do atendimento</h2>
              <p>Como seu cliente vê no WhatsApp</p>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.previewChat}>
              <div className={styles.previewHead}>
                <div className={styles.waDot} />
                {cfg.nome_negocio || "Seu negócio"}
                {cfg.nome_ia ? ` · ${cfg.nome_ia}` : ""}
              </div>
              <div className={styles.previewMsgs}>
                <div className={`${styles.msg} ${styles.msgC}`}>
                  Oi, qual o horário de vocês?
                  <div className={styles.msgMeta}>14:22</div>
                </div>
                <div className={`${styles.msg} ${styles.msgIa}`}>
                  {saudacaoPreview}
                  <div className={styles.msgMeta}>14:22 ✓✓</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.saveBar}>
        <p>{aviso ?? "💡 As alterações entram em vigor imediatamente após salvar"}</p>
        <div className={styles.saveActions}>
          <button
            className={`${painel.btn} ${painel.btnGhost} ${styles.btnSm}`}
            onClick={() => setCfg(inicial)}
            disabled={salvando}
          >
            Descartar
          </button>
          <button
            className={`${painel.btn} ${painel.btnPrimary} ${styles.btnSm}`}
            onClick={salvar}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "💾 Salvar configurações"}
          </button>
        </div>
      </div>
    </>
  );
}
