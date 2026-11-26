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

  let quadro = 0;
  function atualizar() {
    quadro = 0;
    const meio = window.innerHeight * 0.4;
    let ativa = -1;
    secoes.forEach((s, i) => { if (s.getBoundingClientRect().top <= meio) ativa = i; });
    links.forEach((a, i) => {
      a.classList.toggle("ativa", i === ativa);
      a.classList.toggle("passou", i < ativa);
      if (i === ativa) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
    // progresso entre a primeira e a última parada
    const ini = secoes[0].getBoundingClientRect().top + window.scrollY - meio;
    const fim = (contato || secoes[secoes.length - 1]).getBoundingClientRect().top + window.scrollY - meio;
    const p = Math.min(1, Math.max(0, (window.scrollY - ini) / Math.max(1, fim - ini)));
    preenchimento.style.scale = "1 " + p.toFixed(4);
    // só aparece depois do topo e some no contato final
    const passouHero = hero ? hero.getBoundingClientRect().bottom < window.innerHeight * 0.5 : true;
    const noFim = contato ? contato.getBoundingClientRect().top < window.innerHeight * 0.6 : false;
    nav.classList.toggle("on", passouHero && !noFim);
  }
  window.addEventListener("scroll", () => { if (!quadro) quadro = requestAnimationFrame(atualizar); }, { passive: true });
  window.addEventListener("resize", atualizar);
  atualizar();
})();
