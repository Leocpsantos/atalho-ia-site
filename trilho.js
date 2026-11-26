/* ==========================================================
   Trilho lateral (site v3, telas largas)
   O caminho pontilhado acompanha a leitura. Cada parada é uma tecla
   com o mesmo atalho de teclado da seção (1 a 6 e M). A linha laranja
   mostra quanto do caminho já foi percorrido.
   ========================================================== */
(() => {
  const PARADAS = [
    ["1", "Demonstrações", "#demos"],
    ["2", "Calculadora", "#calculadora"],
    ["M", "Mapa do atalho", "#mapa"],
    ["3", "Como funciona", "#como"],
    ["4", "Setores", "#setores"],
    ["5", "Projeto entregue", "#projeto"],
    ["6", "Dúvidas", "#duvidas"],
  ].filter(([, , alvo]) => document.querySelector(alvo));
  if (!PARADAS.length) return;

  const nav = document.createElement("nav");
  nav.className = "trilho";
  nav.setAttribute("aria-label", "Seções da página");
  nav.innerHTML = '<span class="trilho__linha" aria-hidden="true"><i></i></span><ol>' +
    PARADAS.map(([k, nome, alvo]) =>
      `<li><a href="${alvo}" class="trilho__k"><kbd>${k}</kbd><span>${nome}</span></a></li>`).join("") + "</ol>";
  document.body.appendChild(nav);

  const links = [...nav.querySelectorAll("a")];
  const secoes = PARADAS.map(([, , alvo]) => document.querySelector(alvo));
  const hero = document.querySelector(".hero");
  const contato = document.querySelector("#contato");
  const preenchimento = nav.querySelector(".trilho__linha i");

  // (v3) as posições das seções ficam guardadas: rolar só faz contas, sem medir a página
  const largo = window.matchMedia("(min-width: 1380px) and (hover: hover)");
  let topos = [], heroFim = 0, contatoTopo = Infinity;
  const abs = (el) => el.getBoundingClientRect().top + window.scrollY;
  function medir() {
    topos = secoes.map(abs);
    heroFim = hero ? abs(hero) + hero.offsetHeight : 0;
    contatoTopo = contato ? abs(contato) : Infinity;
    atualizar();
  }
  let quadro = 0;
  let ativaAntes = -2, visivelAntes = null;
  function atualizar() {
    quadro = 0;
    if (!largo.matches) return;
    const y = window.scrollY, vh = window.innerHeight;
    const meio = y + vh * 0.4;
    let ativa = -1;
    topos.forEach((t, i) => { if (t <= meio) ativa = i; });
    if (ativa !== ativaAntes) {
      ativaAntes = ativa;
      links.forEach((a, i) => {
        a.classList.toggle("ativa", i === ativa);
        a.classList.toggle("passou", i < ativa);
        if (i === ativa) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
    }
    // progresso entre a primeira e a última parada
    const ini = topos[0] - vh * 0.4, fim = (contatoTopo === Infinity ? topos[topos.length - 1] : contatoTopo) - vh * 0.4;
    const p = Math.min(1, Math.max(0, (y - ini) / Math.max(1, fim - ini)));
    preenchimento.style.transform = "scaleY(" + p.toFixed(4) + ")";
    // só aparece depois do topo e some no contato final
    const visivel = heroFim < y + vh * 0.5 && contatoTopo > y + vh * 0.6;
    if (visivel !== visivelAntes) { visivelAntes = visivel; nav.classList.toggle("on", visivel); }
  }
  window.addEventListener("scroll", () => { if (!quadro) quadro = requestAnimationFrame(atualizar); }, { passive: true });
  window.addEventListener("resize", medir);
  if ("ResizeObserver" in window) {
    let espera = 0;
    new ResizeObserver(() => { clearTimeout(espera); espera = setTimeout(medir, 120); }).observe(document.body);
  }
  medir();
})();
