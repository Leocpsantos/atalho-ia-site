/* ==========================================================
   Palco do topo (site v3)
   O logo vira a cena: o "L" pontilhado é o caminho longo, com as
   tarefas manuais ao longo dele; a seta laranja corta na diagonal,
   do "seu problema" até "a solução".
   Uma única animação na entrada (e de novo ao clicar no palco).
   Sem JS, o h1 normal continua visível.
   ========================================================== */
(() => {
  const palco = document.getElementById("palco");
  const hero = document.querySelector(".hero");
  if (!palco || !hero) return;

  const NS = "http://www.w3.org/2000/svg";
  const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const estreitoMq = window.matchMedia("(max-width: 700px)");

  /* Coordenadas em unidades do viewBox. S = início (problema), K = canto do L, T = fim (solução). */
  const LAYOUTS = {
    largo: {
      vb: [0, -24, 1160, 560], S: [16, 468], K: [16, 40], T: [1000, 40],
      traco: 22, ponta: 92, raioInicio: 15,
      problema: { x: 66, y: 506, tam: 66 },
      solucao: { x: 1160, y: 196, tam: 66, ancora: "end" },
      curto: { tam: 50, dy: -28, offset: "53%" },
      longo: { x: 44, y: 14, tam: 15 },
      estacoes: [
        { p: [16, 372], txt: "abrir a planilha", tx: 44, ty: 378, ancora: "start" },
        { p: [16, 270], txt: "copiar e colar", tx: 44, ty: 276, ancora: "start" },
        { p: [16, 168], txt: "conferir", tx: 44, ty: 174, ancora: "start" },
        { p: [320, 40], txt: "responder um por um", tx: 320, ty: 80, ancora: "middle" },
        { p: [560, 40], txt: "corrigir", tx: 560, ty: 80, ancora: "middle" },
        { p: [760, 40], txt: "repetir amanhã", tx: 760, ty: 80, ancora: "middle" },
      ],
      rotuloEst: 16,
    },
    estreito: {
      vb: [0, -6, 360, 584], S: [16, 534], K: [16, 100], T: [318, 100],
      traco: 13, ponta: 54, raioInicio: 10,
      problema: { x: 40, y: 552, tam: 34 },
      solucao: { x: 352, y: 70, tam: 36, ancora: "end" },
      curto: { tam: 25, dy: -15, offset: "52%" },
      longo: { x: 16, y: 70, tam: 12.5 },
      estacoes: [
        { p: [16, 430] }, { p: [16, 330] }, { p: [16, 230] },
        { p: [92, 100], txt: "copiar", tx: 92, ty: 128, ancora: "middle" },
        { p: [172, 100], txt: "conferir", tx: 172, ty: 128, ancora: "middle" },
        { p: [248, 100], txt: "repetir", tx: 248, ty: 128, ancora: "middle" },
      ],
      rotuloEst: 12.5,
    },
  };

  const el = (nome, attrs = {}, pai) => {
    const n = document.createElementNS(NS, nome);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (pai) pai.appendChild(n);
    return n;
  };
  const texto = (pai, conteudo, attrs) => { const t = el("text", attrs, pai); t.textContent = conteudo; return t; };

  let atual = "";
  function desenhar() {
    const nome = estreitoMq.matches ? "estreito" : "largo";
    if (nome === atual) return;
    atual = nome;
    const L = LAYOUTS[nome];
    const [Sx, Sy] = L.S, [Kx, Ky] = L.K, [Tx, Ty] = L.T;
    const id = "palco-" + nome;

    palco.textContent = "";
    const svg = el("svg", { viewBox: L.vb.join(" "), class: "palco__svg", focusable: "false" }, palco);
    const defs = el("defs", {}, svg);

    // máscara que "desenha" o pontilhado do início até o fim
    const dLongo = `M${Sx} ${Sy} V${Ky} H${Tx}`;
    const mask = el("mask", { id: id + "-m", maskUnits: "userSpaceOnUse", x: L.vb[0] - 40, y: L.vb[1] - 40, width: L.vb[2] + 80, height: L.vb[3] + 80 }, defs);
    el("path", { d: dLongo, class: "p-revela", pathLength: 1 }, mask);
    // caminho da diagonal, para o texto acompanhar a seta
    el("path", { id: id + "-d", d: `M${Sx} ${Sy} L${Tx} ${Ty}` }, defs);

    // o caminho longo
    const gLongo = el("g", { class: "p-longo-g", mask: `url(#${id}-m)` }, svg);
    el("path", { d: dLongo, class: "p-longo", style: `stroke-width:${L.traco * 0.42}px;stroke-dasharray:0.1 ${L.traco * 1.15}px` }, gLongo);
    texto(svg, "o caminho longo", { x: L.longo.x, y: L.longo.y, class: "p-rot-longo", style: `font-size:${L.longo.tam}px` });

    // estações (tarefas manuais), aparecem quando o pontilhado chega nelas
    const total = (Sy - Ky) + (Tx - Kx);
    L.estacoes.forEach((e) => {
      const [x, y] = e.p;
      const dist = x === Kx ? Sy - y : (Sy - Ky) + (x - Kx);
      const g = el("g", { class: "p-est", style: `--d:${(0.25 + 1.3 * dist / total).toFixed(2)}s` }, svg);
      el("circle", { cx: x, cy: y, r: L.traco * 0.36 }, g);
      if (e.txt) texto(g, e.txt, { x: e.tx, y: e.ty, "text-anchor": e.ancora, style: `font-size:${L.rotuloEst}px` });
    });

    // o atalho: brilho, linha, ponta (chevron de 90°, como no logo)
    const ang = Math.atan2(Ty - Sy, Tx - Sx) * 180 / Math.PI;
    el("line", { x1: Sx, y1: Sy, x2: Tx, y2: Ty, class: "p-brilho", style: `stroke-width:${L.traco * 2.6}px` }, svg);
    el("line", { x1: Sx, y1: Sy, x2: Tx, y2: Ty, class: "p-atalho", pathLength: 1, style: `stroke-width:${L.traco}px` }, svg);
    const a = L.ponta / Math.SQRT2;
    const gPonta = el("g", { transform: `translate(${Tx} ${Ty}) rotate(${ang.toFixed(2)})` }, svg);
    el("path", { d: `M${-a} ${-a} L0 0 L${-a} ${a}`, class: "p-ponta", style: `stroke-width:${L.traco}px` }, gPonta);
    el("circle", { cx: Sx, cy: Sy, r: L.raioInicio, class: "p-inicio" }, svg);

    // textos da cena
    const curto = el("text", { class: "p-curto", dy: L.curto.dy, style: `font-size:${L.curto.tam}px` }, svg);
    const tp = el("textPath", { href: `#${id}-d`, startOffset: L.curto.offset, "text-anchor": "middle" }, curto);
    tp.textContent = "o caminho mais curto";
    texto(svg, "o seu problema", { x: L.problema.x, y: L.problema.y, class: "p-grande p-problema", style: `font-size:${L.problema.tam}px` });
    texto(svg, "a solução.", { x: L.solucao.x, y: L.solucao.y, "text-anchor": L.solucao.ancora, class: "p-grande p-solucao", style: `font-size:${L.solucao.tam}px` });

    hero.classList.add("palco-pronto");
    animar();
  }

  function animar() {
    if (calmo) { palco.classList.add("fim"); return; }
    palco.classList.remove("anima", "fim");
    void palco.getBoundingClientRect();
    palco.classList.add("anima");
  }

  palco.addEventListener("click", animar);
  palco.title = "Clique para ver o atalho de novo";
  if (estreitoMq.addEventListener) estreitoMq.addEventListener("change", desenhar);
  else estreitoMq.addListener(desenhar);

  if (document.fonts && document.fonts.ready) {
    // espera as fontes para a animação não começar com a fonte reserva
    const limite = new Promise((r) => setTimeout(r, 900));
    Promise.race([document.fonts.ready, limite]).then(desenhar);
  } else desenhar();
})();
