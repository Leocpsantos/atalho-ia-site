/* ==========================================================
   Atalho IA · site v2
   CONFIGURAÇÃO: número do WhatsApp, só dígitos (55 + DDD + número)
   ========================================================== */
const WHATSAPP = "5518996141788";
const MSG_PADRAO = "Olá! Vim pelo site da Atalho IA e quero conversar sobre uma solução para a minha empresa.";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function linkWhats(texto) {
  return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto || MSG_PADRAO);
}
function abrirWhats(texto) {
  // um <a> clicado abre uma única aba nova e mantém o site aberto
  const a = document.createElement("a");
  a.href = linkWhats(texto);
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ---------- Links de WhatsApp ---------- */
$$("[data-wa]").forEach((a) => {
  a.href = linkWhats(MSG_PADRAO);
  a.target = "_blank";
  a.rel = "noopener";
});

$$(".setores__link").forEach((a) => {
  const setor = $(".setores__nome", a).textContent;
  a.href = linkWhats("Olá! Vim pelo site da Atalho IA. Quero conhecer os atalhos para o setor: " + setor + ".");
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("aria-label", setor + ": conversar no WhatsApp");
});

/* ---------- Navegação ---------- */
const nav = $(".nav");
const menu = $("#menu");
const burger = $(".nav__burger");
const aoRolar = () => nav.classList.toggle("rolou", window.scrollY > 24);
aoRolar();
window.addEventListener("scroll", aoRolar, { passive: true });

function fecharMenu(devolverFoco) {
  if (!menu.classList.contains("aberto")) return;
  menu.classList.remove("aberto");
  burger.setAttribute("aria-expanded", "false");
  burger.setAttribute("aria-label", "Abrir menu");
  if (devolverFoco) burger.focus();
}
burger.addEventListener("click", () => {
  const aberto = menu.classList.toggle("aberto");
  burger.setAttribute("aria-expanded", String(aberto));
  burger.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
});
$$("a", menu).forEach((a) => a.addEventListener("click", () => fecharMenu(false)));
document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && !burger.contains(e.target)) fecharMenu(false);
});

/* ---------- Holofote do hero e dos cartões ----------
   (v3) O holofote é um quadrado de 364 px movido por transform; o fundo dele
   é deslocado para os pontos coincidirem com a grade de 26 px do topo. */
const hero = $(".hero");
const luz = $(".hero__luz");
let quadroHolofote = 0;
let ultimoPonteiro = null;
if (luz && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  hero.addEventListener("pointermove", (e) => {
    ultimoPonteiro = e;
    if (quadroHolofote) return;
    quadroHolofote = requestAnimationFrame(() => {
      quadroHolofote = 0;
      const r = hero.getBoundingClientRect();
      const px = Math.round(ultimoPonteiro.clientX - r.left - 182);
      const py = Math.round(ultimoPonteiro.clientY - r.top - 182);
      luz.style.transform = "translate3d(" + px + "px," + py + "px,0)";
      luz.style.backgroundPosition = (((-px % 26) + 26) % 26) + "px " + (((-py % 26) + 26) % 26) + "px";
      luz.classList.add("on");
    });
  });
  hero.addEventListener("pointerleave", () => luz.classList.remove("on"));
}
let heroVisivel = true;

