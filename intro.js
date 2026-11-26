/* ==========================================================
   Abertura (site v3)
   O tempo da animação fica no CSS. Aqui: pular (Esc, Enter, espaço,
   clique ou botão), avisar o resto do site quando a tela começa a sair
   (evento "atalho:intro-fim") e remover a abertura no final.
   ========================================================== */
(() => {
  const raiz = document.documentElement;
  const intro = document.getElementById("intro");
  const avisar = () => {
    if (window.atalhoIntroFim) return;
    window.atalhoIntroFim = true;
    document.dispatchEvent(new Event("atalho:intro-fim"));
  };
  if (!intro || !raiz.classList.contains("com-intro")) { if (intro) intro.remove(); window.atalhoIntroFim = true; return; }

  try { sessionStorage.setItem("intro-vista", "1"); } catch (e) {}

  const pular = () => { if (!intro.classList.contains("ja")) intro.classList.add("ja"); };
  intro.addEventListener("animationstart", (e) => { if (e.target === intro && e.animationName === "intro-sai") avisar(); });
  intro.addEventListener("animationend", (e) => {
    if (e.target !== intro || e.animationName !== "intro-sai") return;
    avisar();
    intro.remove();
    raiz.classList.remove("com-intro");
    document.removeEventListener("keydown", tecla, true);
  });
  intro.addEventListener("click", pular);
  function tecla(e) {
    if (["Escape", "Enter", " "].includes(e.key)) { e.preventDefault(); e.stopPropagation(); pular(); }
  }
  document.addEventListener("keydown", tecla, true);
  intro.querySelector(".intro__pular").focus({ preventScroll: true });
  // garantia, caso algum evento de animação não dispare
  setTimeout(() => { avisar(); if (intro.isConnected) { intro.remove(); raiz.classList.remove("com-intro"); } }, 4500);
})();
