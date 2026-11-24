/* ==========================================================
   Atalho IA · Mapa do atalho
   O visitante lista os passos de uma tarefa. O mapa desenha esses
   passos como o caminho longo pontilhado do logo; "Desenhar o atalho"
   traça a seta laranja em linha reta e acende os passos que a IA
   pode assumir. Dá para baixar a imagem ou mandar no WhatsApp.

   Para mudar exemplos ou o que conta como "automatizável", edite
   EXEMPLOS e REGRAS abaixo.
   ========================================================== */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const svg = $("#mapa-svg");
  if (!svg) return;

  const WHATSAPP = "5518996141788";
  const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const MAX = 8;
  const MINUTOS = [5, 10, 15, 20, 30, 40, 45, 60, 90, 120];
  const DIAS_UTEIS = 22;

  const EXEMPLOS = {
    clinica: [["Receber mensagem do paciente no WhatsApp", 10], ["Responder horários disponíveis", 15], ["Anotar o horário na agenda", 10], ["Ligar na véspera para confirmar", 30], ["Remarcar quem faltou", 15], ["Atender o paciente", 60]],
    loja: [["Responder preço e estoque no WhatsApp", 45], ["Copiar o pedido para a planilha", 20], ["Conferir o pagamento", 15], ["Separar e embalar", 40], ["Avisar o cliente do envio", 15], ["Montar o relatório de vendas", 20]],
    escritorio: [["Receber documentos do cliente", 15], ["Renomear e organizar os arquivos", 30], ["Ler contratos para achar prazos", 45], ["Lançar os prazos na agenda", 15], ["Atualizar o cliente por mensagem", 20], ["Reunião com o cliente", 60]],
    agro: [["Anotar as horas das máquinas", 20], ["Passar as anotações para a planilha", 30], ["Conferir revisões vencendo", 20], ["Juntar os dados da safra", 40], ["Montar o relatório da reunião", 45], ["Vistoria no campo", 90]],
  };

  // o que a IA costuma assumir, por palavras do passo (sem acento)
  const REGRAS = [
    [/whats|mensage|respond|duvida|pergunt|chat|direct/, "resposta automática"],
    [/planilh|excel|copiar|colar|digitar|lanca|cadastr|transcrev|passar .* para/, "dados sem digitar"],
    [/relatori|juntar|dados|grafic|indicador|fechamento/, "relatório automático"],
    [/contrat|document|ler |leitura|resum|edital|laudo|pdf/, "leitura com IA"],
    [/organiz|renome|arquiv|classific|pasta/, "organização automática"],
    [/agenda|agend|lembr|confirm|avis|remarc|venc|prazo/, "agenda e lembretes"],
    [/confer|verific|pagament/, "conferência automática"],
    [/email|e-mail|orcament|proposta|descric|legenda|post/, "texto com IA"],
  ];
  const sem = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  function analisar(texto) {
    const t = " " + sem(texto) + " ";
    const r = REGRAS.find(([re]) => re.test(t));
    return r ? r[1] : null;
  }

  /* ---------- Editor de passos ---------- */
  const lista = $("#mapa-passos");
  const btnMais = $("#mapa-mais");
  let passos = [];
  let contador = 0;

  function desenharEditor() {
    lista.innerHTML = "";
    passos.forEach((p, i) => {
      const li = document.createElement("li");
      li.className = "mapa__passo";
      const id = "mapa-p-" + p.id;
      li.innerHTML = `
        <span class="mapa__n mono" aria-hidden="true">${i + 1}</span>
        <label class="sr" for="${id}">Passo ${i + 1}</label>
        <input id="${id}" type="text" maxlength="60" placeholder="Descreva o passo">
        <label class="sr" for="${id}-m">Minutos por dia no passo ${i + 1}</label>
        <select id="${id}-m" class="mono">${MINUTOS.map((m) => `<option value="${m}">${m} min</option>`).join("")}</select>
        <button type="button" class="mapa__tirar" aria-label="Remover o passo ${i + 1}">×</button>`;
      const campo = li.querySelector("input");
      const sel = li.querySelector("select");
      campo.value = p.texto;
      sel.value = String(p.min);
      campo.addEventListener("input", () => { p.texto = campo.value; agendar(); });
      sel.addEventListener("change", () => { p.min = Number(sel.value); agendar(); });
      li.querySelector(".mapa__tirar").addEventListener("click", () => {
        passos = passos.filter((x) => x !== p);
        desenharEditor();
        agendar();
      });
      lista.appendChild(li);
    });
    btnMais.disabled = passos.length >= MAX;
    btnMais.lastChild.textContent = passos.length >= MAX ? " Máximo de " + MAX + " passos" : " Adicionar passo";
  }

  function carregar(nome) {
    passos = EXEMPLOS[nome].map(([texto, min]) => ({ id: ++contador, texto, min }));
    document.querySelectorAll("[data-exemplo]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.exemplo === nome)));
    desenharEditor();
    desenharMapa();
  }
  document.querySelectorAll("[data-exemplo]").forEach((b) => b.addEventListener("click", () => carregar(b.dataset.exemplo)));
  btnMais.addEventListener("click", () => {
    if (passos.length >= MAX) return;
    passos.push({ id: ++contador, texto: "", min: 15 });
    desenharEditor();
    lista.lastElementChild.querySelector("input").focus();
    agendar();
  });

  let timer = 0;
  function agendar() { clearTimeout(timer); timer = setTimeout(desenharMapa, 180); }

  /* ---------- Desenho do mapa ---------- */
  const el = (tag, attrs, pai) => {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    if (pai) pai.appendChild(n);
    return n;
  };
  const cortar = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

  let estado = { nos: [], longo: null, curto: null, pronto: false };

  // O mapa repete o símbolo da marca: o caminho longo sobe pela esquerda
  // e segue pelo topo (o "L" pontilhado); o atalho é a diagonal ↗.
  // Metade dos passos fica na subida (o último deles é o canto) e a outra
  // metade no topo. Textos: na subida, à direita; no canto, à direita e
  // abaixo da linha do topo; no topo, acima das teclas. Assim nada se cruza.
  const INICIO = { x: 90, y: 400 }, CANTO = { x: 90, y: 104 }, FIM = { x: 560, y: 104 };
  function posicoes(n) {
    const v = Math.ceil(n / 2), h = n - v;
    const pos = [];
    if (v === 1) {
      pos.push({ x: INICIO.x, y: INICIO.y, lado: "direita", subida: true });
    } else {
      for (let i = 0; i < v; i++) {
        const ultimo = i === v - 1;
        pos.push({ x: CANTO.x, y: INICIO.y - i * ((INICIO.y - CANTO.y) / (v - 1)), lado: ultimo ? "canto" : "direita", subida: true, v });
      }
    }
    for (let j = 1; j <= h; j++) pos.push({ x: CANTO.x + j * ((FIM.x - CANTO.x) / h), y: CANTO.y, lado: "cima", subida: false });
    return pos;
  }

  // quebra o texto em até duas linhas, sem cortar palavras quando dá
  function quebrar(texto, max, maxLinhas = 2) {
    const palavras = texto.split(/\s+/);
    const linhas = [""];
    for (const p of palavras) {
      const atual = linhas[linhas.length - 1];
      if (!atual) linhas[linhas.length - 1] = p;
      else if ((atual + " " + p).length <= max) linhas[linhas.length - 1] = atual + " " + p;
      else if (linhas.length < maxLinhas) linhas.push(p);
      else { linhas[linhas.length - 1] = cortar(atual + " " + p, max); break; }
    }
    return linhas.map((l) => cortar(l, max));
  }
  function escreverLinhas(pai, linhas, attrs, passo) {
    const t = el("text", attrs, pai);
    linhas.forEach((l, i) => {
      const s = el("tspan", { x: attrs.x, dy: i ? passo : 0 }, t);
      s.textContent = l;
    });
    return t;
  }

  let compacto = false;
  function desenharMapa() {
    compacto = svg.getBoundingClientRect().width < 480;
    svg.classList.toggle("compacto", compacto);
    svg.classList.remove("com-atalho");
    const validos = passos.filter((p) => p.texto.trim());
    svg.querySelectorAll(":scope > :not(desc)").forEach((n) => n.remove());
    estado = { nos: [], longo: null, curto: null, dica: null, pronto: false };
    const defs = el("defs", {}, svg);
    const marcador = el("marker", { id: "mapa-ponta", viewBox: "0 0 10 10", refX: "5", refY: "5", markerWidth: "4.5", markerHeight: "4.5", orient: "auto-start-reverse" }, defs);
    el("path", { d: "M0 0 L10 5 L0 10 z", fill: "#FF6A2B" }, marcador);

    if (validos.length < 2) {
      const t = el("text", { x: 320, y: 230, "text-anchor": "middle", class: "mapa__vazio" }, svg);
      t.textContent = "Adicione pelo menos 2 passos para desenhar o mapa.";
      atualizarResumo(validos);
      return;
    }
    const pos = posicoes(validos.length);
    const a = pos[0], b = pos[pos.length - 1];

    // caminho longo, pontilhado: sobe até o canto e segue pelo topo
    const pontos = [];
    pos.forEach((p, i) => {
      if (i && pos[i - 1].subida && !p.subida && pos[i - 1].y !== CANTO.y) pontos.push(CANTO);
      pontos.push(p);
    });
    const d = pontos.map((p, i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ");
    estado.longo = el("path", { d, class: "mapa__longo" }, svg);

    // convite antes do clique: a diagonal aparece apagada no espaço livre
    estado.dica = el("g", { class: "mapa__dica" }, svg);
    el("path", { d: `M${a.x + 40} ${a.y - 28} L${b.x - 40} ${b.y + 28}`, class: "mapa__dica-linha" }, estado.dica);
    escreverLinhas(estado.dica, ["E se desse para", "pular direto ao fim?"], { x: (a.x + b.x) / 2 + 70, y: (a.y + b.y) / 2 + 52, class: "mapa__dica-txt" }, compacto ? 24 : 17);

    // atalho: da primeira etapa direto à última, parando na borda da tecla,
    // para a ponta da seta aparecer
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const ax = a.x + Math.cos(ang) * 34, ay = a.y + Math.sin(ang) * 34;
    const bx = b.x - Math.cos(ang) * 44, by = b.y - Math.sin(ang) * 44;
    estado.curto = el("path", { d: `M${ax.toFixed(1)} ${ay.toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)}`, class: "mapa__curto", "marker-end": "url(#mapa-ponta)" }, svg);

    const lh = compacto ? 24 : 17;
    const nTopo = pos.filter((p) => !p.subida).length;
    const porLinhaTopo = compacto ? (nTopo >= 4 ? 8 : 11) : (nTopo >= 4 ? 12 : 17);
    validos.forEach((p, i) => {
      const tipo = analisar(p.texto);
      const g = el("g", { class: "mapa__no" + (tipo ? " mapa__no--auto" : ""), transform: `translate(${pos[i].x.toFixed(1)} ${pos[i].y.toFixed(1)})` }, svg);
      el("rect", { x: -30, y: -26, width: 60, height: 56, rx: 15, class: "mapa__base" }, g);
      el("rect", { x: -30, y: -30, width: 60, height: 52, rx: 15, class: "mapa__tecla" }, g);
      const n = el("text", { x: 0, y: 3, "text-anchor": "middle", class: "mapa__num" }, g);
      n.textContent = i + 1;

      const lado = pos[i].lado;
      const texto = p.texto.trim();
      if (lado === "cima") {
        // no topo: texto acima da tecla, centralizado
        // com 4 passos no topo do celular, só o tempo (a cor laranja já marca a IA)
        const minutos = p.min + " min" + (tipo && !(compacto && nTopo >= 4) ? " · IA" : "");
        const linhas = quebrar(texto, porLinhaTopo);
        const yMin = compacto ? -44 : -40;
        escreverLinhas(g, linhas, { x: 0, y: yMin - linhas.length * lh, "text-anchor": "middle", class: "mapa__rot" }, lh);
        const m = el("text", { x: 0, y: yMin, "text-anchor": "middle", class: "mapa__min" }, g);
        m.textContent = minutos;
      } else {
        // na subida e no canto: texto à direita da tecla
        const canto = lado === "canto";
        const minutos = p.min + " min" + (tipo ? (compacto ? " · IA" : " · " + tipo) : "");
        const apertado = canto && ((pos[i].v || 0) >= 4 || compacto);
        const linhas = quebrar(texto, compacto ? 18 : 30, apertado ? 1 : 2);
        // no canto, desce o texto para ficar embaixo da linha do topo
        const y0 = canto ? (compacto ? 52 : 50) : (linhas.length > 1 ? (compacto ? -14 : -10) : -2);
        escreverLinhas(g, linhas, { x: 44, y: y0, class: "mapa__rot" }, lh);
        // no celular, com o canto apertado, os minutos ficam só na lista ao lado
        if (!(apertado && compacto)) {
          const m = el("text", { x: 44, y: y0 + linhas.length * lh, class: "mapa__min" }, g);
          m.textContent = minutos;
        }
      }
      estado.nos.push({ g, tipo });
    });

    // marcações de início e fim, embaixo das teclas
    const ini = el("text", { x: a.x, y: a.y + (compacto ? 60 : 52), "text-anchor": "middle", class: "mapa__marca" }, svg);
    ini.textContent = "início";
    const fim = el("text", { x: b.x, y: b.y + (compacto ? 60 : 52), "text-anchor": "middle", class: "mapa__marca mapa__marca--fim" }, svg);
    fim.textContent = "resolvido";

    if (!calmo) estado.longo.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: "both" });
    atualizarResumo(validos);
  }


  /* ---------- Resumo ---------- */
  const resumo = $("#mapa-resumo");
  function contas(validos) {
    const total = validos.reduce((s, p) => s + p.min, 0);
    const auto = validos.filter((p) => analisar(p.texto));
    const minAuto = auto.reduce((s, p) => s + p.min, 0);
    return { total, auto, minAuto, horasAuto: (minAuto * DIAS_UTEIS) / 60 };
  }
  const fmt = (n) => Math.round(n).toLocaleString("pt-BR");
  function atualizarResumo(validos) {
    const c = contas(validos);
    resumo.innerHTML = "";
    const linha = (rotulo, valor, destaque) => {
      const d = document.createElement("div");
      d.className = "mapa__dado" + (destaque ? " mapa__dado--atalho" : "");
      d.innerHTML = "<span class='mono'></span><b></b>";
      d.firstChild.textContent = rotulo;
      d.lastChild.textContent = valor;
      resumo.appendChild(d);
    };
    linha("caminho longo", validos.length + " passos · " + c.total + " min por dia");
    linha("a IA pode assumir", c.auto.length + (c.auto.length === 1 ? " passo · " : " passos · ") + c.minAuto + " min por dia", true);
    linha("em um mês", "até " + fmt(c.horasAuto) + " horas fora do caminho");
    const desc = $("#mapa-desc");
    desc.textContent = "Mapa com " + validos.length + " passos, " + c.total + " minutos por dia. " + c.auto.length + " passos podem ser automatizados.";
  }

  /* ---------- Desenhar o atalho ---------- */
  function animarPonto(caminho, dur) {
    return new Promise((ok) => {
      const L = caminho.getTotalLength();
      const ponto = el("circle", { r: 7, class: "mapa__ponto" }, svg);
      const t0 = performance.now();
      const passo = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const q = caminho.getPointAtLength(L * p);
        ponto.setAttribute("cx", q.x);
        ponto.setAttribute("cy", q.y);
        if (p < 1) requestAnimationFrame(passo);
        else { setTimeout(() => ponto.remove(), 400); ok(); }
      };
      requestAnimationFrame(passo);
    });
  }

  let animando = false;
  async function desenharAtalho() {
    if (!estado.curto || animando) return;
    animando = true;
    svg.classList.remove("com-atalho");
    estado.nos.forEach((n) => n.g.classList.remove("acesa"));
    if (!calmo) await animarPonto(estado.longo, 2600);
    svg.classList.add("com-atalho");
    const L = estado.curto.getTotalLength();
    if (!calmo) {
      estado.curto.animate([{ strokeDasharray: L, strokeDashoffset: L }, { strokeDasharray: L, strokeDashoffset: 0 }], { duration: 650, easing: "cubic-bezier(.6,0,.2,1)" });
      await new Promise((ok) => setTimeout(ok, 650));
      animarPonto(estado.curto, 380);
    }
    estado.nos.forEach((n, i) => { if (n.tipo) setTimeout(() => n.g.classList.add("acesa"), calmo ? 0 : 120 * i); });
    const validos = passos.filter((p) => p.texto.trim());
    const c = contas(validos);
    if (window.tec && c.auto.length) window.tec.comemorar(c.auto.length + (c.auto.length === 1 ? " passo pode" : " passos podem") + " pegar o atalho nesse mapa!");
    estado.pronto = true;
    animando = false;
  }
  $("#mapa-atalho").addEventListener("click", desenharAtalho);

  /* ---------- Enviar no WhatsApp ---------- */
  $("#mapa-whats").addEventListener("click", () => {
    const validos = passos.filter((p) => p.texto.trim());
    if (!validos.length) return;
    const c = contas(validos);
    const linhas = validos.map((p, i) => (i + 1) + ". " + p.texto.trim() + " (" + p.min + " min)" + (analisar(p.texto) ? " ↗" : ""));
    const texto = "Olá! Montei o mapa de uma tarefa no site da Atalho IA:\n\n" + linhas.join("\n") +
      "\n\nTotal: " + c.total + " min por dia. Os passos com ↗ são os que a IA pode assumir. Quero ver como encurtar esse caminho.";
    const a = document.createElement("a");
    a.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto);
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  /* ---------- Baixar imagem (1080 × 1350, pronta para stories e feed) ---------- */
  $("#mapa-baixar").addEventListener("click", async () => {
    const validos = passos.filter((p) => p.texto.trim());
    if (validos.length < 2) return;
    if (!estado.pronto) await desenharAtalho();
    const c = contas(validos);
    const clone = svg.cloneNode(true);
    clone.classList.add("com-atalho");
    clone.querySelectorAll(".mapa__no--auto").forEach((g) => g.classList.add("acesa"));
    clone.querySelectorAll(".mapa__ponto, .mapa__dica").forEach((p) => p.remove());
    clone.querySelectorAll(".mapa__longo").forEach((p) => p.setAttribute("stroke-dasharray", "2 10"));
    const estilos = `
      text{font-family:Arial,Helvetica,sans-serif}
      .mapa__longo{fill:none;stroke:#8A97AB;stroke-width:3;stroke-linecap:round;stroke-dasharray:2 10}
      .mapa__curto{fill:none;stroke:#FF6A2B;stroke-width:6;stroke-linecap:round}
      .mapa__base{fill:#060C16}.mapa__tecla{fill:#1B2B44;stroke:rgba(138,151,171,.35)}
      .mapa__num{fill:#F4F1EA;font-weight:700;font-size:20px}
      .mapa__rot{fill:#F4F1EA;font-size:15px;font-weight:700}.mapa__min{fill:#8A97AB;font-size:12.5px}
      .mapa__rot,.mapa__min,.mapa__marca{paint-order:stroke;stroke:#0F1B2D;stroke-width:5px;stroke-linejoin:round}
      .mapa__marca{fill:#8A97AB;font-size:11px;letter-spacing:2px;text-transform:uppercase}
      .acesa .mapa__tecla{fill:#FF6A2B;stroke:#FF6A2B}.acesa .mapa__num{fill:#0F1B2D}.acesa .mapa__min{fill:#FF6A2B}`;
    const corpo = new XMLSerializer().serializeToString(clone).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    // o Tec assina a imagem, no canto livre embaixo do mapa
    const tecSvg = document.querySelector(".tec__boneco svg");
    const tecArte = tecSvg ? new XMLSerializer().serializeToString(tecSvg)
      .replace(/^<svg[^>]*>/, '<svg x="840" y="740" width="150" height="188" viewBox="0 0 120 150" overflow="visible">') : "";
    const arte = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
      <style>${estilos}</style>
      <rect width="1080" height="1350" fill="#0F1B2D"/>
      <text x="96" y="140" font-family="Arial" font-size="26" fill="#FF6A2B" letter-spacing="4">MAPA DO ATALHO</text>
      <text x="96" y="214" font-family="Arial" font-weight="700" font-size="64" fill="#F4F1EA">O caminho da minha tarefa</text>
      <g transform="translate(60 250) scale(1.5)">${corpo}</g>
      ${tecArte}
      <rect x="96" y="980" width="888" height="200" rx="28" fill="#1B2B44"/>
      <text x="136" y="1040" font-family="Arial" font-size="26" fill="#8A97AB">CAMINHO LONGO</text>
      <text x="136" y="1086" font-family="Arial" font-weight="700" font-size="38" fill="#F4F1EA">${validos.length} passos · ${c.total} min por dia</text>
      <text x="136" y="1140" font-family="Arial" font-weight="700" font-size="34" fill="#FF6A2B">${esc(c.auto.length + " podem pegar o atalho · até " + fmt(c.horasAuto) + " h por mês")}</text>
      <text x="96" y="1262" font-family="Arial" font-weight="700" font-size="30" fill="#F4F1EA">atalho IA</text>
      <text x="984" y="1262" text-anchor="end" font-family="Courier New, monospace" font-size="24" fill="#8A97AB">@atalho._ia</text>
    </svg>`;
    const url = URL.createObjectURL(new Blob([arte], { type: "image/svg+xml;charset=utf-8" }));
    const img = new Image();
    img.onload = () => {
      const tela = document.createElement("canvas");
      tela.width = 1080;
      tela.height = 1350;
      tela.getContext("2d").drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      tela.toBlob((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "mapa-do-atalho.png";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      }, "image/png");
    };
    img.src = url;
  });

  // redesenha se a largura mudar de faixa (girar o celular, redimensionar)
  let ultimoCompacto = null;
  window.addEventListener("resize", () => {
    const c = svg.getBoundingClientRect().width < 480;
    if (c !== ultimoCompacto) { ultimoCompacto = c; agendar(); }
  });

  // começa com um exemplo, para o mapa já aparecer desenhado
  carregar("clinica");
  ultimoCompacto = compacto;
})();