/* Caminho pontilhado do hero preso à grade de 26px do fundo */
const PASSO = 26;
const rotaV = $(".rota--v");
const rotaH = $(".rota--h");
function posicionarRota() {
  if (!rotaV || !rotaH) return;
  const w = hero.clientWidth;
  const h = hero.clientHeight;
  const ajusta = (v) => Math.round(v / PASSO) * PASSO;
  const x1 = ajusta(w * 0.08);
  const x2 = ajusta(w * 0.92);
  // a linha de cima passa na fileira da grade logo acima do selo
  const selo = $(".selo");
  const topoSelo = selo ? selo.getBoundingClientRect().top - hero.getBoundingClientRect().top : h * 0.13;
  const y1 = Math.max(PASSO, Math.floor((topoSelo - 14) / PASSO) * PASSO);
  const y2 = ajusta(h * 0.92);
  rotaV.style.cssText = "left:" + x1 + "px;top:" + y1 + "px;height:" + (y2 - y1) + "px";
  rotaH.style.cssText = "left:" + x1 + "px;top:" + y1 + "px;width:" + (x2 - x1 + PASSO) + "px";
}
posicionarRota();
window.addEventListener("resize", posicionarRota);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(posicionarRota);
$$(".cartao").forEach((c) => {
  c.addEventListener("pointermove", (e) => {
    const r = c.getBoundingClientRect();
    c.style.setProperty("--x", e.clientX - r.left + "px");
    c.style.setProperty("--y", e.clientY - r.top + "px");
  });
});

/* ---------- Paleta do hero: demonstração + contato ---------- */
const CENARIOS = [
  {
    pedido: "responder clientes no WhatsApp o dia todo",
    itens: [
      ["↗", "Assistente de atendimento no WhatsApp", "Responde preço, horário e endereço na hora", "automação"],
      ["≡", "Base com as informações da empresa", "Produtos, serviços e regras num só lugar", "configuração"],
      ["!", "Triagem para a sua equipe", "Só chega até você o que precisa de atenção", "triagem"],
    ],
  },
  {
    pedido: "ler contratos inteiros para achar prazos",
    itens: [
      ["↗", "Resumo automático de contratos", "Prazos, valores e cláusulas em linguagem simples", "documentos"],
      ["◷", "Painel de prazos", "Avisa o que vence esta semana", "painel"],
      ["≡", "Arquivo organizado por cliente", "Cada documento separado por tipo e data", "sistema"],
    ],
  },
  {
    pedido: "juntar planilhas no fim do mês",
    itens: [
      ["↗", "Painel de vendas atualizado sozinho", "Os dados que você já tem viram gráficos", "power bi"],
      ["◷", "Relatório mensal automático", "Pronto para a reunião, sem retrabalho", "relatório"],
      ["!", "Alertas de meta", "Aviso quando um número sai do esperado", "automação"],
    ],
  },
  {
    pedido: "controlar a manutenção das máquinas",
    itens: [
      ["↗", "Sistema de patrimônio e manutenção", "Histórico de cada máquina num só lugar", "sistema"],
      ["!", "Aviso de revisão", "Lembrete antes do prazo vencer", "automação"],
      ["◷", "Painel da frota", "Situação de tudo em uma tela", "painel"],
    ],
  },
];

const paleta = $("#paleta");
const campo = $("#pedido");
const lista = $("#paleta-lista");
const grupo = $("#paleta-grupo");
let modoDemo = true;
let timers = [];
const espera = (ms) => new Promise((ok) => {
  const id = setTimeout(() => { timers = timers.filter((t) => t !== id); ok(); }, ms);
  timers.push(id);
});
function pararTimers() { timers.forEach(clearTimeout); timers = []; }

function desenharItens(itens, acoes) {
  lista.innerHTML = "";
  itens.forEach(([ico, titulo, desc, meta], i) => {
    const li = document.createElement("li");
    li.className = "item";
    li.style.animationDelay = i * 70 + "ms";
    const miolo = '<span class="item__ico"></span><span class="item__txt"><b></b><small></small></span><span class="item__meta"></span>';
    li.innerHTML = acoes && acoes[i] ? '<button type="button" class="item__btn">' + miolo + "</button>" : miolo;
    li.querySelector(".item__ico").textContent = ico;
    li.querySelector("b").textContent = titulo;
    li.querySelector("small").textContent = desc;
    li.querySelector(".item__meta").textContent = meta;
    if (acoes && acoes[i]) li.querySelector(".item__btn").addEventListener("click", acoes[i]);
    lista.appendChild(li);
  });
}

