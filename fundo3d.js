/* ==========================================================
   Fundo 3D (v4.2): "teclado infinito"
   Um piso de teclas em perspectiva, atrás da página. A rolagem leva a
   câmera para a frente sobre as teclas; o mouse inclina a vista e acende
   as teclas por perto; o clique aperta as teclas numa onda.
   De tempos em tempos o logo acontece no chão, perto da câmera: as teclas
   do "L" acendem em cinza (o caminho longo), depois as da diagonal acendem
   em laranja (o atalho) e uma pequena cabeça de seta fecha o desenho.
   Tudo num único shader (WebGL, sem biblioteca), em resolução reduzida,
   a 30 quadros por segundo (12 quando nada se mexe), parado com a aba
   oculta e durante a abertura. Com "reduzir movimento", desenha um quadro só.
   ========================================================== */
(function () {
  const tela = document.createElement("canvas");
  tela.className = "fundo3d";
  tela.setAttribute("aria-hidden", "true");
  const gl = tela.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
  if (!gl) return; // sem WebGL, a página segue com o fundo de sempre

  // mesma regra do mascote.js
  const calmo = !/[?&]movimento\b/.test(location.search) && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fino = window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches;

  // Câmera (o shader e noChao() usam estas mesmas constantes).
  // Horizonte: uv.y = OFF + FOCAL * tan(INC) = 0.045 + 1.35 * 0.1003 = 0.18, ou seja, ~32% da altura a partir do topo.
  const CAM_H = 2.3;   // altura da câmera
  const INC = 0.10;    // inclinação para baixo
  const INC_M = 0.02;  // quanto o mouse (vertical) mexe na inclinação
  const GIRO_M = 0.10; // quanto o mouse (horizontal) gira a vista
  const DESL_M = 0.6;  // quanto o mouse (horizontal) desloca a câmera
  const FOCAL = 1.35;
  const OFF = 0.045;   // deslocamento vertical da tela (uv.y -= OFF)
  const N = 5;         // tamanho do "L" e da seta, em teclas
  const f3 = (v) => v.toFixed(4);

  const VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
  function montarFrag(derivadas) {
    return (derivadas ? "#extension GL_OES_standard_derivatives : enable\n#define DERIV 1\n" : "") + `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;      // tamanho do canvas em pixels
uniform float uT;       // tempo (s)
uniform float uZ;       // avanço da câmera (rolagem)
uniform vec2 uM;        // mouse (-1..1)
uniform vec3 uPM;       // ponto do mouse no chão (x, z) e 1 se existe, 0 se não
uniform vec3 uClique;   // x, z do clique no chão e o tempo do clique
uniform vec3 uLogo;     // célula inicial (x, z) do logo no chão e o tempo em que começou

const vec3 FUNDO = vec3(0.039, 0.071, 0.125);
const vec3 TECLA = vec3(0.106, 0.169, 0.267);
const vec3 SOMBRA = vec3(0.024, 0.047, 0.086);
const vec3 LARANJA = vec3(1.0, 0.416, 0.169);
const vec3 NEVOA = vec3(0.541, 0.592, 0.671);
const float N = ${f3(N)}; // tamanho do "L" e da seta, em teclas

float hash(vec2 c) { return fract(sin(dot(c, vec2(127.1, 311.7))) * 43758.5453); }
float caixa(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
// "esta célula é a (x, y)?" sem igualdade exata de float
float igual(float a, float b) { return abs(a - b) < 0.5 ? 1.0 : 0.0; }

// câmera: inclinação para baixo e um leve giro com o mouse
vec3 raio(vec2 uv) {
  vec3 d = normalize(vec3(uv.x, uv.y, ${f3(FOCAL)}));
  float inc = ${f3(INC)} + uM.y * ${f3(INC_M)};
  float c = cos(inc), s = sin(inc);
  d = vec3(d.x, d.y * c - d.z * s, d.y * s + d.z * c);
  float g = uM.x * ${f3(GIRO_M)};
  float cg = cos(g), sg = sin(g);
  return vec3(d.x * cg + d.z * sg, d.y, -d.x * sg + d.z * cg);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float yn = gl_FragCoord.y / uRes.y; // 0 embaixo, 1 em cima
  uv.y -= ${f3(OFF)};
  vec3 cam = vec3(uM.x * ${f3(DESL_M)}, ${f3(CAM_H)}, uZ);
  vec3 d = raio(uv);

  // céu: transparente (só um fio de brilho laranja no horizonte)
  float hz = exp(-abs(d.y + 0.006) * 70.0);
  float ceu = step(-0.002, d.y);
  float dy = min(d.y, -0.002); // o chão é calculado sempre, para o fwidth ser uniforme

  float t = -cam.y / dy;
  vec2 p = cam.xz + d.xz * t;     // ponto no chão
  vec2 cel = floor(p);
  vec2 f = fract(p) - 0.5;
  float h = hash(cel);

  // onda do clique: as teclas descem quando o anel passa
  float dc = length(p - uClique.xy);
  float idade = uT - uClique.z;
  float anel = idade < 3.0 ? exp(-((dc - idade * 5.0) * 1.4) * ((dc - idade * 5.0) * 1.4)) * (1.0 - idade / 3.0) : 0.0;

  // tecla: quadrado arredondado; apertada fica menor e mais escura
  float aperto = anel;
  float k = caixa(f, vec2(0.40 - aperto * 0.04), 0.10);
  float topo = caixa(f + vec2(0.03, 0.05), vec2(0.30 - aperto * 0.04), 0.09);
#ifdef DERIV
  float aa = max(fwidth(k), 0.002) * 1.2;
#else
  float aa = 1.5 * t / uRes.y;
#endif
  float corpo = 1.0 - smoothstep(-aa, aa, k);
  float face = 1.0 - smoothstep(-aa, aa, topo);

  vec3 cor = mix(SOMBRA, TECLA * 0.62, corpo);           // lateral da tecla
  cor = mix(cor, TECLA * (1.0 - aperto * 0.35), face);   // face de cima
  // luz vinda do alto à esquerda: realça a borda de cima
  cor += vec3(0.05, 0.07, 0.1) * corpo * (1.0 - face) * smoothstep(0.0, 0.4, -f.y - f.x * 0.3);

  // brilho: algumas teclas piscam devagar
  float pisca = step(0.93, h) * (0.5 + 0.5 * sin(uT * (0.6 + h * 1.4) + h * 40.0));
  cor += NEVOA * 0.10 * pisca * face;

  // mouse: as teclas perto do ponteiro acendem (o ponto no chão vem do JS)
  float perto = exp(-dot(p - uPM.xy, p - uPM.xy) * 0.35) * uPM.z;
  cor += LARANJA * 0.18 * perto * face;

  // o logo no chão: o "L" acende em cinza, a diagonal em laranja, e a cabeça da seta fecha
  float tl = uT - uLogo.z;
  float luz = 0.0; // quanto esta tecla está acesa pelo logo
  if (tl > 0.0 && tl < 7.0) {
    vec2 r = cel - uLogo.xy;   // célula relativa ao início
    float some = 1.0 - smoothstep(5.6, 7.0, tl);
    // L: sobe pela coluna 0 e depois vira para a direita na linha N
    float colunaL = igual(r.x, 0.0) * step(-0.5, r.y) * step(r.y, N + 0.5);
    float linhaL = igual(r.y, N) * step(-0.5, r.x) * step(r.x, N + 0.5);
    float noL = max(colunaL, linhaL);
    float passo = colunaL > 0.5 ? r.y : N + r.x;
    float chegou = smoothstep(passo * 0.22, passo * 0.22 + 0.25, tl);
    cor = mix(cor, NEVOA * (0.85 + 0.2 * face), noL * chegou * some * corpo * 0.92);
    luz = noL * chegou * some * corpo;
    // seta: a diagonal de (0,0) até (N,N) acende depois do L, com a ponta mais forte
    float naSeta = igual(r.x, r.y) * step(-0.5, r.x) * step(r.x, N + 0.5);
    float frente = (tl - 2.6) * 4.0;
    float diag = naSeta * smoothstep(r.x - 0.5, r.x, frente);
    // cabeça da seta: as vizinhas (N-1, N) e (N, N-1)
    float cabeca = max(igual(r.x, N - 1.0) * igual(r.y, N), igual(r.x, N) * igual(r.y, N - 1.0));
    cabeca *= smoothstep(N - 0.2, N + 0.6, frente);
    float acesa = max(diag, cabeca) * some;
    cor = mix(cor, LARANJA * (0.8 + 0.3 * face), acesa * corpo * 0.95);
    luz = max(luz, acesa * corpo);
    cor += LARANJA * diag * some * exp(-(frente - r.x) * (frente - r.x) * 0.8) * 0.5 * corpo;
  }

  // borda do anel do clique em laranja
  cor += LARANJA * anel * 0.35 * corpo;

  // névoa: some na distância, no tom do fundo; piso discreto (alfa máximo ~0.55)
  float nevoa = exp(-t * 0.07);
  float alfa = max(nevoa * 0.55, luz * 0.85); // as teclas do logo ficam mais firmes que o piso
  nevoa = mix(nevoa, 1.0, luz * 0.7);
  cor = mix(FUNDO, cor, nevoa);
  cor += LARANJA * hz * 0.18;
  // esmaecimento na faixa de baixo da tela, para o piso não brigar com os textos
  alfa *= mix(0.10, 1.0, smoothstep(0.02, 0.24, yn));
  vec4 chao = vec4(cor * alfa, alfa);
  float ag = hz * 0.10;
  gl_FragColor = mix(chao, vec4(LARANJA * ag, ag), ceu);
}`;
  }

  // ---- estado ----
  const u = {};
  let ok = false;        // programa pronto
  let perdido = false;   // contexto perdido
  let escala = 0.5;
  let larg = 0, alt = 0; // medidas aplicadas pela última vez

  function shader(tipo, fonte) {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, fonte);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn("fundo3d:", gl.getShaderInfoLog(s)); return null; }
    return s;
  }

  // cria shaders, programa, buffer e uniforms (também depois de um contexto restaurado)
  function iniciar() {
    ok = false;
    const derivadas = gl.getExtension("OES_standard_derivatives");
    const vs = shader(gl.VERTEX_SHADER, VERT), fs = shader(gl.FRAGMENT_SHADER, montarFrag(derivadas));
    if (!vs || !fs) return false;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn("fundo3d:", gl.getProgramInfoLog(prog)); return false; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aP = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(aP);
    gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
    ["uRes", "uT", "uZ", "uM", "uPM", "uClique", "uLogo"].forEach((n) => { u[n] = gl.getUniformLocation(prog, n); });
    ok = true;
    return true;
  }

  const raiz = document.documentElement;
  // resolução reduzida: é um fundo com névoa, não precisa de nitidez (e pesa bem menos)
  function medir() {
    const w = raiz.clientWidth || window.innerWidth, h = raiz.clientHeight || window.innerHeight;
    larg = w; alt = h;
    escala = w < 700 ? 0.42 : 0.5;
    tela.width = Math.max(1, Math.round(w * escala));
    tela.height = Math.max(1, Math.round(h * escala));
    if (!ok || perdido) return;
    gl.viewport(0, 0, tela.width, tela.height);
    gl.uniform2f(u.uRes, tela.width, tela.height);
  }

  const t0 = performance.now();
  const mouse = { x: 0, y: 0, alvoX: 0, alvoY: 0, moveu: false };
  let z = 0, zAlvo = 0, anda = 0;
  let clique = [0, 0, -99];
  let logo = [0, 0, -99];
  let proximoLogo = 2.5;
  let atividade = performance.now(); // última rolagem, mouse ou clique

  const seg = (agora) => (agora - t0) / 1000;
  const zDaRolagem = () => window.scrollY * 0.0045;
  z = zAlvo = zDaRolagem();

  // posição no chão de um ponto da tela (a mesma conta do shader: raio() e main())
  function noChao(nx, ny) {
    const ar = tela.width / tela.height;
    let dx = nx * 0.5 * ar, dy = ny * 0.5 - OFF, dz = FOCAL;
    const L = Math.hypot(dx, dy, dz); dx /= L; dy /= L; dz /= L;
    const inc = INC + mouse.y * INC_M, c = Math.cos(inc), s = Math.sin(inc);
    const ry = dy * c - dz * s, rz = dy * s + dz * c;
    const g = mouse.x * GIRO_M, cg = Math.cos(g), sg = Math.sin(g);
    const fx = dx * cg + rz * sg, fz = -dx * sg + rz * cg;
    if (ry >= -0.002) return null;
    const t = -CAM_H / ry;
    return [mouse.x * DESL_M + fx * t, z + fz * t];
  }

  function desenhar(agora) {
    if (!ok || perdido) return;
    const t = seg(agora);
    // o logo aparece no chão, perto da câmera (metade de baixo da tela), de vez em quando
    if (t > proximoLogo) {
      const ar = tela.width / tela.height;
      // em telas estreitas o L precisa ficar mais longe para caber na largura
      const aFrente = Math.max(5, Math.round(8.6 / ar - 2.5));
      const cx = Math.round(mouse.x * DESL_M - (N + 1) / 2);
      logo = [cx, Math.floor(z + aFrente), t];
      proximoLogo = t + 9 + Math.random() * 5;
    }
    const pm = mouse.moveu ? noChao(mouse.x, mouse.y) : null;
    gl.uniform1f(u.uT, t);
    gl.uniform1f(u.uZ, z);
    gl.uniform2f(u.uM, mouse.x, mouse.y);
    gl.uniform3f(u.uPM, pm ? pm[0] : 0, pm ? pm[1] : 0, pm ? 1 : 0);
    gl.uniform3f(u.uClique, clique[0], clique[1], clique[2]);
    gl.uniform3f(u.uLogo, logo[0], logo[1], logo[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  iniciar();
  document.body.insertBefore(tela, document.body.firstChild);
  medir();
  desenhar(performance.now());

  // ---- laço de animação ----
  let ultimo = 0, rodando = false;
  const introAtiva = () => raiz.classList.contains("com-intro") && !window.atalhoIntroFim;
  function quadro(agora) {
    if (document.hidden || perdido || introAtiva()) { rodando = false; return; }
    requestAnimationFrame(quadro);
    // 30 quadros por segundo; 12 se nada se mexe há 4 s (sem rolagem, mouse nem logo)
    const ocioso = agora - atividade > 4000 && seg(agora) - logo[2] > 7.2;
    const dt = (agora - ultimo) / 1000;
    if (dt * 1000 < (ocioso ? 76 : 32)) return;
    ultimo = agora;
    // o avanço automático só acumula o tempo em que o loop roda (sem disparar ao voltar para a aba)
    anda += Math.min(dt, 0.1) * 0.12;
    zAlvo = zDaRolagem() + anda; // anda devagar sozinho e corre com a rolagem
    z += (zAlvo - z) * 0.18;
    mouse.x += (mouse.alvoX - mouse.x) * 0.08;
    mouse.y += (mouse.alvoY - mouse.y) * 0.08;
    desenhar(agora);
  }
  function ligar() { if (calmo || rodando || document.hidden || perdido || introAtiva()) return; rodando = true; ultimo = performance.now(); requestAnimationFrame(quadro); }

  // ---- redimensionar (ignora a barra de endereço do celular; debounce de 150 ms) ----
  let espera = 0;
  window.addEventListener("resize", () => {
    clearTimeout(espera);
    espera = setTimeout(() => {
      const w = raiz.clientWidth || window.innerWidth, h = raiz.clientHeight || window.innerHeight;
      if (w === larg && Math.abs(h - alt) < 120) return;
      medir();
      desenhar(performance.now()); // redimensionar limpa o canvas: redesenha logo
    }, 150);
  });

  // ---- perda e volta do contexto WebGL ----
  tela.addEventListener("webglcontextlost", (e) => { e.preventDefault(); perdido = true; ok = false; rodando = false; });
  tela.addEventListener("webglcontextrestored", () => {
    perdido = false;
    if (!iniciar()) return;
    medir();
    desenhar(performance.now());
    ligar();
  });

  if (calmo) return; // um quadro só, sem animação

  document.addEventListener("visibilitychange", ligar);
  document.addEventListener("atalho:intro-fim", ligar);
  window.addEventListener("scroll", () => { atividade = performance.now(); }, { passive: true });
  ligar();

  if (fino) {
    window.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      mouse.alvoX = (e.clientX / (raiz.clientWidth || window.innerWidth)) * 2 - 1;
      mouse.alvoY = -((e.clientY / (raiz.clientHeight || window.innerHeight)) * 2 - 1);
      mouse.moveu = true;
      atividade = performance.now();
    }, { passive: true });
  }
  // clique (ou toque) em espaço vazio: as teclas do chão afundam numa onda
  window.addEventListener("pointerdown", (e) => {
    atividade = performance.now();
    if (e.target instanceof Element && e.target.closest("a, button, input, textarea, select, label, summary, .tec, .cmdk")) return;
    const ponto = noChao((e.clientX / (raiz.clientWidth || window.innerWidth)) * 2 - 1, -((e.clientY / (raiz.clientHeight || window.innerHeight)) * 2 - 1));
    if (ponto) clique = [ponto[0], ponto[1], seg(performance.now())];
  }, { passive: true });
})();
