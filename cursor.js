/* ==========================================================
   Atalho IA · cursor neural
   - ponto laranja: a ponta do atalho, sempre exatamente no mouse
   - anel: segue com leve atraso; vira uma "tecla" com a seta ↗ sobre
     links e botões, e some em campos de texto (fica o cursor nativo)
   - rastro: o "caminho longo" pontilhado, cujos pontos se ligam
     como uma pequena rede neural e se apagam
   - clique: uma sinapse, com pontos que se espalham e se conectam
   Só roda com mouse de verdade e sem "reduzir movimento".
   ========================================================== */
(function () {
  const fino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fino || calmo) return;

  const raiz = document.documentElement;
  raiz.classList.add("cursor-ia");

  const tela = document.createElement("canvas");
  tela.className = "cursor-rede";
  tela.style.visibility = "hidden";
  tela.setAttribute("aria-hidden", "true");
  const anel = document.createElement("div");
  anel.className = "cursor-anel";
  anel.setAttribute("aria-hidden", "true");
  anel.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7 17 L17 7 M9.5 7 H17 V14.5"/></svg><span class="cursor-anel__txt"></span>';
  const ponto = document.createElement("div");
  ponto.className = "cursor-ponto";
  ponto.setAttribute("aria-hidden", "true");
  document.body.append(tela, anel, ponto);
  const rotulo = anel.querySelector(".cursor-anel__txt");

  const ctx = tela.getContext("2d");
  let dpr = 1;
  function dimensionar() {
    dpr = 1; // (v3) o rastro é suave: 1 px por pixel CSS basta e pesa até 4x menos
    tela.width = innerWidth * dpr;
    tela.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  dimensionar();
  window.addEventListener("resize", dimensionar);

  const mouse = { x: -100, y: -100, visivel: false };
  const anelPos = { x: -100, y: -100 };
  let nos = [];          // pontos do rastro
  let faiscas = [];      // partículas do clique
  let ultimo = null;
  let claro = false;     // sobre a faixa Areia
  let rodando = false;

  const LARANJA = "255, 106, 43";
  const NEVOA = "138, 151, 171";
  const TINTA = "15, 27, 45";

  const SELETOR_ACAO = "a, button, [role='tab'], [role='radio'], summary, label[for], .tecla, .enter, input[type='range']";
  const SELETOR_TEXTO = "input[type='text'], input:not([type]), textarea, [contenteditable='true']";

  function textoDoAlvo(el) {
    if (el.matches("[data-wa], .enter, .setores__link, #calc-cta")) return "WhatsApp";
    if (el.matches("input[type='range']")) return "↔";
    if (el.matches("summary")) return el.parentElement.open ? "fechar" : "abrir";
    return "";
  }

  document.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (!mouse.visivel) {
      mouse.visivel = true;
      anelPos.x = mouse.x;
      anelPos.y = mouse.y;
      raiz.classList.add("cursor-ia--ativo");
    }

    // novo nó do rastro a cada ~14px percorridos
    if (!ultimo || Math.hypot(mouse.x - ultimo.x, mouse.y - ultimo.y) > 14) {
      ultimo = { x: mouse.x, y: mouse.y, vida: 1 };
      nos.push(ultimo);
      if (nos.length > 34) nos.shift();
    }

    const alvo = e.target instanceof Element ? e.target : null;
    const emTexto = alvo && alvo.closest(SELETOR_TEXTO);
    const acao = !emTexto && alvo && alvo.closest(SELETOR_ACAO);
    raiz.classList.toggle("cursor-ia--texto", !!emTexto);
    raiz.classList.toggle("cursor-ia--acao", !!acao);
    const t = acao ? textoDoAlvo(acao) : "";
    if (rotulo.textContent !== t) rotulo.textContent = t;
    anel.classList.toggle("com-texto", !!t);

    claro = !!(alvo && alvo.closest(".secao--areia"));
    raiz.classList.toggle("cursor-ia--claro", claro);

    iniciar();
  }, { passive: true });

  document.addEventListener("pointerdown", () => {
    raiz.classList.add("cursor-ia--aperto");
    // sinapse: pontos saem em leque e voltam a se ligar ao centro
    for (let i = 0; i < 9; i++) {
      const ang = (Math.PI * 2 * i) / 9 + Math.random() * 0.5;
      const vel = 1.6 + Math.random() * 2.2;
      faiscas.push({ x: mouse.x, y: mouse.y, ox: mouse.x, oy: mouse.y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel, vida: 1 });
    }
    iniciar();
  });
  document.addEventListener("pointerup", () => raiz.classList.remove("cursor-ia--aperto"));
  document.addEventListener("pointerleave", () => { mouse.visivel = false; raiz.classList.remove("cursor-ia--ativo"); });
  window.addEventListener("blur", () => { mouse.visivel = false; raiz.classList.remove("cursor-ia--ativo"); });

  function iniciar() {
    if (rodando) return;
    rodando = true;
    tela.style.visibility = "visible";
    requestAnimationFrame(quadro);
  }

  function quadro() {
    // anel segue com atraso suave
    anelPos.x += (mouse.x - anelPos.x) * 0.2;
    anelPos.y += (mouse.y - anelPos.y) * 0.2;
    ponto.style.transform = "translate3d(" + mouse.x + "px," + mouse.y + "px,0)";
    anel.style.transform = "translate3d(" + anelPos.x + "px," + anelPos.y + "px,0)";

    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const corLinha = claro ? TINTA : NEVOA;

    // rastro: pontos pontilhados que envelhecem
    nos.forEach((n) => { n.vida -= 0.022; });
    nos = nos.filter((n) => n.vida > 0);

    // ligações entre nós próximos (a "rede")
    for (let i = 0; i < nos.length; i++) {
      for (let j = i + 1; j < nos.length; j++) {
        const a = nos[i], b = nos[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 70) {
          const alfa = Math.min(a.vida, b.vida) * (1 - d / 70) * 0.55;
          ctx.strokeStyle = "rgba(" + corLinha + "," + alfa.toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    // nós: os mais novos ganham o laranja do atalho
    nos.forEach((n, i) => {
      const novo = i > nos.length - 4;
      ctx.fillStyle = "rgba(" + (novo ? LARANJA : corLinha) + "," + (n.vida * (novo ? 0.9 : 0.7)).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(n.x, n.y, novo ? 2.2 : 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    // sinapse do clique
    faiscas.forEach((f) => {
      f.x += f.vx; f.y += f.vy;
      f.vx *= 0.9; f.vy *= 0.9;
      f.vida -= 0.03;
      ctx.strokeStyle = "rgba(" + LARANJA + "," + (f.vida * 0.6).toFixed(3) + ")";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(f.ox, f.oy);
      ctx.lineTo(f.x, f.y);
      ctx.stroke();
      ctx.fillStyle = "rgba(" + LARANJA + "," + f.vida.toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(f.x, f.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    faiscas = faiscas.filter((f) => f.vida > 0);

    const parado = Math.abs(mouse.x - anelPos.x) < 0.1 && Math.abs(mouse.y - anelPos.y) < 0.1;
    if (parado && !nos.length && !faiscas.length) {
      rodando = false;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      tela.style.visibility = "hidden"; // camada vazia não entra na composição da rolagem
      return;
    }
    requestAnimationFrame(quadro);
  }
})();