async function rodarDemo() {
  paleta.classList.add("demo");
  let i = 0;
  while (modoDemo) {
    while (modoDemo && (!heroVisivel || document.hidden)) await espera(500);
    if (!modoDemo) return;
    const c = CENARIOS[i % CENARIOS.length];
    campo.value = "";
    grupo.textContent = "Procurando o atalho…";
    lista.innerHTML = '<li class="item item--esq"></li><li class="item item--esq"></li><li class="item item--esq"></li>';
    for (const letra of c.pedido) {
      if (!modoDemo) return;
      campo.value += letra;
      await espera(34 + Math.random() * 40);
    }
    if (!modoDemo) return;
    await espera(260);
    grupo.textContent = "Atalho sugerido";
    desenharItens(c.itens);
    await espera(3600);
    i++;
  }
}

function sairDoDemo() {
  if (!modoDemo) return;
  modoDemo = false;
  pararTimers();
  paleta.classList.remove("demo");
  campo.value = "";
  atualizarSugestoes();
}

function atualizarSugestoes() {
  const t = campo.value.trim();
  if (!t) {
    grupo.textContent = "Exemplos";
    const usar = (txt) => () => { campo.value = txt; campo.focus(); atualizarSugestoes(); };
    desenharItens([
      ["↗", "Responder clientes no WhatsApp", "Digite o seu caso ou escolha um exemplo", "exemplo"],
      ["↗", "Resumir contratos e documentos", "Prazos e valores em linguagem simples", "exemplo"],
      ["↗", "Montar os relatórios do mês", "Planilhas que viram painel", "exemplo"],
    ], [usar("Responder clientes no WhatsApp"), usar("Resumir contratos e documentos"), usar("Montar os relatórios do mês")]);
    return;
  }
  grupo.textContent = "Próximo passo";
  const enviar = () => paleta.requestSubmit();
  desenharItens([
    ["↵", "Abrir no WhatsApp com a sua mensagem", "“" + t + "”", "enter"],
    ["◎", "Receber uma proposta sob medida", "Prazo e valor antes de qualquer compromisso", "proposta"],
    ["↗", "Conversa rápida no WhatsApp", "Quem responde é quem vai cuidar do projeto", "whatsapp"],
  ], [enviar, enviar, enviar]);
}

campo.addEventListener("focus", sairDoDemo);
campo.addEventListener("pointerdown", sairDoDemo);
campo.addEventListener("input", () => { if (!modoDemo) atualizarSugestoes(); });
paleta.addEventListener("submit", (e) => {
  e.preventDefault();
  if (modoDemo) { sairDoDemo(); campo.focus(); return; }
  const t = campo.value.trim();
  if (!t) { campo.focus(); campo.placeholder = "Escreva em poucas palavras o que toma o seu tempo"; return; }
  abrirWhats("Olá! Vim pelo site da Atalho IA. Quero um atalho para: " + t);
});

if (semMovimento) {
  modoDemo = false;
  campo.value = "";
  grupo.textContent = "Atalho sugerido";
  desenharItens(CENARIOS[0].itens);
} else {
  rodarDemo();
}

