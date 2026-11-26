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
  const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
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

  /* ---------- Posição e caminhada ---------- */
  const MARGEM = 16;
  let x = MARGEM;
  function largura() { return boneco.getBoundingClientRect().width || 72; }
  function aplicarX(px) { raiz.style.setProperty("--x", px + "px"); }
  aplicarX(x);

  function andarAte(alvoX) {
    const max = window.innerWidth - largura() - MARGEM;
    const destino = Math.max(MARGEM, Math.min(max, alvoX));
    const dist = Math.abs(destino - x);
    return new Promise((ok) => {
      if (dist < 4 || calmo) {
        x = destino;
        raiz.style.setProperty("--dur", "0s");
        aplicarX(x);
        ok();
        return;
      }
      const dur = Math.min(2.6, Math.max(0.6, dist / 420));
      raiz.style.setProperty("--dur", dur + "s");
      raiz.classList.add("andando");
      raiz.classList.toggle("para-esquerda", destino < x);
      x = destino;
      aplicarX(x);
      setTimeout(() => { raiz.classList.remove("andando", "para-esquerda"); ok(); }, dur * 1000 + 60);
    });
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
    void raiz.offsetWidth;
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
        const r = boneco.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.42;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const d = Math.hypot(dx, dy) || 1;
        olhos.style.transform = "translate(" + ((dx / d) * 4).toFixed(2) + "px," + ((dy / d) * 3).toFixed(2) + "px)";
      });
    }, { passive: true });
  }

  /* ---------- Balão de fala ---------- */
  function falar(texto, botoes) {
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
    const r = boneco.getBoundingClientRect();
    raiz.classList.toggle("balao-esquerda", r.left > window.innerWidth / 2);
    balao.classList.remove("entra");
    void balao.offsetWidth;
    balao.classList.add("entra");
    encaixarBalao();
  }
  // mantém o balão sempre dentro da tela, mesmo se o Tec ainda estiver chegando
  function encaixarBalao() {
    balao.style.translate = "";
    if (balao.hidden) return;
    const b = balao.getBoundingClientRect();
    let dx = 0;
    if (b.left < 12) dx = 12 - b.left;
    else if (b.right > window.innerWidth - 12) dx = window.innerWidth - 12 - b.right;
    if (dx) balao.style.translate = dx.toFixed(0) + "px 0";
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

  function irParaSecao(alvo) {
    fecharChat();
    const el = document.querySelector(alvo);
    if (!el) return;
    const topo = window.scrollY + el.getBoundingClientRect().top - 90;
    window.scrollTo({ top: Math.max(0, topo), behavior: calmo ? "auto" : "smooth" });
  }
  function executar(acao) {
    if (!acao) return;
    if (acao.tipo === "whats") abrirWhats(acao.mensagem || MSG_PADRAO);
    else if (acao.tipo === "tour") iniciarTour();
    else if (acao.tipo === "secao") irParaSecao(acao.alvo);
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
  const SUGESTOES_INICIAIS = ["O que vocês fazem?", "Quanto custa?", "Quanto tempo leva?", "Fazer um tour pelo site", "Falar no WhatsApp"];
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
      if (r.executar) setTimeout(() => executar(r.executar), 400);
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
    chat.hidden = false;
    boneco.setAttribute("aria-expanded", "true");
    raiz.classList.add("chat-aberto");
    if (!chatIniciado) {
      chatIniciado = true;
      adicionarMsg("tec", "Oi! Aqui é o Tec, assistente da Atalho IA. Pergunte do seu jeito sobre serviços, preço, prazo ou o seu setor.\n\nDica: conte quanto tempo uma tarefa leva, como \"2 horas por dia, 3 pessoas\", e o Tec faz a conta do mês.");
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
  }
  if (ler("tec-visto")) {
    raiz.classList.add("pronto");
  } else {
    x = -140;
    raiz.style.setProperty("--dur", "0s");
    aplicarX(x);
    raiz.classList.add("pronto");
    setTimeout(async () => {
      if (!chat.hidden || emTour) return;
      await andarAte(MARGEM);
      acenar();
      apresentar();
    }, calmo ? 600 : 5200); // (v3) espera a cena do topo terminar antes de entrar
  }

  // usado pelos atalhos de teclado e pelo easter egg (interacoes.js)
  window.tec = {
    tour: iniciarTour,
    comemorar(texto) { feliz(); acenar(); falarRapido(texto); },
  };

  window.addEventListener("resize", () => {
    const max = window.innerWidth - largura() - MARGEM;
    if (x > max) { x = Math.max(MARGEM, max); raiz.style.setProperty("--dur", "0s"); aplicarX(x); }
  });
})();
