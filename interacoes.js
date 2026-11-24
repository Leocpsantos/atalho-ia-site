/* ==========================================================
   Atalho IA · interações extras
   1. Atalhos de teclado do site (? mostra a lista)
   2. Prévia flutuante nos setores, que segue o cursor
   3. Faixa de texto que responde à velocidade da rolagem
   4. Topo com profundidade ao rolar
   5. Perguntas frequentes abrindo com animação
   6. Easter egg: digitar "atalho"
   ========================================================== */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const digitando = (el) => !!(el && el.closest && el.closest("input, textarea, select, [contenteditable='true']"));

  /* ---------- Aviso rápido (toast) ---------- */
  const aviso = document.createElement("div");
  aviso.className = "aviso";
  aviso.setAttribute("role", "status");
  aviso.setAttribute("aria-live", "polite");
  document.body.appendChild(aviso);
  let timerAviso = 0;
  function avisar(tecla, texto) {
    aviso.innerHTML = "";
    if (tecla) {
      const k = document.createElement("kbd");
      k.textContent = tecla;
      aviso.appendChild(k);
    }
    aviso.appendChild(document.createTextNode(texto));
    aviso.classList.add("visivel");
    clearTimeout(timerAviso);
    timerAviso = setTimeout(() => aviso.classList.remove("visivel"), 1800);
  }

  /* ==========================================================
     1. Atalhos de teclado
     ========================================================== */
  const irPara = (sel) => () => {
    const el = $(sel);
    if (!el) return;
    el.scrollIntoView({ behavior: calmo ? "auto" : "smooth", block: "start" });
    const t = $("h2[tabindex]", el);
    if (t) setTimeout(() => t.focus({ preventScroll: true }), calmo ? 0 : 600);
  };
  const ATALHOS = [
    { tecla: "1", nome: "Demonstrações", acao: irPara("#demos") },
    { tecla: "2", nome: "Calculadora", acao: irPara("#calculadora") },
    { tecla: "M", nome: "Mapa do atalho", acao: irPara("#mapa") },
    { tecla: "3", nome: "Como funciona", acao: irPara("#como") },
    { tecla: "4", nome: "Setores", acao: irPara("#setores") },
    { tecla: "5", nome: "Projeto entregue", acao: irPara("#projeto") },
    { tecla: "6", nome: "Dúvidas", acao: irPara("#duvidas") },
    { tecla: "0", nome: "Voltar ao topo", acao: () => window.scrollTo({ top: 0, behavior: calmo ? "auto" : "smooth" }) },
    { tecla: "/", nome: "Escrever o seu caso", acao: () => { window.scrollTo({ top: 0, behavior: calmo ? "auto" : "smooth" }); setTimeout(() => { const c = $("#pedido"); if (c) c.focus({ preventScroll: true }); }, calmo ? 0 : 500); } },
    // G de "guia" (letras de "atalho" ficam livres para o easter egg)
    { tecla: "G", nome: "Tour guiado com o Tec", acao: () => window.tec && window.tec.tour() },
    { tecla: "Ctrl K", nome: "Buscar no site", acao: null },
    { tecla: "?", nome: "Mostrar esta lista", acao: null },
  ];

  const painel = document.createElement("div");
  painel.className = "atalhos";
  painel.hidden = true;
  painel.innerHTML = `
    <div class="atalhos__fundo" data-fechar></div>
    <div class="atalhos__caixa" role="dialog" aria-modal="true" aria-labelledby="atalhos-titulo">
      <header class="atalhos__cab">
        <h2 id="atalhos-titulo">Atalhos do teclado</h2>
        <button type="button" class="atalhos__fechar" data-fechar aria-label="Fechar">×</button>
      </header>
      <p class="atalhos__sub">Um site de atalhos tinha que ter atalhos. Use as teclas para navegar.</p>
      <ul class="atalhos__lista"></ul>
    </div>`;
  document.body.appendChild(painel);
  const lista = $(".atalhos__lista", painel);
  ATALHOS.forEach((a) => {
    const li = document.createElement("li");
    const teclas = a.tecla.split(" ").map((t) => "<kbd>" + t + "</kbd>").join("");
    li.innerHTML = "<span></span><span class='atalhos__teclas'>" + teclas + "</span>";
    li.firstChild.textContent = a.nome;
    lista.appendChild(li);
  });

  let focoAntes = null;
  function abrirAtalhos() {
    focoAntes = document.activeElement;
    painel.hidden = false;
    $(".atalhos__fechar", painel).focus();
  }
  function fecharAtalhos() {
    if (painel.hidden) return;
    painel.hidden = true;
    if (focoAntes && focoAntes.focus) focoAntes.focus({ preventScroll: true });
  }
  $$("[data-fechar]", painel).forEach((b) => b.addEventListener("click", fecharAtalhos));
  $$("[data-abrir-atalhos]").forEach((b) => b.addEventListener("click", abrirAtalhos));

  // acende a tecla de "Como funciona" correspondente, como se fosse apertada
  function apertarTeclaVisual() {
    const teclas = $$("#acorde .tecla");
    teclas.forEach((t, i) => setTimeout(() => {
      t.classList.add("apertada");
      setTimeout(() => t.classList.remove("apertada"), 180);
    }, i * 90));
  }

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || e.isComposing) return;
    if (digitando(e.target)) return;
    const cmdk = $("#cmdk");
    if (cmdk && !cmdk.hidden) return;
    const tecla = e.key;

    if (tecla === "Escape") { fecharAtalhos(); return; }
    if (tecla === "?") { e.preventDefault(); painel.hidden ? abrirAtalhos() : fecharAtalhos(); return; }
    if (!painel.hidden) return;

    const a = ATALHOS.find((x) => x.acao && x.tecla.toLowerCase() === tecla.toLowerCase());
    if (!a) return;
    e.preventDefault();
    a.acao();
    avisar(a.tecla, a.nome);
    if (a.tecla === "3") apertarTeclaVisual();
  });

  /* ==========================================================
     2. Prévia flutuante nos setores
     ========================================================== */
  const PREVIAS = {
    "Jurídico": ["Abrir documento por documento e procurar prazos.", "Documentos separados e prazos avisados sozinhos."],
    "Contabilidade": ["Cobrar e organizar papéis de cada cliente à mão.", "Arquivos chegam classificados por cliente e mês."],
    "Agro e usinas": ["Planilha solta para cada máquina e cada safra.", "Um painel com revisões e números da safra."],
    "Comércio": ["Responder preço e estoque o dia inteiro.", "Atendimento no WhatsApp que responde na hora."],
    "Saúde": ["Ligar um por um para confirmar consultas.", "Confirmação e lembrete automáticos, menos faltas."],
    "Educação": ["Recados repetidos para cada família.", "Comunicação organizada e materiais no lugar."],
    "Marketing": ["Começar todo texto e relatório do zero.", "Rascunhos no tom da marca e relatórios prontos."],
    "Serviços": ["Agenda no papel e cliente que esquece.", "Agendamento online e lembrete na véspera."],
  };
  const setores = $(".setores");
  if (setores && fino && !calmo) {
    const card = document.createElement("div");
    card.className = "previa";
    card.setAttribute("aria-hidden", "true");
    card.innerHTML = `
      <p class="previa__eti mono">atalho típico</p>
      <p class="previa__titulo"></p>
      <div class="previa__linha previa__linha--antes"><span class="mono">antes</span><p></p></div>
      <div class="previa__linha previa__linha--depois"><span class="mono">atalho</span><p></p></div>`;
    document.body.appendChild(card);
    const tit = $(".previa__titulo", card);
    const antes = $(".previa__linha--antes p", card);
    const depois = $(".previa__linha--depois p", card);

    const alvo = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let ativo = false;
    let rodando = false;
    function loop() {
      const vx = alvo.x - pos.x;
      pos.x += vx * 0.16;
      pos.y += (alvo.y - pos.y) * 0.16;
      const giro = Math.max(-8, Math.min(8, vx * 0.08));
      card.style.transform = "translate3d(" + pos.x.toFixed(1) + "px," + pos.y.toFixed(1) + "px,0) rotate(" + giro.toFixed(2) + "deg)";
      if (ativo || Math.abs(vx) > 0.5) requestAnimationFrame(loop);
      else rodando = false;
    }
    $$(".setores__link", setores).forEach((link) => {
      const nome = $(".setores__nome", link).textContent.trim();
      const dados = PREVIAS[nome];
      if (!dados) return;
      link.addEventListener("pointerenter", (e) => {
        tit.textContent = nome;
        antes.textContent = dados[0];
        depois.textContent = dados[1];
        if (!ativo) { pos.x = e.clientX + 28; pos.y = e.clientY - 60; }
        ativo = true;
        card.classList.add("visivel");
        if (!rodando) { rodando = true; requestAnimationFrame(loop); }
      });
      link.addEventListener("pointermove", (e) => {
        // o cartão fica à direita do cursor, ou à esquerda perto da borda
        const largura = 300;
        const lado = e.clientX + largura + 48 > window.innerWidth ? -largura - 28 : 28;
        alvo.x = e.clientX + lado;
        alvo.y = e.clientY - 70;
      });
    });
    setores.addEventListener("pointerleave", () => { ativo = false; card.classList.remove("visivel"); });
    window.addEventListener("scroll", () => { if (ativo) { ativo = false; card.classList.remove("visivel"); } }, { passive: true });
  }

  /* ==========================================================
     3. Faixa que responde à velocidade da rolagem
     ========================================================== */
  const faixa = $(".faixa-vel");
  const trilho = $(".faixa-vel__trilho");
  if (faixa && trilho && !calmo) {
    let deslocamento = 0;
    let velocidade = 0;
    let ultimoY = window.scrollY;
    let direcao = 1;
    let visivel = false;
    let rodando = false;
    new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (visivel && !rodando) { rodando = true; requestAnimationFrame(passo); }
    }).observe(faixa);
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      const dy = y - ultimoY;
      ultimoY = y;
      if (dy !== 0) direcao = dy > 0 ? 1 : -1;
      velocidade += Math.max(-60, Math.min(60, dy)) * 0.12;
    }, { passive: true });
    function passo() {
      velocidade *= 0.9;
      deslocamento -= (0.6 * direcao) + velocidade;
      const metade = trilho.scrollWidth / 2;
      if (metade > 0) {
        if (deslocamento <= -metade) deslocamento += metade;
        if (deslocamento > 0) deslocamento -= metade;
      }
      const inclina = Math.max(-12, Math.min(12, velocidade * 0.8));
      trilho.style.transform = "translate3d(" + deslocamento.toFixed(1) + "px,0,0) skewX(" + (-inclina).toFixed(2) + "deg)";
      if (visivel && !document.hidden) requestAnimationFrame(passo);
      else rodando = false;
    }
  }

  /* ==========================================================
     4. Topo com profundidade ao rolar
     ========================================================== */
  const hero = $(".hero");
  const tituloHero = $(".hero__titulo");
  const feixe = $(".hero__feixe");
  if (hero && tituloHero && !calmo) {
    let quadro = 0;
    function profundidade() {
      quadro = 0;
      const h = hero.offsetHeight;
      const p = Math.min(1, Math.max(0, window.scrollY / h));
      tituloHero.style.translate = "0 " + (p * 90).toFixed(1) + "px";
      tituloHero.style.opacity = (1 - p * 0.9).toFixed(3);
      if (feixe) feixe.style.rotate = (-38 + p * 14).toFixed(2) + "deg";
    }
    window.addEventListener("scroll", () => { if (!quadro) quadro = requestAnimationFrame(profundidade); }, { passive: true });
  }

  /* ==========================================================
     5. Perguntas frequentes abrindo com animação
     ========================================================== */
  if (!calmo && "animate" in Element.prototype) {
    $$(".duvidas__lista details").forEach((d) => {
      const resumo = $("summary", d);
      const conteudo = $("p", d);
      let animacao = null;
      resumo.addEventListener("click", (e) => {
        e.preventDefault();
        if (animacao) animacao.cancel();
        if (d.open) {
          const h = conteudo.offsetHeight;
          animacao = conteudo.animate([{ height: h + "px", paddingBottom: "26px", opacity: 1 }, { height: "0px", paddingBottom: "0px", opacity: 0 }], { duration: 260, easing: "cubic-bezier(.4,0,.2,1)" });
          animacao.onfinish = () => { d.open = false; animacao = null; };
        } else {
          d.open = true;
          const h = conteudo.offsetHeight;
          animacao = conteudo.animate([{ height: "0px", paddingBottom: "0px", opacity: 0 }, { height: h + "px", paddingBottom: "26px", opacity: 1 }], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
          animacao.onfinish = () => { animacao = null; };
        }
      });
    });
  }

  /* ==========================================================
     6. Easter egg: digitar "atalho" em qualquer lugar da página
     ========================================================== */
  const SEGREDO = "atalho";
  let buffer = "";
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || digitando(e.target) || !e.key || e.key.length !== 1) return;
    buffer = (buffer + e.key.toLowerCase()).slice(-SEGREDO.length);
    if (buffer === SEGREDO) {
      buffer = "";
      chuvaDeTeclas();
      if (window.tec) window.tec.comemorar("Você achou o atalho secreto! A gente gosta de quem explora.");
      else avisar("↗", "Você achou o atalho secreto!");
    }
  });

  function chuvaDeTeclas() {
    if (calmo) return;
    const rotulos = ["↗", "A", "T", "L", "H", "O", "IA", "⌘", "↵", "Ctrl"];
    const camada = document.createElement("div");
    camada.className = "chuva";
    camada.setAttribute("aria-hidden", "true");
    document.body.appendChild(camada);
    const total = Math.min(46, Math.round(window.innerWidth / 30));
    for (let i = 0; i < total; i++) {
      const k = document.createElement("span");
      k.className = "chuva__tecla" + (i % 5 === 0 ? " chuva__tecla--laranja" : "");
      k.textContent = rotulos[i % rotulos.length];
      const x = Math.random() * window.innerWidth;
      const deriva = (Math.random() - 0.5) * 240;
      const giro = (Math.random() - 0.5) * 720;
      const dur = 1700 + Math.random() * 1300;
      k.style.left = x + "px";
      camada.appendChild(k);
      k.animate(
        [
          { transform: "translate(0,-60px) rotate(0deg)", opacity: 1 },
          { transform: "translate(" + deriva + "px," + (window.innerHeight + 80) + "px) rotate(" + giro + "deg)", opacity: 1 },
        ],
        { duration: dur, delay: Math.random() * 500, easing: "cubic-bezier(.3,.1,.6,1)", fill: "forwards" }
      );
    }
    setTimeout(() => camada.remove(), 3600);
  }
})();