/* ---------- Manifesto: palavras acendem com a rolagem ---------- */
const manifesto = $("#manifesto");
(function dividirPalavras(el) {
  const nos = Array.from(el.childNodes);
  el.innerHTML = "";
  nos.forEach((no) => {
    const alvo = no.nodeType === 3 ? el : el.appendChild(no.cloneNode(false));
    (no.textContent || "").split(/(\s+)/).forEach((pedaco) => {
      if (!pedaco) return;
      if (/^\s+$/.test(pedaco)) { alvo.appendChild(document.createTextNode(pedaco)); return; }
      const s = document.createElement("span");
      s.className = "p";
      s.textContent = pedaco;
      alvo.appendChild(s);
    });
  });
})(manifesto);
const palavras = $$(".p", manifesto);
let quadroManifesto = 0;
let manifestoTopo = 0, manifestoAltura = 1;
function medirManifesto() { const r = manifesto.getBoundingClientRect(); manifestoTopo = r.top + window.scrollY; manifestoAltura = r.height; }
medirManifesto();
window.addEventListener("resize", medirManifesto);
if ("ResizeObserver" in window) new ResizeObserver(medirManifesto).observe(document.body);
let ultimoAcesas = -1;
function pedirAcender() {
  if (quadroManifesto) return;
  const topo = manifestoTopo - window.scrollY;
  if (topo > window.innerHeight * 1.2 || topo + manifestoAltura < -window.innerHeight * 0.5) return;
  quadroManifesto = requestAnimationFrame(() => { quadroManifesto = 0; acenderPalavras(); });
}
function acenderPalavras() {
  const vh = window.innerHeight;
  const topo = manifestoTopo - window.scrollY;
  const prog = Math.min(1, Math.max(0, (vh * 0.85 - topo) / (manifestoAltura + vh * 0.35)));
  const n = Math.round(prog * palavras.length);
  if (n === ultimoAcesas) return;
  ultimoAcesas = n;
  palavras.forEach((p, i) => p.classList.toggle("acesa", i < n));
}
acenderPalavras();
window.addEventListener("scroll", pedirAcender, { passive: true });
window.addEventListener("resize", pedirAcender);

