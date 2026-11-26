/* ==========================================================
   Tec · mascote e assistente da Atalho IA
   - Uma tecla de atalho com olhos de LED. Fica no canto inferior
     esquerdo, pisca, olha para o cursor e acena.
   - Clique: abre o assistente com respostas prontas sobre a empresa
     (não é uma IA generativa; o que ele não sabe vai para o WhatsApp).
   - Tour: anda pela página, sessão por sessão, mostrando o site.
   ========================================================== */
(function () {
  const WHATS = "5518996141788";
  // "reduzir movimento" do sistema desliga as animações; ?movimento na URL liga de novo (para testar)
  const calmo = !/[?&]movimento\b/.test(location.search) && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // any-*: notebooks com tela de toque também contam como "tem mouse"
  const fino = window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);

  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sem armazenamento */ } };
  const ler = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };

  function abrirWhats(texto) {
    const a = document.createElement("a");
    a.href = "https://wa.me/" + WHATS + "?text=" + encodeURIComponent(texto);
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* ---------- O personagem ---------- */
  const SVG = `
  <svg class="tec__svg" viewBox="0 0 120 150" aria-hidden="true">
    <defs>
      <linearGradient id="tec-corpo" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stop-color="#2A4164"/><stop offset=".55" stop-color="#1B2B44"/><stop offset="1" stop-color="#15233A"/>
      </linearGradient>
      <radialGradient id="tec-brilho" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#FF6A2B" stop-opacity=".6"/><stop offset="1" stop-color="#FF6A2B" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse class="tec__sombra" cx="60" cy="144" rx="30" ry="4" fill="#060C16" opacity=".55"/>
    <g class="tec__perna tec__perna--e"><rect x="38" y="118" width="14" height="22" rx="7" fill="#15233A"/><rect x="35" y="134" width="20" height="9" rx="4.5" fill="#FF6A2B"/></g>
    <g class="tec__perna tec__perna--d"><rect x="68" y="118" width="14" height="22" rx="7" fill="#15233A"/><rect x="65" y="134" width="20" height="9" rx="4.5" fill="#FF6A2B"/></g>
    <g class="tec__corpo">
      <rect class="tec__braco tec__braco--e" x="4" y="66" width="12" height="30" rx="6" fill="#22344F"/>
      <rect class="tec__braco tec__braco--d" x="104" y="66" width="12" height="30" rx="6" fill="#22344F"/>
      <path d="M60 30 V12" stroke="#8A97AB" stroke-width="3" stroke-dasharray="1 5" stroke-linecap="round"/>
      <circle class="tec__luz" cx="60" cy="8" r="11" fill="url(#tec-brilho)"/>
      <circle cx="60" cy="8" r="5.5" fill="#FF6A2B"/>
      <rect x="12" y="36" width="96" height="88" rx="28" fill="#060C16"/>
      <rect x="12" y="28" width="96" height="86" rx="28" fill="url(#tec-corpo)"/>
      <rect x="13" y="29" width="94" height="84" rx="27" fill="none" stroke="#FFFFFF" stroke-opacity=".08"/>
      <rect x="24" y="42" width="72" height="46" rx="16" fill="#0A1220"/>
      <g class="tec__olhos">
        <rect class="tec__olho" x="38" y="54" width="11" height="18" rx="5.5" fill="#FF6A2B"/>
        <rect class="tec__olho" x="71" y="54" width="11" height="18" rx="5.5" fill="#FF6A2B"/>
      </g>
      <path class="tec__boca" d="M53 79 Q60 84 67 79" fill="none" stroke="#8A97AB" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M53 104 L67 90 M58 90 H67 V99" fill="none" stroke="#FF6A2B" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>`;

  const raiz = document.createElement("div");
  raiz.className = "tec";
  raiz.innerHTML = `
    <div class="tec__balao" id="tec-balao" role="status" aria-live="polite" hidden>
      <p class="tec__fala"></p>
      <div class="tec__acoes"></div>
    </div>
    <button class="tec__boneco" type="button" aria-label="Abrir o assistente da Atalho IA" aria-expanded="false" aria-controls="tec-chat">${SVG}</button>
    <section class="tec-chat" id="tec-chat" role="dialog" aria-label="Assistente da Atalho IA" hidden>
      <header class="tec-chat__cab">
        <span class="tec-chat__avatar">${SVG}</span>
        <span><b>Tec</b><small>assistente da Atalho IA</small></span>
        <button class="tec-chat__fechar" type="button" aria-label="Fechar o assistente">×</button>
      </header>
      <div class="tec-chat__msgs" aria-live="polite"></div>
      <div class="tec-chat__atalhos"></div>
      <form class="tec-chat__form" autocomplete="off">
        <label class="sr" for="tec-pergunta">Escreva a sua pergunta</label>
        <input id="tec-pergunta" type="text" maxlength="200" placeholder="Pergunte algo sobre a Atalho IA">
        <button type="submit" aria-label="Enviar pergunta"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 L18 6 M9 6 H18 V15"/></svg></button>
      </form>
      <p class="tec-chat__nota mono">Respostas automáticas · dúvidas específicas vão para o WhatsApp</p>
    </section>`;
  document.body.appendChild(raiz);

  const boneco = $(".tec__boneco", raiz);
  const balao = $(".tec__balao", raiz);
  const fala = $(".tec__fala", raiz);
  const acoes = $(".tec__acoes", raiz);
  const chat = $(".tec-chat", raiz);
  const msgs = $(".tec-chat__msgs", raiz);
  const atalhos = $(".tec-chat__atalhos", raiz);
  const form = $(".tec-chat__form", raiz);
  const campo = $("#tec-pergunta");

  /* ---------- Posição e caminhada ----------
     (v3) O Tec é posicionado direto por transform (x para os lados, y = altura
     acima do rodapé da tela). Medidas ficam guardadas: nada de medir a cada quadro. */
  const MARGEM = 16;
  let x = MARGEM;
  let y = 0;
  let larg = 72, alt = 90;
  const svgBoneco = $(".tec__boneco .tec__svg", raiz);
  function medirBoneco() { const r = boneco.getBoundingClientRect(); if (r.width) { larg = r.width; alt = r.height; } }
  function largura() { return larg; }
  // linha do "chão": onde ficam os pés do Tec quando y = 0
  function chaoY() { return window.innerHeight - 14; }
  function colocar(px, py = y, dur = 0, curva = "linear") {
    x = px; y = Math.max(0, py);
    raiz.style.transition = dur ? "transform " + dur + "s " + curva : "none";
    raiz.style.transform = "translate3d(" + px.toFixed(1) + "px," + (-y).toFixed(1) + "px,0)";
  }
  function aplicarX(px) { colocar(px, y, 0); }
  colocar(x, 0);
  requestAnimationFrame(medirBoneco);
  window.addEventListener("resize", medirBoneco);

  async function andarAte(alvoX) {
    // se estiver em cima de algum elemento ou no ar, primeiro desce
    if (y > 0) await descer();
    const max = window.innerWidth - larg - MARGEM;
    const destino = Math.max(MARGEM, Math.min(max, alvoX));
    const dist = Math.abs(destino - x);
    if (dist < 4 || calmo) { colocar(destino, 0, 0); return; }
    const dur = Math.min(2.6, Math.max(0.6, dist / 420));
    raiz.classList.add("andando");
    raiz.classList.toggle("para-esquerda", destino < x);
    colocar(destino, 0, dur);
    await new Promise((ok) => setTimeout(ok, dur * 1000 + 60));
    raiz.classList.remove("andando", "para-esquerda");
  }

  /* ---------- Expressões ---------- */
  function piscar() {
    raiz.classList.add("piscando");
    setTimeout(() => raiz.classList.remove("piscando"), 160);
  }
  (function cicloPiscar() {
    setTimeout(() => { piscar(); cicloPiscar(); }, 2500 + Math.random() * 3500);
  })();
  function acenar() {
    if (calmo) return;
    raiz.classList.remove("acenando");
    void raiz.offsetWidth; // reinicia a animação
    raiz.classList.add("acenando");
    setTimeout(() => raiz.classList.remove("acenando"), 1300);
  }
  function feliz() {
    raiz.classList.add("feliz");
    setTimeout(() => raiz.classList.remove("feliz"), 1400);
  }

  // olhos acompanham o cursor
  if (fino && !calmo) {
    const olhos = $(".tec__boneco .tec__olhos", raiz);
    let quadro = 0;
    document.addEventListener("pointermove", (e) => {
      if (quadro) return;
      quadro = requestAnimationFrame(() => {
        quadro = 0;
        const cx = x + larg / 2;
        const cy = chaoY() - y - alt * 0.58;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const d = Math.hypot(dx, dy) || 1;
        olhos.style.transform = "translate(" + ((dx / d) * 4).toFixed(2) + "px," + ((dy / d) * 3).toFixed(2) + "px)";
      });
    }, { passive: true });
  }

  /* ---------- Balão de fala ---------- */
  function falar(texto, botoes) {
    // uma fala nova cancela o "fechar sozinho" da fala anterior (senão ele fecharia o convite)
    clearTimeout(timerRapido);
    fala.textContent = texto;
    acoes.innerHTML = "";
    (botoes || []).forEach(([rotulo, acao, principal]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tec__btn" + (principal ? " tec__btn--principal" : "");
      b.textContent = rotulo;
      b.addEventListener("click", acao);
      acoes.appendChild(b);
    });
    balao.hidden = false;
    // o balão abre para o lado com mais espaço
    raiz.classList.toggle("balao-esquerda", x + larg / 2 > window.innerWidth / 2);
    balao.classList.remove("entra");
    void balao.offsetWidth;
    balao.classList.add("entra");
    encaixarBalao();
  }
  // mantém o balão sempre dentro da tela, mesmo se o Tec ainda estiver chegando
  // (v3) sem getBoundingClientRect: a posição do balão sai das contas (largura fixa do CSS)
  function encaixarBalao() {
    if (balao.hidden) return;
    const bw = Math.min(310, window.innerWidth - 32);
    const esquerda = x + (raiz.classList.contains("balao-esquerda") ? larg - bw : 0);
    const dx = esquerda < 12 ? 12 - esquerda : Math.min(0, window.innerWidth - 12 - (esquerda + bw));
    const novo = dx ? dx.toFixed(0) + "px 0" : "";
    if (balao.style.translate !== novo) balao.style.translate = novo;
  }
  window.addEventListener("resize", encaixarBalao);
  raiz.addEventListener("transitionend", (e) => { if (e.target === raiz) encaixarBalao(); });
  function calar() { balao.hidden = true; }

  /* ---------- Tour pelo site ---------- */
  const PASSOS = [
    { alvo: ".paleta", texto: "Comece por aqui: escreva o que toma o seu tempo e aperte Enter. A mensagem chega direto no nosso WhatsApp." },
    { alvo: ".bento", texto: "Estas são demonstrações do que dá para construir: atendimento no WhatsApp, leitura de contratos, painéis e sistemas." },
    { alvo: ".calc__resultado", texto: "Na calculadora, você ajusta os números e vê quantas horas por mês uma tarefa repetitiva custa." },
    { alvo: ".mapa__quadro", texto: "No mapa do atalho, você lista os passos de uma tarefa e vê o caminho longo e onde a IA corta caminho. Dá para baixar a imagem." },
    { alvo: "#acorde", texto: "O processo tem quatro passos. Você sabe o prazo e o valor antes de começar." },
    { alvo: ".setores", texto: "Escolha o seu setor para ver exemplos e conversar com a gente sobre ele." },
    { alvo: ".enter", texto: "Quando quiser conversar, é só apertar esta tecla. Ou clique em mim para tirar dúvidas." },
  ];
  let passo = -1;
  let emTour = false;
  let destacado = null;

  function limparDestaque() {
    if (destacado) destacado.classList.remove("tec-destaque");
    destacado = null;
  }

  async function irParaPasso(i) {
    passo = i;
    calar();
    limparDestaque();
    const p = PASSOS[i];
    const el = document.querySelector(p.alvo);
    if (!el) { proximo(); return; }
    // rola só a página (scrollIntoView também rolaria por dentro de seções com overflow)
    const caixa = el.getBoundingClientRect();
    const topo = window.scrollY + caixa.top - Math.max(90, (window.innerHeight - caixa.height) / 2);
    window.scrollTo({ top: Math.max(0, topo), behavior: calmo ? "auto" : "smooth" });
    await new Promise((ok) => setTimeout(ok, calmo ? 50 : 750));
    if (!emTour || passo !== i) return;
    destacado = el;
    el.classList.add("tec-destaque");
    const r = el.getBoundingClientRect();
    // anda até ficar embaixo do começo do elemento destacado
    await andarAte(r.left + Math.min(r.width * 0.15, 120));
    if (!emTour || passo !== i) return;
    acenar();
    const ultimo = i === PASSOS.length - 1;
    falar((i + 1) + "/" + PASSOS.length + " · " + p.texto, [
      [ultimo ? "Concluir" : "Próximo", ultimo ? concluirTour : proximo, true],
      ["Sair", sairTour],
    ]);
  }
  function proximo() { if (passo < PASSOS.length - 1) irParaPasso(passo + 1); else concluirTour(); }

  function iniciarTour() {
    fecharChat();
    emTour = true;
    raiz.classList.add("em-tour");
    guardar("tec-visto", "1");
    irParaPasso(0);
  }
  async function encerrar() {
    emTour = false;
    raiz.classList.remove("em-tour");
    limparDestaque();
    calar();
    await andarAte(MARGEM);
  }
  async function sairTour() { await encerrar(); falarRapido("Tudo bem! Quando precisar, é só clicar em mim."); }
  async function concluirTour() {
    await encerrar();
    feliz();
    falarRapido("Tour concluído! Clique em mim se tiver alguma dúvida.");
  }
  let timerRapido = 0;
  function falarRapido(texto) {
    clearTimeout(timerRapido);
    falar(texto, []);
    timerRapido = setTimeout(calar, 4500);
  }

  /* ---------- Assistente: usa o cérebro (tec-cerebro.js) ---------- */
  const MSG_PADRAO = "Olá! Vim pelo site da Atalho IA e quero conversar.";

  /* ---------- Comandos: o Tec faz coisas no site (v3) ----------
     O cérebro (tec-cerebro.js) devolve { executar: { tipo, ... } } quando a
     pessoa pede algo ("me mostra a calculadora", "calcula 2 h com 3 pessoas",
     "abre o mapa de uma clínica"...). Aqui o Tec rola até lá, mexe na página
     e vai junto, pulando em cima do que mostrou. */
  const aguardar = (ms) => new Promise((ok) => setTimeout(ok, ms));
  function rolarAte(el, folga = 90) {
    const topo = window.scrollY + el.getBoundingClientRect().top - folga;
    window.scrollTo({ top: Math.max(0, topo), behavior: calmo ? "auto" : "smooth" });
    return aguardar(calmo ? 60 : 950);
  }
  function destacar(el, ms = 2800) {
    el.classList.add("tec-destaque");
    setTimeout(() => el.classList.remove("tec-destaque"), ms);
  }
  async function irJunto(el, texto) {
    if (!el) return;
    if (!calmo) {
      const r = el.getBoundingClientRect();
      if (r.top > 190 && r.top < window.innerHeight - 120 && r.width >= larg + 10) {
        pularPara(el, r.left + Math.min(r.width * 0.2, 140) + larg / 2);
        await aguardar(900);
      } else await andarAte(Math.max(MARGEM, r.left + 10));
    }
    if (texto) falarRapido(texto);
  }
  async function mostrarNoSite(alvo, poleiro, nome) {
    fecharChat();
    if (alvo === "#topo") {
      window.scrollTo({ top: 0, behavior: calmo ? "auto" : "smooth" });
      await aguardar(calmo ? 60 : 1000);
      feliz();
      falarRapido("Topo! Rápido assim é que é atalho.");
      return;
    }
    const sec = document.querySelector(alvo);
    if (!sec) return;
    await rolarAte(sec);
    const el = (poleiro && (sec.querySelector(poleiro) || document.querySelector(poleiro))) || sec.querySelector("h2") || sec;
    destacar(el);
    await irJunto(el, nome ? "Chegamos: " + nome + "." : "");
  }
  function ajustarControle(id, valor) {
    const el = document.getElementById(id);
    if (!el || valor == null) return;
    const min = Number(el.min), max = Number(el.max), passo = Number(el.step) || 1;
    el.value = String(Math.max(min, Math.min(max, Math.round(valor / passo) * passo)));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  async function preencherCalculadora(a) {
    fecharChat();
    const sec = document.querySelector("#calculadora");
    if (!sec) return;
    await rolarAte(sec, 70);
    if (a.tarefa) { const chip = sec.querySelector('.calc__chip[data-tarefa="' + a.tarefa + '"]'); if (chip) chip.click(); }
    ajustarControle("calc-min", a.minutos);
    ajustarControle("calc-pes", a.pessoas);
    const res = sec.querySelector(".calc__resultado");
    if (res) { destacar(res, 3400); await irJunto(res, "Olha o resultado aqui, embaixo do Tec."); }
  }
  async function montarMapa(a) {
    fecharChat();
    const sec = document.querySelector("#mapa");
    if (!sec) return;
    await rolarAte(sec, 70);
    const chip = sec.querySelector('[data-exemplo="' + a.exemplo + '"]');
    if (chip) chip.click();
    await aguardar(450);
    const botao = document.getElementById("mapa-atalho");
    if (botao) botao.click();
    const quadro = sec.querySelector(".mapa__quadro");
    if (quadro) { destacar(quadro, 3400); await irJunto(quadro, "Atalho desenhado: os passos laranja a IA assume."); }
  }
  async function abrirDuvida(a) {
    fecharChat();
    const d = Array.from(document.querySelectorAll(".duvidas__lista details")).find((item) => item.querySelector("summary").textContent.includes(a.chave));
    if (!d) return mostrarNoSite("#duvidas", ".duvidas__lista details", "as dúvidas");
    await rolarAte(d, 160);
    if (!d.open) d.querySelector("summary").click();
    destacar(d, 3000);
    await aguardar(300);
    irJunto(d, "");
  }
  function fazerTec(o) {
    fecharChat();
    if (o === "pular") {
      const el = escolherPoleiro();
      if (el) pularPara(el); else pularPara(null, x + 140);
    } else if (o === "grudar") {
      if (fino && mouse.x > 0) grudar(FALAS.grudar[0]);
      else { pularPara(null, x + 120); falarRapido("No celular não tem cursor pra segurar. Fica o pulo."); }
    } else if (o === "sumir") {
      motor.sumido = true;
      descer().then(() => {
        raiz.classList.add("andando", "para-esquerda");
        colocar(-larg - 40, 0, 1.1);
        setTimeout(() => raiz.classList.remove("andando", "para-esquerda"), 1150);
      });
      // volta sozinho depois de um tempo, se ninguém rolar a página antes
      setTimeout(() => { if (motor.sumido) { motor.sumido = false; andarAte(MARGEM).then(() => falarRapido("Voltou! Sentiu falta, né?")); } }, 40000);
    }
  }
  function executar(acao) {
    if (!acao) return;
    if (acao.tipo === "whats") abrirWhats(acao.mensagem || MSG_PADRAO);
    else if (acao.tipo === "tour") iniciarTour();
    else if (acao.tipo === "secao" || acao.tipo === "mostrar") mostrarNoSite(acao.alvo, acao.poleiro, acao.nome);
    else if (acao.tipo === "calc") preencherCalculadora(acao);
    else if (acao.tipo === "mapa") montarMapa(acao);
    else if (acao.tipo === "duvida") abrirDuvida(acao);
    else if (acao.tipo === "clicar") { const el = document.querySelector(acao.alvo); if (el) { fecharChat(); el.click(); } }
    else if (acao.tipo === "tec") fazerTec(acao.acao);
  }

  // reserva caso o cérebro não carregue
  function responderSimples(pergunta) {
    return {
      texto: "Essa é melhor responder numa conversa com a nossa equipe. Quer enviar a sua pergunta pelo WhatsApp?",
      acoes: [{ tipo: "whats", rotulo: "Enviar pelo WhatsApp", mensagem: "Olá! Vim pelo site da Atalho IA e tenho uma pergunta: " + pergunta }],
      sugestoes: [],
    };
  }
  function responder(pergunta) {
    try {
      return window.TecCerebro ? window.TecCerebro.responder(pergunta) : responderSimples(pergunta);
    } catch (e) {
      return responderSimples(pergunta);
    }
  }

  function adicionarMsg(tipo, texto, acoes) {
    const m = document.createElement("div");
    m.className = "tec-msg tec-msg--" + tipo;
    texto.split("\n\n").forEach((par, i) => {
      if (i) m.appendChild(document.createElement("br"));
      if (i) m.appendChild(document.createElement("br"));
      m.appendChild(document.createTextNode(par));
    });
    if (acoes && acoes.length) {
      const caixa = document.createElement("div");
      caixa.className = "tec-msg__acoes";
      acoes.forEach((a, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "tec__btn" + (i === 0 ? " tec__btn--principal" : "");
        b.textContent = a.rotulo;
        b.addEventListener("click", () => executar(a));
        caixa.appendChild(b);
      });
      m.appendChild(caixa);
    }
    msgs.appendChild(m);
    msgs.scrollTop = msgs.scrollHeight;
  }

  // sugestões abaixo da conversa mudam conforme o assunto
  const SUGESTOES_INICIAIS = ["Me mostra a calculadora", "O que vocês fazem?", "Quanto custa?", "Fazer um tour pelo site", "Falar no WhatsApp"];
  function mostrarSugestoes(lista) {
    atalhos.innerHTML = "";
    (lista && lista.length ? lista : SUGESTOES_INICIAIS).slice(0, 4).forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tec-chip";
      b.textContent = s;
      b.addEventListener("click", () => {
        if (/^fazer um tour/i.test(s)) { iniciarTour(); return; }
        perguntar(s);
      });
      atalhos.appendChild(b);
    });
  }

  function digitarResposta(pergunta) {
    const d = document.createElement("div");
    d.className = "tec-msg tec-msg--tec tec-msg--digitando";
    d.innerHTML = "<i></i><i></i><i></i>";
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    raiz.classList.add("pensando");
    const r = responder(pergunta);
    // respostas mais longas "pensam" um pouco mais
    const espera = calmo ? 0 : Math.min(1400, 450 + r.texto.length * 4);
    setTimeout(() => {
      d.remove();
      raiz.classList.remove("pensando");
      adicionarMsg("tec", r.texto, r.acoes);
      mostrarSugestoes(r.sugestoes);
      if (r.naoEntendeu) piscar(); else if (!r.executar) feliz();
      if (r.executar) setTimeout(() => executar(r.executar), 1100);
    }, espera);
  }

  function perguntar(texto) {
    adicionarMsg("voce", texto);
    digitarResposta(texto);
  }

  mostrarSugestoes();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = campo.value.trim();
    if (!q) return;
    campo.value = "";
    perguntar(q);
  });

  let chatIniciado = false;
  function abrirChat() {
    if (emTour) encerrar();
    calar();
    // o chat abre a partir do canto esquerdo; se o Tec está longe (ou lá em cima), ele volta
    if (x > MARGEM + 4 || y > 0) andarAte(MARGEM);
    chat.hidden = false;
    boneco.setAttribute("aria-expanded", "true");
    raiz.classList.add("chat-aberto");
    if (!chatIniciado) {
      chatIniciado = true;
      adicionarMsg("tec", "Oi! Aqui é o Tec, assistente da Atalho IA. Pergunte do seu jeito sobre serviços, preço, prazo ou o seu setor.\n\nDica: conte quanto tempo uma tarefa leva, como \"2 horas por dia, 3 pessoas\", e o Tec faz a conta do mês.\n\nE dá pra pedir coisas: \"me mostra o projeto\", \"calcula 1 hora por dia com 3 pessoas\", \"abre o mapa de uma loja\" ou \"volta pro topo\".");
    }
    acenar();
    setTimeout(() => campo.focus({ preventScroll: true }), 50);
  }
  function fecharChat() {
    if (chat.hidden) return;
    chat.hidden = true;
    boneco.setAttribute("aria-expanded", "false");
    raiz.classList.remove("chat-aberto");
  }
  boneco.addEventListener("click", () => (chat.hidden ? abrirChat() : fecharChat()));
  $(".tec-chat__fechar", raiz).addEventListener("click", () => { fecharChat(); boneco.focus(); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!chat.hidden) { fecharChat(); boneco.focus(); }
    else if (emTour) sairTour();
  });
  boneco.addEventListener("pointerenter", () => { if (!emTour) acenar(); });

  /* ---------- Entrada na primeira visita ---------- */
  function apresentar() {
    falar("Oi! Aqui é o Tec, assistente da Atalho IA. Que tal um tour rápido pelo site? Leva 30 segundos.", [
      ["Mostrar o site", iniciarTour, true],
      ["Agora não", () => { guardar("tec-visto", "1"); calar(); }],
    ]);
    setTimeout(() => {
      if (!balao.hidden && acoes.children.length > 0 && fala.textContent.startsWith("Oi! Aqui é o Tec")) {
        guardar("tec-visto", "1");
        calar();
        falarRapido("Fica pra depois, então. O tour está guardado: é só clicar no Tec.");
      }
    }, 9000);
  }
  if (ler("tec-visto")) {
    raiz.classList.add("pronto");
  } else {
    colocar(-140, 0);
    raiz.classList.add("pronto");
    const entrar = () => setTimeout(async () => {
      // se a pessoa já começou a rolar, o Tec já entrou correndo: sem convite
      if (!chat.hidden || emTour || window.tecRolou) return;
      await andarAte(MARGEM);
      if (window.tecRolou) return;
      acenar();
      apresentar();
    }, calmo ? 600 : 4400); // (v3) espera a cena do topo terminar antes de entrar
    // com a abertura, conta o tempo a partir de quando ela sai
    let entrou = false;
    const entrarUmaVez = () => { if (!entrou) { entrou = true; entrar(); } };
    if (document.documentElement.classList.contains("com-intro") && !window.atalhoIntroFim) {
      document.addEventListener("atalho:intro-fim", entrarUmaVez, { once: true });
      setTimeout(entrarUmaVez, 6000);
    } else entrarUmaVez();
  }

  /* ==========================================================
     Tec livre (v3)
     - Rolagem: corre na direção da rolagem e atravessa a tela (sai por um
       lado, entra pelo outro). 3 jeitos de descer e 3 de subir.
     - Sozinho: pula em cima de títulos, cartões, teclas e botões; quando a
       página rola, vai de carona no elemento e cai quando ele sai da tela.
     - Cursor: às vezes (ou se o mouse ficar parado em cima dele) gruda no
       cursor e vai pendurado, balançando. Clique ou rolagem fazem ele soltar.
     - Duplo clique (ou toque, no celular) num espaço vazio: ele pula até lá.
     - Muito tempo sem mexer: dorme. Qualquer movimento acorda.
     Voz de empresa: o Tec nunca diz "eu".
     ========================================================== */
  const MODOS = { 1: ["corre", "patina", "pula"], [-1]: ["de-re", "escala", "arrasta"] };
  const FALAS = {
    descida: [
      "Descendo no braço? Tem gente que automatiza até isso.",
      "Você rola, o Tec corre. Divisão de tarefas bem justa.",
      "Calma, as coisas boas não vão fugir.",
      "Rolar a página: o caminho longo em sua forma mais pura.",
      "Isso, desce. Lá embaixo tem uma tecla Enter esperando por você.",
      "Corrida patrocinada pelo seu dedo. Obrigado, viu?",
    ],
    rapida: [
      "Opa, leu tudo isso em dois segundos? Impressionante.",
      "Devagar! O Tec ainda não tem turbo.",
      "Rolou tão rápido que até a IA ficou com inveja.",
    ],
    subida: [
      "Esqueceu alguma coisa lá em cima?",
      "Voltando? Alguma coisa chamou a atenção, né?",
      "Ida e volta, ida e volta… isso tem cara de tarefa repetitiva.",
      "Subir é sempre mais puxado. Pra você não, só mexe o dedo.",
    ],
    teclado: ["Dica de quem sobe muito: a tecla 0 leva direto ao topo."],
    modo: {
      patina: "Ladeira abaixo de patinete. Sem freio, mas com estilo.",
      pula: "Pulando as partes chatas? Aqui não tem nenhuma, mas tudo bem.",
      "de-re": "Subindo de ré, que é pra não perder a pose.",
      escala: "Escalando a página. Lá de cima a vista é melhor.",
      arrasta: "Subindo… devagar… sem pressa nenhuma…",
    },
    fim: [
      "Fim da página. A tecla Enter está bem aí, olhando pra você.",
      "Chegou ao fim. O próximo passo é sem enrolação: Enter.",
    ],
    topo: [
      "De volta ao começo. O caminho mais curto continua aqui.",
      "Topo de novo. Se quiser um tour guiado, é só clicar no Tec.",
    ],
    grudar: [
      "Peguei o cursor! Agora o Tec vai junto.",
      "Carona no cursor. Economia de perna.",
      "Pra onde a gente vai? O Tec só segura.",
    ],
    grudarParado: ["Ficou parado em cima do Tec? Então agora ele vai junto."],
    soltar: [
      "Cansou. O Tec volta pro chão.",
      "Chega de passeio. O cursor é todo seu de novo.",
      "Pendurado cansa. Até já.",
    ],
    soltarClique: ["Tá bom, tá bom, o Tec solta.", "Clicou, soltou. Combinado."],
    soltarRolagem: ["Opa! A página fugiu.", "Segura que lá vem rolagem… ou não."],
    caiu: ["Opa! Ninguém viu isso.", "Caiu, levantou. Faz parte.", "Aterrissagem nota 7. Dá pra melhorar."],
    carona: ["Carona no elemento. Segura!", "Esse aqui anda sozinho? Que beleza."],
    chamar: ["Chamou? O Tec chegou.", "Pronto, apareceu. Precisava de algo?"],
    acordar: ["Acordado! Só estava economizando bateria.", "Ninguém viu o Tec cochilando, combinado?"],
    passarPor: {
      wa: "Clica! É ali que a conversa começa.",
      campo: "Escreve aí, o Tec não espia.",
      calc: "Mexe nesse controle e vê o tamanho do caminho longo.",
    },
  };
  // falas de quando ele pousa em cada tipo de elemento
  const POLEIROS = [
    [".enter", ["Essa tecla aqui resolve tudo. Só apertar.", "Pisando na tecla mais importante do site."]],
    [".calc__resultado", ["Esses números assustam, né?", "Quanto tempo, hein? Daqui de cima dá pra ver."]],
    [".mapa__quadro", ["Daqui dá pra ver o atalho inteiro."]],
    [".tecla", ["Pisando na tecla certa.", "Tecla testada e aprovada."]],
    [".janela", ["Esse site aqui ficou bonito, hein?"]],
    [".cartao", ["Vista privilegiada daqui de cima.", "Esse cartão aguenta o peso do Tec? Aguenta."]],
    [".setores__link", ["Achou o seu setor? O Tec espera."]],
    ["details", ["Dúvida? O Tec também tinha. Abre aí."]],
    ["h2", ["Sentado no título, que é pra ser notado.", "Daqui de cima o título parece até maior."]],
    [".projeto__link", ["Clica aí que o site está no ar de verdade."]],
  ];
  const SELETOR_POLEIRO = POLEIROS.map((p) => p[0]).join(",");
  const filas = {};
  function proxima(chave, lista) {
    if (!filas[chave] || !filas[chave].length) filas[chave] = lista.slice().sort(() => Math.random() - 0.5);
    return filas[chave].pop();
  }
  let ultimaFala = 0;
  function podeFalar(intervalo) { return Date.now() - ultimaFala > intervalo; }
  function comentar(texto, intervalo = 0) {
    if (!texto || !podeFalar(intervalo) || emTour || !chat.hidden) return;
    if (!balao.hidden && acoes.children.length > 0) return; // não atropela o convite do tour
    ultimaFala = Date.now();
    falarRapido(texto);
  }

  /* ---------- Motor: pulos, carona, queda, grude ---------- */
  const motor = { modo: "chao", el: null, dx: 0, pulo: null, vy: 0, rodando: false, antes: 0, aoChao: [], fimGrude: 0, passou: {} };
  const mouse = { x: -999, y: -999, visto: 0 };
  let ultimaRolagem = 0;
  const balaoComConvite = () => !balao.hidden && acoes.children.length > 0;
  const ocupado = () => emTour || !chat.hidden || balaoComConvite();

  function ligarMotor() {
    if (motor.rodando || calmo) return;
    motor.rodando = true;
    motor.antes = performance.now();
    requestAnimationFrame(passoMotor);
  }
  function passoMotor(agora) {
    const dt = Math.min(0.05, Math.max(0.001, (agora - motor.antes) / 1000));
    motor.antes = agora;
    let continuar = false;
    if (motor.modo === "pulando") {
      const p = motor.pulo;
      p.t = Math.min(1, p.t + dt / p.dur);
      // se o alvo é um elemento, acompanha ele (a página pode ter rolado no meio do pulo)
      if (p.el) { const r = p.el.getBoundingClientRect(); p.y1 = chaoY() - r.top; p.x1 = r.left + p.dx; }
      const t = p.t;
      const px = p.x0 + (p.x1 - p.x0) * t;
      const py = p.y0 + (p.y1 - p.y0) * t + p.h * 4 * t * (1 - t);
      colocar(px, py);
      if (t >= 1) pousar(); else continuar = true;
    } else if (motor.modo === "empoleirado") {
      const el = motor.el;
      const r = el.isConnected ? el.getBoundingClientRect() : null;
      if (!r || r.top < 170 || r.top > window.innerHeight - 40 || r.width < larg * 0.6) { cair(true); continuar = true; }
      else {
        const nx = Math.max(r.left, Math.min(r.right - larg, r.left + motor.dx));
        colocar(nx, chaoY() - r.top);
        continuar = performance.now() - ultimaRolagem < 350; // só gasta quadro enquanto a página rola
      }
    } else if (motor.modo === "caindo") {
      motor.vy -= 2800 * dt;
      let ny = y + motor.vy * dt;
      if (ny <= 0) {
        ny = 0;
        if (motor.vy < -420) { motor.vy = -motor.vy * 0.3; quicar(); continuar = true; colocar(x, 0); }
        else { colocar(x, 0); chegouNoChao(); }
      } else { colocar(x, ny); continuar = true; }
    } else if (motor.modo === "grudado") {
      // pendurado logo abaixo do cursor, com mola e balanço
      const alvoX = mouse.x - larg / 2;
      const alvoY = Math.max(0, chaoY() - (mouse.y + 4) - alt);
      const vx = (alvoX - x) * 0.2;
      colocar(x + vx, y + (alvoY - y) * 0.2);
      svgBoneco.style.rotate = Math.max(-28, Math.min(28, -vx * 1.4)).toFixed(1) + "deg";
      if (performance.now() > motor.fimGrude) soltar(proxima("soltar", FALAS.soltar));
      continuar = motor.modo === "grudado" || motor.modo === "caindo";
    }
    if (!balao.hidden && (motor.modo !== "empoleirado" || continuar)) encaixarBalao();
    if (continuar) requestAnimationFrame(passoMotor);
    else motor.rodando = false;
  }

  function quicar() {
    raiz.classList.remove("quique");
    void raiz.offsetWidth; // reinicia a animação
    raiz.classList.add("quique");
    setTimeout(() => raiz.classList.remove("quique"), 360);
  }
  function chegouNoChao() {
    motor.modo = "chao";
    motor.el = null;
    raiz.classList.remove("no-ar", "para-esquerda");
    quicar();
    const fila = motor.aoChao.splice(0);
    fila.forEach((f) => f());
  }
  function descer() {
    if (motor.modo === "grudado") { raiz.classList.remove("grudado"); svgBoneco.style.rotate = ""; }
    if (y <= 0 && motor.modo !== "pulando") { motor.modo = "chao"; return Promise.resolve(); }
    return new Promise((ok) => { motor.aoChao.push(ok); if (motor.modo !== "caindo") cair(false); });
  }
  function cair(comFala) {
    if (motor.modo === "grudado") { raiz.classList.remove("grudado"); svgBoneco.style.rotate = ""; }
    motor.modo = "caindo";
    motor.el = null;
    motor.vy = 0;
    raiz.classList.add("no-ar");
    if (comFala && Math.random() < 0.5) comentar(proxima("caiu", FALAS.caiu), 5000);
    ligarMotor();
  }

  // pulo em arco até um elemento (ou até um ponto do chão, se el for nulo)
  function pularPara(el, xDesejado) {
    if (calmo) return;
    let x1, y1 = 0, dx = 0;
    if (el) {
      const r = el.getBoundingClientRect();
      const livre = Math.max(0, r.width - larg);
      x1 = xDesejado != null ? Math.max(r.left, Math.min(r.right - larg, xDesejado - larg / 2)) : r.left + Math.random() * livre;
      y1 = chaoY() - r.top;
      dx = x1 - r.left;
    } else {
      x1 = Math.max(MARGEM, Math.min(window.innerWidth - larg - MARGEM, xDesejado != null ? xDesejado : x));
    }
    if (motor.modo === "grudado") { raiz.classList.remove("grudado"); svgBoneco.style.rotate = ""; }
    const dist = Math.hypot(x1 - x, y1 - y);
    motor.pulo = { x0: x, y0: y, x1, y1, dx, el, t: 0, h: Math.min(200, 50 + dist * 0.25), dur: Math.min(0.95, 0.4 + dist / 1800) };
    motor.modo = "pulando";
    raiz.classList.add("no-ar");
    raiz.classList.toggle("para-esquerda", x1 < x);
    ligarMotor();
  }
  function pousar() {
    const p = motor.pulo;
    raiz.classList.remove("no-ar", "para-esquerda");
    quicar();
    if (p.el && p.el.isConnected) {
      motor.modo = "empoleirado";
      motor.el = p.el;
      motor.dx = p.dx;
      motor.anunciouCarona = false;
      // o elemento pode mudar de lugar sem rolagem (calculadora, dúvida abrindo...): confere 3x por segundo
      clearInterval(motor.vigia);
      motor.vigia = setInterval(() => { if (motor.modo === "empoleirado") ligarMotor(); else clearInterval(motor.vigia); }, 330);
      const tipo = POLEIROS.find(([s]) => p.el.matches(s));
      if (tipo && Math.random() < 0.65) comentar(proxima("poleiro" + tipo[0], tipo[1]), 5000);
    } else {
      motor.modo = "chao";
      colocar(x, 0);
      const fila = motor.aoChao.splice(0);
      fila.forEach((f) => f());
    }
  }

  // escolhe um lugar visível para pousar (com espaço acima para o balão)
  function escolherPoleiro() {
    const vh = window.innerHeight, vw = window.innerWidth;
    const candidatos = Array.from(document.querySelectorAll(SELETOR_POLEIRO)).filter((el) => {
      if (el.closest(".tec, .cmdk, [hidden]")) return false;
      const r = el.getBoundingClientRect();
      return r.top > 190 && r.top < vh - 130 && r.width >= larg + 10 && r.left >= 0 && r.right <= vw && el !== motor.el;
    });
    return candidatos.length ? candidatos[Math.floor(Math.random() * candidatos.length)] : null;
  }

  /* ---------- Grudar no cursor ---------- */
  function grudar(texto) {
    if (!fino || calmo || mouse.x < 0) return;
    motor.modo = "grudado";
    motor.el = null;
    motor.fimGrude = performance.now() + 7000 + Math.random() * 4000;
    motor.passou = {};
    raiz.classList.remove("no-ar", "para-esquerda", "dormindo");
    raiz.classList.add("grudado");
    feliz();
    comentar(texto || proxima("grudar", FALAS.grudar));
    ligarMotor();
  }
  function soltar(texto) {
    if (motor.modo !== "grudado") return;
    raiz.classList.remove("grudado");
    svgBoneco.style.rotate = "";
    if (texto) comentar(texto);
    cair(false);
  }

  if (!calmo) {
    /* ---------- Mouse: grude, olhar e comentários de passagem ---------- */
    let ultimoOlhar = 0;
    document.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.visto = Date.now();
      atividade();
      if (motor.modo === "grudado") {
        ligarMotor();
        // comenta o que está embaixo do cursor (de vez em quando, sem medir nada)
        const agora = Date.now();
        if (agora - ultimoOlhar > 500 && e.target instanceof Element) {
          ultimoOlhar = agora;
          const t = e.target;
          const tipo = t.closest("[data-wa], .enter, .wa") ? "wa" : t.closest("#pedido, #tec-pergunta") ? "campo" : t.closest(".calc__controle, input[type='range']") ? "calc" : "";
          if (tipo && !motor.passou[tipo]) { motor.passou[tipo] = true; comentar(FALAS.passarPor[tipo], 2500); }
        }
      }
    }, { passive: true });
    document.addEventListener("pointerleave", () => { mouse.x = -999; if (motor.modo === "grudado") soltar(); });
    // qualquer clique faz ele soltar o cursor
    document.addEventListener("pointerdown", () => { if (motor.modo === "grudado") soltar(proxima("soltarClique", FALAS.soltarClique)); }, true);

    // mouse parado em cima do Tec por um tempinho: ele agarra o cursor
    let timerGrude = 0;
    boneco.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      clearTimeout(timerGrude);
      timerGrude = setTimeout(() => { if (!ocupado() && motor.modo !== "grudado") grudar(FALAS.grudarParado[0]); }, 1600);
    });
    boneco.addEventListener("pointerleave", () => clearTimeout(timerGrude));
    boneco.addEventListener("click", () => clearTimeout(timerGrude));

    /* ---------- Chamar o Tec: duplo clique (mouse) ou toque (celular) num espaço vazio ---------- */
    const INTERATIVO = "a, button, input, textarea, select, label, summary, [role], .tec, .cmdk, .paleta, .mapa, .calc";
    let ultimoChamado = 0;
    function chamar(e) {
      if (ocupado() || calmo) return;
      const alvo = e.target instanceof Element ? e.target : null;
      if (!alvo || alvo.closest(INTERATIVO)) return;
      if (Date.now() - ultimoChamado < 2500 || motor.modo === "pulando" || motor.modo === "caindo") return;
      ultimoChamado = Date.now();
      const poleiro = alvo.closest(SELETOR_POLEIRO);
      if (poleiro) {
        const r = poleiro.getBoundingClientRect();
        if (r.top > 190 && r.width >= larg + 10) { pularPara(poleiro, e.clientX); comentar(proxima("chamar", FALAS.chamar), 3000); return; }
      }
      pularPara(null, e.clientX - larg / 2);
      comentar(proxima("chamar", FALAS.chamar), 3000);
    }
    document.addEventListener("dblclick", (e) => { if (fino) chamar(e); });
    document.addEventListener("click", (e) => { if (!fino && e.pointerType !== "mouse") chamar(e); });

    /* ---------- Rolagem ---------- */
    let ultimaY = window.scrollY;
    let direcao = 0;
    let modo = "";
    const ultimoModo = { 1: "", [-1]: "" };
    let fimRolagem = 0;
    let falouNoTopo = true;
    let falouNoFim = false;
    let quadroRol = 0;
    let voltas = 0;
    let ultimoPulinho = 0;
    let alvoX = x;
    let timerPasso = 0;
    let alturaRolavel = 0;
    const medirRolagem = () => { alturaRolavel = document.documentElement.scrollHeight - window.innerHeight; };
    medirRolagem();
    window.addEventListener("resize", medirRolagem);
    if ("ResizeObserver" in window) new ResizeObserver(medirRolagem).observe(document.body);
    // o Tec atravessa a tela: cada pixel rolado vira um pedaço de corrida
    const RITMO = fino ? 0.55 : 0.45;

    function trocarModo(dir) {
      const opcoes = MODOS[dir].filter((m) => m !== ultimoModo[dir]);
      const novo = opcoes[Math.floor(Math.random() * opcoes.length)];
      ultimoModo[dir] = novo;
      raiz.classList.remove("rol-" + modo);
      modo = novo;
      raiz.classList.add("rolando", "rol-" + modo);
      raiz.classList.remove("freando");
      // no "de ré" ele olha para a direita enquanto vai para a esquerda
      raiz.classList.toggle("para-esquerda", dir < 0 && modo !== "de-re");
      svgBoneco.style.rotate = (modo === "de-re" ? 7 : dir * (modo === "patina" ? 12 : modo === "arrasta" ? 4 : 8)) + "deg";
    }

    async function parar() {
      if (!modo) return;
      raiz.classList.remove("rolando", "rol-" + modo, "para-esquerda");
      svgBoneco.style.rotate = "";
      const modoQueParou = modo;
      modo = "";
      direcao = 0;
      raiz.classList.add("freando");
      setTimeout(() => raiz.classList.remove("freando"), 500);
      if (motor.modo !== "chao") return;
      // se parou fora da tela ou em cima do botão do WhatsApp, volta para um lugar visível
      const dentro = Math.max(MARGEM, Math.min(window.innerWidth - larg - MARGEM - 80, x));
      if (Math.abs(dentro - x) > 2) await andarAte(dentro);
      if (ocupado()) return;
      const yPag = window.scrollY;
      if (yPag >= alturaRolavel - 4 && !falouNoFim) { falouNoFim = true; feliz(); comentar(proxima("fim", FALAS.fim), 3000); }
      else if (yPag < 40 && !falouNoTopo) { falouNoTopo = true; acenar(); comentar(proxima("topo", FALAS.topo), 3000); }
      else if (modoQueParou === "arrasta" || modoQueParou === "corre") { if (Math.random() < 0.5) piscar(); }
      else if (Math.random() < 0.35) acenar();
    }

    function aoRolar() {
      quadroRol = 0;
      const yPag = window.scrollY;
      if (emTour || !chat.hidden) { ultimaY = yPag; return; }
      if (Math.abs(yPag - ultimaY) < 1) return; // rolagem lenta (touchpad, zoom) acumula
      const dy = yPag - ultimaY;
      ultimaY = yPag;
      motor.sumido = false;
      ultimaRolagem = performance.now();
      atividade();
      // rolar a página responde o convite do tour com um "agora não"
      if (balaoComConvite()) { calar(); guardar("tec-visto", "1"); }
      window.tecRolou = true;
      if (yPag > 200) falouNoTopo = false;
      if (yPag < alturaRolavel - 200) falouNoFim = false;

      // pendurado no cursor: a rolagem derruba
      if (motor.modo === "grudado") { soltar(proxima("soltarRolagem", FALAS.soltarRolagem)); return; }
      // em cima de um elemento: vai de carona (o motor acompanha o elemento)
      if (motor.modo === "empoleirado") { clearInterval(motor.vigia); cair(true); return; }
      if (motor.modo !== "chao") return;

      const dir = dy > 0 ? 1 : -1;
      if (dir !== direcao) {
        direcao = dir;
        alvoX = x; // começa a corrida de onde ele está
        trocarModo(dir);
        if (Math.random() < 0.6) {
          let texto;
          if (Math.random() < 0.4) texto = FALAS.modo[modo];
          else if (dir > 0) texto = Math.abs(dy) > 90 ? proxima("rapida", FALAS.rapida) : proxima("descida", FALAS.descida);
          else texto = fino && Math.random() < 0.3 ? FALAS.teclado[0] : proxima("subida", FALAS.subida);
          comentar(texto, 7000);
        }
      } else if (dir > 0 && Math.abs(dy) > 160) {
        comentar(proxima("rapida", FALAS.rapida), 7000);
      }

      // corre na direção da rolagem; ao sair por um lado, entra pelo outro.
      // (v3) a posição muda em passos de 120 ms com transição: o compositor faz o resto, sem trabalho a cada quadro
      let novoX = alvoX + Math.max(-90, Math.min(90, dy * RITMO));
      let volta = false;
      if (novoX > window.innerWidth + 8) {
        novoX = -larg - 8; voltas++; volta = true;
        if (voltas % 3 === 0) comentar("Mais uma volta na tela. Isso conta como exercício?", 5000);
      } else if (novoX < -larg - 8) {
        novoX = window.innerWidth + 8; voltas++; volta = true;
      }
      alvoX = novoX;
      if (volta) { clearTimeout(timerPasso); timerPasso = 0; colocar(alvoX, 0, 0); }
      else if (!timerPasso) {
        timerPasso = setTimeout(() => {
          timerPasso = 0;
          if (motor.modo !== "chao") return;
          colocar(alvoX, 0, 0.13);
          encaixarBalao();
        }, 120);
      }

      // de vez em quando, um pulinho no meio da corrida
      const agora = Date.now();
      if ((modo === "corre" || modo === "patina") && agora - ultimoPulinho > 2600 && Math.random() < 0.04) {
        ultimoPulinho = agora;
        alvoX = novoX + dir * 110;
        pularPara(null, alvoX);
      }

      clearTimeout(fimRolagem);
      fimRolagem = setTimeout(parar, 260);
    }
    window.addEventListener("scroll", () => { if (!quadroRol) quadroRol = requestAnimationFrame(aoRolar); }, { passive: true });

    /* ---------- Sozinho: pula, gruda, passeia, dorme ---------- */
    let ultimaAtividade = Date.now();
    let dormindo = false;
    const zzz = document.createElement("span");
    zzz.className = "tec__zzz";
    zzz.setAttribute("aria-hidden", "true");
    zzz.innerHTML = "<i>z</i><i>z</i><i>z</i>";
    raiz.appendChild(zzz);
    function atividade() {
      ultimaAtividade = Date.now();
      if (dormindo) {
        dormindo = false;
        raiz.classList.remove("dormindo");
        setTimeout(() => { if (!ocupado()) { pularPara(null, x); comentar(proxima("acordar", FALAS.acordar), 2000); } }, 250);
      }
    }
    window.addEventListener("keydown", atividade);
    window.addEventListener("touchstart", atividade, { passive: true });

    function agendar() { setTimeout(acaoSozinho, 2500 + Math.random() * 3500); }
    function acaoSozinho() {
      agendar();
      if (document.hidden || ocupado() || modo || dormindo) return;
      if (!raiz.classList.contains("pronto") || motor.sumido) return;
      // primeira visita: espera o Tec entrar e o convite acontecer (ou a pessoa rolar)
      if (!ler("tec-visto") && !window.tecRolou) return;
      if (x < -40 || x > window.innerWidth) { andarAte(MARGEM); return; }
      if (motor.modo === "pulando" || motor.modo === "caindo" || motor.modo === "grudado") return;
      if (performance.now() - ultimaRolagem < 1200) return;
      const parado = Date.now() - ultimaAtividade;
      if (parado > 45000) {
        dormindo = true;
        if (motor.modo === "empoleirado") { /* dorme lá em cima mesmo */ }
        raiz.classList.add("dormindo");
        return;
      }
      const sorte = Math.random();
      const mouseRecente = fino && mouse.x > 0 && Date.now() - mouse.visto < 5000;
      if (mouseRecente && sorte < 0.22) { grudar(); return; }
      if (sorte < 0.72) {
        const el = escolherPoleiro();
        if (el) { pularPara(el); return; }
      }
      if (motor.modo === "empoleirado") { pularPara(null, x + (Math.random() - 0.5) * 260); return; }
      // passeio no chão: um pulinho de lado, ou anda até embaixo do cursor e olha
      if (mouseRecente && Math.random() < 0.5) { andarAte(mouse.x - larg / 2).then(() => { if (!ocupado()) acenar(); }); return; }
      pularPara(null, x + (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 160));
    }
    // começa a agir depois da entrada (e da abertura, se houver)
    setTimeout(acaoSozinho, 2600);
  }

  // usado pelos atalhos de teclado e pelo easter egg (interacoes.js)
  window.tec = {
    tour: iniciarTour,
    comemorar(texto) { feliz(); acenar(); falarRapido(texto); },
    pular() { const el = escolherPoleiro(); if (el) pularPara(el); },
    grudar() { grudar(); },
  };

  window.addEventListener("resize", () => {
    const max = window.innerWidth - larg - MARGEM;
    if (motor.modo === "empoleirado" || motor.modo === "grudado") { cair(false); return; }
    if (x > max) colocar(Math.max(MARGEM, max), 0);
  });
})();