/* ---------- Revelar ao rolar ---------- */
const revelaveis = $$(".cab, .calc__painel, .calc__resultado, .cartao, .servicos li, .acorde__item, .setores li, .projeto__txt, .projeto__tela, details, .final__in > *");
if ("IntersectionObserver" in window && !semMovimento) {
  const io = new IntersectionObserver((itens) => {
    itens.forEach((it) => {
      if (!it.isIntersecting) return;
      it.target.classList.add("on");
      io.unobserve(it.target);
      // depois de revelar, devolve as transições próprias do elemento (hover etc.)
      setTimeout(() => { it.target.style.transitionDelay = ""; it.target.classList.remove("rev", "on"); }, 1200);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  revelaveis.forEach((el) => {
    el.classList.add("rev");
    const irmaos = Array.from(el.parentElement.children);
    el.style.transitionDelay = (irmaos.indexOf(el) % 4) * 80 + "ms";
    io.observe(el);
  });
}

/* ---------- Demonstrações ---------- */
const CONVERSA = [
  ["cli", "Oi! Vocês abrem no sábado?"],
  ["ia", "Oi, Marina! Abrimos sim, das 8h às 12h. Quer reservar um horário?"],
  ["cli", "Quero, às 10h"],
  ["ia", "Pronto ✓ Reservado para sábado, às 10h. Você recebe um lembrete na sexta."],
];
const chat = $("#chat");
let chatRodando = false;
function hora() { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }
function bolha(tipo, txt) {
  const b = document.createElement("div");
  b.className = "msg msg--" + tipo;
  b.textContent = txt;
  const s = document.createElement("small");
  s.textContent = hora();
  b.appendChild(s);
  chat.appendChild(b);
}
async function rodarChat() {
  if (chatRodando) return;
  chatRodando = true;
  const pausa = (ms) => new Promise((ok) => setTimeout(ok, ms));
  // roda 3 vezes e para na conversa completa; pausa fora da tela
  for (let ciclo = 0; ciclo < 3; ciclo++) {
    while (!chatVisivel || document.hidden) await pausa(500);
    chat.innerHTML = "";
    for (const [tipo, txt] of CONVERSA) {
      if (tipo === "ia") {
        const d = document.createElement("div");
        d.className = "msg msg--ia msg--digitando";
        d.innerHTML = "<i></i><i></i><i></i>";
        chat.appendChild(d);
        await pausa(1100);
        d.remove();
      } else {
        await pausa(700);
      }
      bolha(tipo, txt);
      await pausa(500);
    }
    if (ciclo < 2) await pausa(5200);
  }
}
let chatVisivel = false;
if (semMovimento || !("IntersectionObserver" in window)) CONVERSA.forEach(([t, x]) => bolha(t, x));
else new IntersectionObserver(([e]) => { chatVisivel = e.isIntersecting; }).observe(chat);

function contar(el) {
  const alvo = Number(el.dataset.alvo);
  const fmt = (n) => "R$ " + Math.round(n).toLocaleString("pt-BR");
  if (semMovimento) { el.textContent = fmt(alvo); return; }
  const t0 = performance.now();
  const passo = (t) => {
    const p = Math.min(1, (t - t0) / 1400);
    el.textContent = fmt(alvo * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

if ("IntersectionObserver" in window) {
  const ioDemo = new IntersectionObserver((itens) => {
    itens.forEach((it) => {
      if (!it.isIntersecting) return;
      const c = it.target;
      c.classList.add("ativo");
      if (c.classList.contains("cartao--chat") && !semMovimento) rodarChat();
      if (c.classList.contains("cartao--painel")) contar($(".painel__num", c));
      ioDemo.unobserve(c);
    });
  }, { threshold: 0.35 });
  $$(".cartao").forEach((c) => ioDemo.observe(c));
} else {
  $$(".cartao").forEach((c) => c.classList.add("ativo"));
}

/* ---------- Acorde: as teclas são apertadas em sequência ---------- */
const teclas = $$("#acorde .tecla");
if ("IntersectionObserver" in window && !semMovimento) {
  const ioAcorde = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    ioAcorde.disconnect();
    teclas.forEach((t, i) => {
      setTimeout(() => {
        t.classList.add("apertada");
        setTimeout(() => t.classList.remove("apertada"), 230);
      }, 500 + i * 380);
    });
  }, { threshold: 0.5 });
  ioAcorde.observe($("#acorde"));
}

/* ---------- Paleta Ctrl+K ---------- */
const SVG_SETA = '<svg aria-hidden="true"><use href="#seta"/></svg>';
const COMANDOS = [
  { rotulo: "Demonstrações", acao: () => irPara("#demos"), dica: "" },
  { rotulo: "Como funciona", acao: () => irPara("#como"), dica: "" },
  { rotulo: "Setores atendidos", acao: () => irPara("#setores"), dica: "" },
  { rotulo: "Projeto entregue", acao: () => irPara("#projeto"), dica: "" },
  { rotulo: "Perguntas frequentes", acao: () => irPara("#duvidas"), dica: "" },
  { rotulo: "Conversar no WhatsApp", acao: () => { fecharCmdk(); abrirWhats(MSG_PADRAO); }, dica: "↵" },
  { rotulo: "Descrever o meu caso", acao: () => { irPara("#topo"); setTimeout(() => campo.focus({ preventScroll: true }), 500); }, dica: "" },
];
const cmdk = $("#cmdk");
const cmdkBusca = $("#cmdk-busca");
const cmdkLista = $("#cmdk-lista");
let cmdkSel = 0;
let cmdkFiltrados = COMANDOS;
let focoAntes = null;

function irPara(sel) {
  fecharCmdk(false);
  if (sel === "#topo") { window.scrollTo({ top: 0, behavior: semMovimento ? "auto" : "smooth" }); return; }
  const alvo = $(sel);
  alvo.scrollIntoView({ behavior: semMovimento ? "auto" : "smooth" });
  const titulo = $("h2[tabindex]", alvo);
  if (titulo) titulo.focus({ preventScroll: true });
}
function desenharCmdk() {
  const q = cmdkBusca.value.trim().toLowerCase();
  const tira = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  cmdkFiltrados = COMANDOS.filter((c) => tira(c.rotulo).includes(tira(q)));
  cmdkSel = Math.min(cmdkSel, Math.max(0, cmdkFiltrados.length - 1));
  cmdkLista.innerHTML = "";
  if (!cmdkFiltrados.length) {
    cmdkLista.innerHTML = '<li class="cmdk__vazio">Nada encontrado. Pressione Enter para falar conosco no WhatsApp.</li>';
    cmdkBusca.removeAttribute("aria-activedescendant");
    return;
  }
  cmdkFiltrados.forEach((c, i) => {
    const li = document.createElement("li");
    li.className = "cmdk__item";
    li.id = "cmdk-op-" + i;
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", String(i === cmdkSel));
    li.innerHTML = SVG_SETA + "<span></span>" + (c.dica ? "<kbd>" + c.dica + "</kbd>" : "");
    li.querySelector("span").textContent = c.rotulo;
    li.addEventListener("click", () => c.acao());
    li.addEventListener("pointermove", () => { if (cmdkSel !== i) { cmdkSel = i; marcarCmdk(); } });
    cmdkLista.appendChild(li);
  });
  marcarCmdk();
}
function marcarCmdk() {
  $$(".cmdk__item", cmdkLista).forEach((li, i) => li.setAttribute("aria-selected", String(i === cmdkSel)));
  const ativo = $("#cmdk-op-" + cmdkSel);
  if (ativo) { cmdkBusca.setAttribute("aria-activedescendant", ativo.id); ativo.scrollIntoView({ block: "nearest" }); }
}
const fundoDaPagina = [$("main"), $(".nav"), $(".rodape"), $(".wa"), $(".skip")];
function abrirCmdk() {
  focoAntes = document.activeElement;
  cmdk.hidden = false;
  cmdkBusca.value = "";
  cmdkSel = 0;
  desenharCmdk();
  cmdkBusca.focus();
  document.body.style.overflow = "hidden";
  fundoDaPagina.forEach((el) => el && (el.inert = true));
}
function fecharCmdk(devolverFoco = true) {
  if (cmdk.hidden) return;
  cmdk.hidden = true;
  document.body.style.overflow = "";
  fundoDaPagina.forEach((el) => el && (el.inert = false));
  if (devolverFoco && focoAntes && focoAntes.focus) focoAntes.focus({ preventScroll: true });
}
cmdkBusca.addEventListener("input", () => { cmdkSel = 0; desenharCmdk(); });
cmdkBusca.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") { e.preventDefault(); cmdkSel = (cmdkSel + 1) % Math.max(1, cmdkFiltrados.length); marcarCmdk(); }
  if (e.key === "ArrowUp") { e.preventDefault(); cmdkSel = (cmdkSel - 1 + cmdkFiltrados.length) % Math.max(1, cmdkFiltrados.length); marcarCmdk(); }
  if (e.key === "Enter" && !e.isComposing) {
    e.preventDefault();
    if (cmdkFiltrados[cmdkSel]) cmdkFiltrados[cmdkSel].acao();
    else { fecharCmdk(); abrirWhats(MSG_PADRAO); }
  }
  if (e.key === "Tab") e.preventDefault();
});
$$("[data-abrir-paleta]").forEach((b) => b.addEventListener("click", abrirCmdk));
$$("[data-fechar-paleta]").forEach((b) => b.addEventListener("click", fecharCmdk));

/* ---------- Teclado global ---------- */
const enter = $(".enter");
const contato = $("#contato");
let contatoVisivel = false;
document.addEventListener("keydown", (e) => {
  const tecla = (e.key || "").toLowerCase();
  if ((e.ctrlKey || e.metaKey) && tecla === "k") {
    e.preventDefault();
    cmdk.hidden ? abrirCmdk() : fecharCmdk();
    return;
  }
  if (e.key === "Escape") { fecharCmdk(); fecharMenu(true); return; }
  if (e.key === "Enter" && !e.repeat && !e.isComposing && contatoVisivel && cmdk.hidden && document.activeElement === document.body) {
    e.preventDefault();
    enter.classList.add("apertada");
    setTimeout(() => enter.classList.remove("apertada"), 180);
    abrirWhats(MSG_PADRAO);
  }
});


/* ---------- Botão flutuante: some no hero e no contato ---------- */
const wa = $(".wa");
if ("IntersectionObserver" in window) {
  const vis = { hero: true, contato: false };
  const atualizarWa = () => wa.classList.toggle("oculto", vis.hero || vis.contato);
  new IntersectionObserver(([e]) => { vis.hero = e.isIntersecting; heroVisivel = e.isIntersecting; atualizarWa(); }, { threshold: 0.25 }).observe(hero);
  new IntersectionObserver(([e]) => { vis.contato = e.isIntersecting; contatoVisivel = e.isIntersecting; atualizarWa(); }, { threshold: 0.3 }).observe(contato);
}

$("#ano").textContent = new Date().getFullYear();

/* ==========================================================
   Interações extras
   ========================================================== */
const ponteiroFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------- Barra de progresso da leitura ---------- */
const barra = $(".progresso span");
let quadroBarra = 0;
const trilhoLargo = window.matchMedia("(min-width: 1380px) and (hover: hover)");
let alturaRolavel = 0;
function medirAltura() { alturaRolavel = document.documentElement.scrollHeight - window.innerHeight; }
medirAltura();
window.addEventListener("resize", medirAltura);
if ("ResizeObserver" in window) new ResizeObserver(medirAltura).observe(document.body);
function atualizarBarra() {
  quadroBarra = 0;
  if (trilhoLargo.matches) return; // nas telas largas quem mostra o progresso é o trilho
  const max = alturaRolavel;
  barra.style.setProperty("--p", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
}
window.addEventListener("scroll", () => { if (!quadroBarra) quadroBarra = requestAnimationFrame(atualizarBarra); }, { passive: true });
atualizarBarra();

/* ---------- Botões com ímã ---------- */
if (ponteiroFino && !semMovimento) {
  $$("[data-ima]").forEach((el) => {
    const forca = el.classList.contains("enter") ? 0.18 : 0.28;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * forca;
      const dy = (e.clientY - (r.top + r.height / 2)) * forca;
      el.style.translate = dx.toFixed(1) + "px " + dy.toFixed(1) + "px";
    });
    el.addEventListener("pointerleave", () => { el.style.translate = ""; });
  });
}

/* ---------- Cartões inclinam com o mouse ---------- */
if (ponteiroFino && !semMovimento) {
  $$(".cartao").forEach((c) => {
    c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      c.classList.add("inclinando");
      c.style.setProperty("--ry", (px * 5).toFixed(2) + "deg");
      c.style.setProperty("--rx", (-py * 5).toFixed(2) + "deg");
    });
    c.addEventListener("pointerleave", () => {
      c.classList.remove("inclinando");
      c.style.setProperty("--rx", "0deg");
      c.style.setProperty("--ry", "0deg");
    });
  });
}

/* ---------- Feixe do hero acompanha o mouse ---------- */
const feixe = $(".hero__feixe");
if (ponteiroFino && !semMovimento && feixe) {
  let quadroFeixe = 0;
  hero.addEventListener("pointermove", (e) => {
    if (quadroFeixe) return;
    quadroFeixe = requestAnimationFrame(() => {
      quadroFeixe = 0;
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      feixe.style.transform = "translate3d(" + (px * 60).toFixed(1) + "px," + (py * 40).toFixed(1) + "px,0)";
    });
  });
}

/* (v3) Os rótulos das seções viraram teclas de atalho; o efeito de "decodificar" saiu. */

/* ---------- Calculadora ---------- */
(function calculadora() {
  const min = $("#calc-min");
  if (!min) return;
  const pes = $("#calc-pes");
  const chips = $$(".calc__chip");
  const elHoras = $("#calc-horas");
  const elFrase = $("#calc-frase");
  const elAno = $("#calc-ano");
  const elMes = $("#calc-mes");
  const DIAS_UTEIS = 22;
  let tarefa = chips[0].dataset.tarefa;
  let horasMostradas = 0;

  elMes.innerHTML = "<i></i>".repeat(DIAS_UTEIS);
  const quadrados = $$("i", elMes);
  const num = (n, casas = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

  function preencherTrilho(input) {
    const p = ((input.value - input.min) / (input.max - input.min)) * 100;
    input.style.setProperty("--f", p + "%");
  }

  function animarHoras(alvo) {
    const inicio = horasMostradas;
    horasMostradas = alvo;
    if (semMovimento) { elHoras.textContent = num(alvo); return; }
    const t0 = performance.now();
    const passo = (t) => {
      const p = Math.min(1, (t - t0) / 450);
      elHoras.textContent = num(Math.round(inicio + (alvo - inicio) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  function calcular() {
    const m = Number(min.value);
    const p = Number(pes.value);
    $("#calc-min-v").textContent = m + " min";
    $("#calc-pes-v").textContent = p;
    preencherTrilho(min);
    preencherTrilho(pes);

    const horas = (m * p * DIAS_UTEIS) / 60;
    const dias = horas / 8;
    animarHoras(Math.round(horas));

    quadrados.forEach((q, i) => {
      q.classList.toggle("cheio", i < Math.floor(dias));
      q.classList.toggle("meio", i === Math.floor(dias) && dias % 1 >= 0.5);
    });

    if (dias < 1) {
      elFrase.textContent = "São " + num(horas, horas < 10 ? 1 : 0) + " horas por mês só para " + tarefa + ".";
    } else if (dias > DIAS_UTEIS) {
      elFrase.textContent = "É mais do que o mês inteiro de trabalho de uma pessoa, só para " + tarefa + ".";
    } else {
      const d = num(dias, dias % 1 ? 1 : 0);
      elFrase.textContent = "São " + d + (dias >= 2 ? " dias inteiros" : " dia inteiro") + " de trabalho por mês só para " + tarefa + ".";
    }
    elAno.textContent = num(Math.round(horas * 12)) + " horas por ano";
  }

  min.addEventListener("input", calcular);
  pes.addEventListener("input", calcular);

  function escolher(chip) {
    chips.forEach((c) => {
      const ativo = c === chip;
      c.setAttribute("aria-checked", String(ativo));
      c.tabIndex = ativo ? 0 : -1;
    });
    tarefa = chip.dataset.tarefa;
    calcular();
  }
  chips.forEach((c, i) => {
    c.tabIndex = i === 0 ? 0 : -1;
    c.addEventListener("click", () => escolher(c));
    c.addEventListener("keydown", (e) => {
      let n = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % chips.length;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + chips.length) % chips.length;
      if (n !== null) { e.preventDefault(); chips[n].focus(); escolher(chips[n]); }
    });
  });

  $("#calc-cta").addEventListener("click", () => {
    const horas = Math.round((Number(min.value) * Number(pes.value) * DIAS_UTEIS) / 60);
    const n = Number(pes.value);
    abrirWhats(
      "Olá! Vim pelo site da Atalho IA e usei a calculadora. Hoje gastamos cerca de " + horas +
      " horas por mês para " + tarefa + " (" + min.value + " min por dia, " + n + (n > 1 ? " pessoas" : " pessoa") +
      "). Quero encurtar esse caminho."
    );
  });

  calcular();
})();

COMANDOS.splice(1, 0, { rotulo: "Calculadora de tempo", acao: () => irPara("#calculadora"), dica: "" }, { rotulo: "Mapa do atalho", acao: () => irPara("#mapa"), dica: "" });
