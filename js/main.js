/* =====================================================================
   ORBITA — Sistema de Alerta Climático por Satélite
   main.js — Interações, renderização e regras de interface
   ---------------------------------------------------------------------
   Organização:
     A. Helpers genéricos
     B. Chrome compartilhado (header + footer injetados via JS)
     C. Animações (reveal escalonado + contadores)
     D. Dashboard (métricas, gauge, status orbital, mapa, feed, regiões, gráfico)
     E. Central de alertas (filtros + simulação de envio)
     F. Cadastro de regiões (validação + feedback)
     G. Toast reutilizável
     H. Inicialização única

   Padrão "interruptor": cada renderizador verifica se o seu elemento
   existe na página (`if (!el) return`). Assim, todas as páginas usam o
   mesmo arquivo sem disparar erros no console.
   ===================================================================== */

/* ===================================================================
   A. HELPERS GENÉRICOS
   =================================================================== */

/** Atalho para document.getElementById */
const $ = (id) => document.getElementById(id);

/* ---------------------------------------------------------------------
   SISTEMA DE ÍCONES (SVG em linha, sem biblioteca externa)
   Cada ícone usa stroke="currentColor", herdando a cor do contexto.
   - ic("nome")        -> devolve a string SVG do ícone
   - renderIcons()     -> preenche todo elemento com [data-icon] no HTML
   - iconeRisco(tipo)  -> ícone correspondente ao tipo de risco
   --------------------------------------------------------------------- */
const ICONS = {
  wave:      '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c2 0 2 1.8 4 1.8S8 6 10 6s2 1.8 4 1.8S16 6 18 6s2 1.8 4 1.8"/><path d="M2 12c2 0 2 1.8 4 1.8S8 12 10 12s2 1.8 4 1.8S16 12 18 12s2 1.8 4 1.8"/><path d="M2 18c2 0 2 1.8 4 1.8S8 18 10 18s2 1.8 4 1.8S16 18 18 18s2 1.8 4 1.8"/></svg>',
  fire:      '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21a6 6 0 0 0 6-6c0-4-3-6.5-4-9-1.8 2-3 3.2-3 5.2 0 1.2-1.2 1.2-1.2 0 0-.9.2-1.7.6-2.4C8 10 6 12 6 15a6 6 0 0 0 6 6Z"/></svg>',
  sun:       '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  mountain:  '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 20 6-11 4 6 2-3 6 8z"/></svg>',
  satellite: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 7 9 3 5 7l4 4"/><path d="m17 11 4 4-4 4-4-4"/><path d="m8 12 4 4 6-6-4-4Z"/><path d="m16 8 3-3"/><path d="M9 21a6 6 0 0 0-6-6"/></svg>',
  dish:      '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10a7.31 7.31 0 0 0 10 10Z"/><path d="m9 15 3-3"/><path d="M17 13a6 6 0 0 0-6-6"/><path d="M21 13A10 10 0 0 0 11 3"/></svg>',
  warning:   '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m10.3 4-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  bell:      '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
  pin:       '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  wrench:    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6Z"/></svg>',
  check:     '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  trendUp:   '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
  trendDown: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>',
  trendFlat: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"/></svg>',
  close:     '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
};

/** Devolve a string SVG de um ícone pelo nome */
const ic = (nome) => ICONS[nome] || "";

/** Mapa: tipo de risco -> nome do ícone */
const TIPO_ICON = { Enchente: "wave", Queimada: "fire", Seca: "sun", Deslizamento: "mountain" };

/** Ícone correspondente ao tipo de risco (warning como reserva) */
const iconeRisco = (tipo) => ic(TIPO_ICON[tipo] || "warning");

/** Preenche todo elemento com atributo [data-icon] presente no HTML estático */
function renderIcons() {
  document.querySelectorAll("[data-icon]").forEach((el) => { el.innerHTML = ic(el.dataset.icon); });
}

/** Converte um nível de risco textual no rótulo de classificação geral */
function classificarIndice(valor) {
  if (valor >= 80) return { texto: "Crítico", cor: "var(--risk-critico)" };
  if (valor >= 60) return { texto: "Alto",    cor: "var(--risk-alto)" };
  if (valor >= 40) return { texto: "Moderado",cor: "var(--risk-medio)" };
  return { texto: "Baixo", cor: "var(--risk-baixo)" };
}

/* ===================================================================
   B. CHROME COMPARTILHADO (header + footer)
   Injetados via JS para evitar repetir o mesmo HTML em 4 páginas.
   A página atual é identificada por `document.body.dataset.page`.
   =================================================================== */

const PAGINAS = [
  { id: "index",     href: "index.html",     rotulo: "Início" },
  { id: "dashboard", href: "dashboard.html", rotulo: "Dashboard" },
  { id: "alertas",   href: "alertas.html",   rotulo: "Alertas" },
  { id: "regioes",   href: "regioes.html",   rotulo: "Regiões" }
];

/** Monta o cabeçalho com navegação, marcando o link da página atual */
function renderHeader() {
  const host = $("siteHeader");
  if (!host) return;
  const atual = document.body.dataset.page || "index";

  const links = PAGINAS.map(
    (p) => `<li><a href="${p.href}"${p.id === atual ? ' class="active"' : ""}>${p.rotulo}</a></li>`
  ).join("");

  host.innerHTML = `
    <div class="container nav">
      <a href="index.html" class="logo"><span class="dot"></span>ORBITA</a>
      <button class="nav-toggle" id="navToggle" aria-label="Abrir menu">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-links" id="navLinks">${links}</ul>
    </div>`;

  // Liga o menu hambúrguer (mobile)
  const toggle = $("navToggle");
  const navLinks = $("navLinks");
  toggle.addEventListener("click", () => navLinks.classList.toggle("open"));
}

/** Decide o visual do hero: usa a imagem hero.png se existir; caso
 *  contrário, mantém a animação orbital em CSS como fallback. */
function initHeroVisual() {
  const fallback = document.querySelector(".orbit-fallback");
  if (!fallback) return;

  const markers = document.getElementById("heroMarkers");
  const photo = document.querySelector(".hero-photo");
  const img = new Image();
  img.onload = () => { fallback.style.display = "none"; };  // imagem existe -> esconde animação
  img.onerror = () => {                                     // imagem ausente -> usa animação
    if (photo) photo.style.display = "none";
    if (markers) markers.style.display = "none";            // sem imagem, sem marcadores
  };
  img.src = "assets/img/hero.png";
}

/** Modo calibração: abra index.html?debug e mova o mouse sobre a imagem
 *  do hero para ler as coordenadas left%/top% de cada ponto. Copie os
 *  valores para o style="left:..%; top:..%" de cada marcador no HTML. */
function initCalibradorHero() {
  if (!location.search.includes("debug")) return;
  const photo = document.querySelector(".hero-photo");
  const hero = document.querySelector(".hero");
  if (!photo || !hero) return;

  const badge = document.createElement("div");
  badge.className = "calib-badge";
  badge.textContent = "left: --%  ·  top: --%";
  document.body.appendChild(badge);

  hero.addEventListener("mousemove", (e) => {
    const r = photo.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    badge.textContent = `left:${x.toFixed(1)}%  ·  top:${y.toFixed(1)}%`;
  });
}

/** Monta o rodapé. `completo=true` gera o rodapé rico da landing page */
function renderFooter() {
  const host = $("siteFooter");
  if (!host) return;
  const ano = new Date().getFullYear();
  const completo = host.dataset.full === "true";

  const slim = `
    <div class="footer-slim">
      <span>© ${ano} ORBITA · Protótipo acadêmico com dados simulados.</span>
      <span>HTML · CSS · JavaScript puro</span>
    </div>`;

  if (!completo) {
    host.innerHTML = `<div class="container">${slim}</div>`;
    return;
  }

  const navLinks = PAGINAS.map((p) => `<li><a href="${p.href}">${p.rotulo}</a></li>`).join("");
  host.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <a href="index.html" class="logo"><span class="dot"></span>ORBITA</a>
          <p class="footer-tagline">Sistema de alerta climático por satélite. Transformamos infraestrutura espacial em proteção concreta para a sociedade. Do espaço para proteger a Terra.</p>
        </div>
        <div>
          <h5>Navegação</h5>
          <ul>${navLinks}</ul>
        </div>
        <div>
          <h5>Projeto</h5>
          <ul>
            <li><a href="#">Global Solution — FIAP</a></li>
            <li><a href="#">Engenharia de Software</a></li>
            <li><a href="#">Economia Espacial</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${ano} ORBITA · Protótipo acadêmico com dados simulados.</span>
        <span>HTML · CSS · JavaScript puro</span>
      </div>
    </div>`;
}

/* ===================================================================
   C. ANIMAÇÕES
   =================================================================== */

/** Revela elementos .reveal ao entrarem na viewport, com leve atraso em cascata */
function initReveal() {
  const alvos = document.querySelectorAll(".reveal");
  if (!alvos.length) return;

  const obs = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        // Atraso escalonado entre irmãos do mesmo container
        const irmaos = Array.from(e.target.parentElement.children).filter((c) => c.classList.contains("reveal"));
        const i = irmaos.indexOf(e.target);
        e.target.style.transitionDelay = Math.min(i, 6) * 80 + "ms";
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      });
    },
    { threshold: 0.12 }
  );
  alvos.forEach((el) => obs.observe(el));
}

/** Gera um campo de estrelas dinâmico, em todas as páginas.
 *  Estrelas que piscam + estrelas cadentes ocasionais + parallax leve. */
function initStarfield() {
  // Respeita usuários que preferem menos movimento
  const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const campo = document.createElement("div");
  campo.id = "starfield";
  campo.setAttribute("aria-hidden", "true");
  document.body.appendChild(campo);

  // Quantidade proporcional à largura da tela (menos estrelas no celular)
  const total = Math.min(140, Math.floor(window.innerWidth / 9));
  let html = "";
  for (let i = 0; i < total; i++) {
    const x = (Math.random() * 100).toFixed(2);
    const y = (Math.random() * 100).toFixed(2);
    const tamanho = (Math.random() * 2 + 0.6).toFixed(2);   // 0.6–2.6 px
    const brilho = (Math.random() * 0.7 + 0.3).toFixed(2);  // 0.3–1.0
    const duracao = (Math.random() * 4 + 2).toFixed(2);     // 2–6 s
    const atraso = (Math.random() * 5).toFixed(2);
    html += `<span class="sf-star" style="
      left:${x}%; top:${y}%;
      width:${tamanho}px; height:${tamanho}px;
      --o:${brilho}; animation-duration:${duracao}s; animation-delay:${atraso}s;"></span>`;
  }
  campo.innerHTML = html;

  if (semMovimento) return; // sem cadentes nem parallax

  // Parallax sutil: estrelas deslocam levemente com o mouse
  window.addEventListener("mousemove", (e) => {
    const dx = (e.clientX / window.innerWidth - 0.5) * 18;
    const dy = (e.clientY / window.innerHeight - 0.5) * 18;
    campo.style.transform = `translate(${dx}px, ${dy}px)`;
  });

  // Estrela cadente em intervalos aleatórios
  function estrelaCadente() {
    const s = document.createElement("span");
    s.className = "sf-shoot";
    s.style.left = (Math.random() * 70 + 10) + "%";
    s.style.top = (Math.random() * 40) + "%";
    campo.appendChild(s);
    s.addEventListener("animationend", () => s.remove());
    // Próxima entre 4 e 11 segundos
    setTimeout(estrelaCadente, Math.random() * 7000 + 4000);
  }
  setTimeout(estrelaCadente, 2500);
}

/** Anima um número de 0 até `destino` dentro do elemento informado */
function animarContador(el, destino, sufixo = "") {
  const duracao = 1200;
  let inicio = null;
  function passo(t) {
    if (inicio === null) inicio = t;
    const p = Math.min((t - inicio) / duracao, 1);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    el.textContent = Math.round(destino * eased) + sufixo;
    if (p < 1) requestAnimationFrame(passo);
  }
  requestAnimationFrame(passo);
}

/* ===================================================================
   D. DASHBOARD
   =================================================================== */

/** Cartões de métricas do topo (com contadores animados) */
function renderMetricas() {
  const box = $("metricas");
  if (!box) return;

  const ativos = ALERTAS.filter((a) => a.status === "Ativo").length;
  const criticos = REGIOES.filter((r) => r.risco === "Crítico").length;
  const operacionais = SATELITES.filter((s) => s.status === "Operacional").length;

  const metricas = [
    { ico: ic("pin"),       label: "Regiões monitoradas", valor: REGIOES.length,  trend: "+2 nesta semana", up: false },
    { ico: ic("bell"),      label: "Alertas ativos",      valor: ativos,          trend: "Em tempo real", up: true },
    { ico: ic("warning"),   label: "Risco crítico",       valor: criticos,        trend: "Atenção máxima", up: true },
    { ico: ic("satellite"), label: "Satélites simulados", valor: SATELITES.length, trend: operacionais + " operacionais", up: false }
  ];

  box.innerHTML = metricas
    .map(
      (m) => `
      <div class="card card-hover metric-card reveal">
        <span class="label"><span class="ico">${m.ico}</span>${m.label}</span>
        <span class="value gradient-text" data-contador="${m.valor}">0</span>
        <span class="trend ${m.up ? "up" : ""}">${m.trend}</span>
        <div class="bar"></div>
      </div>`
    )
    .join("");

  // Dispara os contadores
  box.querySelectorAll("[data-contador]").forEach((el) => animarContador(el, Number(el.dataset.contador)));
}

/** Índice de risco geral: média ponderada dos níveis de todas as regiões */
function renderIndiceRisco() {
  const gauge = $("gaugeRisco");
  if (!gauge) return;

  const soma = REGIOES.reduce((acc, r) => acc + (PESO_RISCO[r.risco] || 0), 0);
  const indice = Math.round(soma / REGIOES.length);
  const classe = classificarIndice(indice);

  // Cor e valor do anel (transição suave via @property)
  gauge.style.setProperty("--gauge-color", classe.cor);
  requestAnimationFrame(() => gauge.style.setProperty("--gauge-val", indice));

  // Número central animado
  animarContador($("gaugeVal"), indice);

  const status = $("gaugeStatus");
  status.textContent = "● Nível geral: " + classe.texto;
  status.style.color = classe.cor;
}

/** Status orbital: barras de cobertura/sinal de cada satélite */
function renderStatusOrbital() {
  const box = $("statusOrbital");
  if (!box) return;

  box.innerHTML = SATELITES.map((s) => {
    const online = s.status === "Operacional";
    const warn = !online ? " warn" : "";
    return `
      <div class="card card-hover sat-card reveal">
        <div class="sat-head">
          <div>
            <h3>${s.nome}</h3>
            <span class="sat-id">${s.id} · ${s.orbita}</span>
          </div>
          <span class="sat-online ${online ? "" : "sat-offline"}">
            ${online ? '<span class="live-dot"></span>Online' : ic("wrench") + " Manutenção"}
          </span>
        </div>
        <p class="sat-meta">${s.tipo} · Próxima passagem: ${s.passagem}</p>
        <div class="sat-rows">
          <div class="sat-row">
            <div class="sat-row-top"><span>Cobertura</span><span>${s.cobertura}%</span></div>
            <div class="sat-track"><div class="sat-fill${warn}" data-fill="${s.cobertura}"></div></div>
          </div>
          <div class="sat-row">
            <div class="sat-row-top"><span>Sinal de telemetria</span><span>${s.sinal}%</span></div>
            <div class="sat-track"><div class="sat-fill${warn}" data-fill="${s.sinal}"></div></div>
          </div>
        </div>
      </div>`;
  }).join("");

  // Anima o preenchimento das barras
  requestAnimationFrame(() => {
    box.querySelectorAll(".sat-fill").forEach((f) => (f.style.width = f.dataset.fill + "%"));
  });
}

/** Pontos pulsantes do mapa, com tooltip ao passar o mouse */
function renderMapa() {
  const stage = $("mapStage");
  if (!stage) return;

  const tooltip = document.createElement("div");
  tooltip.className = "map-tooltip";
  stage.appendChild(tooltip);

  REGIOES.forEach((r) => {
    const ponto = document.createElement("div");
    ponto.className = "map-point lvl-" + r.risco;
    ponto.style.left = r.coordX + "%";
    ponto.style.top = r.coordY + "%";

    ponto.addEventListener("mouseenter", () => {
      tooltip.innerHTML = `<strong>${r.nome} / ${r.estado}</strong>${iconeRisco(r.tipoRisco)} ${r.tipoRisco} · ${r.risco}`;
      tooltip.style.left = r.coordX + "%";
      tooltip.style.top = r.coordY + "%";
      tooltip.classList.add("show");
    });
    ponto.addEventListener("mouseleave", () => tooltip.classList.remove("show"));

    stage.appendChild(ponto);
  });
}

/** Feed de leituras satelitais recentes */
function renderLeituras() {
  const box = $("leituras");
  if (!box) return;
  box.innerHTML = LEITURAS.map(
    (l) => `
    <div class="feed-item">
      <span class="feed-time">${l.hora}</span>
      <div class="feed-main">
        <strong>${l.dado}</strong>
        <small>${l.satelite} · ${l.regiao}</small>
      </div>
      <span class="badge ${l.risco}">${l.risco}</span>
    </div>`
  ).join("");
}

/** Ícone de tendência conforme a evolução do risco da região */
function iconeTendencia(t) {
  if (t === "subindo") return ic("trendUp") + " subindo";
  if (t === "caindo")  return ic("trendDown") + " recuando";
  return ic("trendFlat") + " estável";
}

/** Cartões detalhados de cada região monitorada */
function renderRegioesDashboard() {
  const box = $("regioesGrid");
  if (!box) return;
  box.innerHTML = REGIOES.map(
    (r) => `
    <div class="card card-hover region-card reveal">
      <div class="region-head">
        <div>
          <h3>${r.nome}</h3>
          <span class="uf">${r.estado} · Área ${r.area} · ${r.tipoRisco}</span>
        </div>
        <span class="badge ${r.risco}">${r.risco}</span>
      </div>
      <div class="region-stats">
        <div class="stat"><div class="k">Temperatura</div><div class="v">${r.temperatura}°C</div></div>
        <div class="stat"><div class="k">Umidade</div><div class="v">${r.umidade}%</div></div>
        <div class="stat"><div class="k">Chuva acum.</div><div class="v">${r.chuva} mm</div></div>
        <div class="stat"><div class="k">Vegetação (NDVI)</div><div class="v">${r.vegetacao.toFixed(2)}</div></div>
      </div>
      <div class="region-foot">
        <span class="trend-tag ${r.tendencia}">${iconeTendencia(r.tendencia)}</span>
        <span>Atualizado ${r.atualizado}</span>
      </div>
    </div>`
  ).join("");
}

/** Gráfico de barras (puro HTML/CSS/JS) com animação de altura */
function renderGrafico() {
  const box = $("grafico");
  if (!box) return;
  const maxValor = Math.max(...SERIE_RISCO.map((p) => p.valor));

  box.innerHTML = SERIE_RISCO.map(
    (p) => `
    <div class="chart-col">
      <div class="chart-bar" data-altura="${(p.valor / maxValor) * 100}"><span>${p.valor}</span></div>
      <div class="chart-label">${p.dia}</div>
    </div>`
  ).join("");

  requestAnimationFrame(() => {
    box.querySelectorAll(".chart-bar").forEach((bar) => (bar.style.height = bar.dataset.altura + "%"));
  });
}

/* ===================================================================
   E. CENTRAL DE ALERTAS
   =================================================================== */

const filtroAtual = { tipo: "Todos", nivel: "Todos" };

/** Renderiza os cartões de alerta aplicando os filtros ativos */
function renderAlertas() {
  const box = $("alertasGrid");
  if (!box) return;

  const lista = ALERTAS.filter((a) => {
    const okTipo = filtroAtual.tipo === "Todos" || a.tipo === filtroAtual.tipo;
    const okNivel = filtroAtual.nivel === "Todos" || a.nivel === filtroAtual.nivel;
    return okTipo && okNivel;
  });

  // Contador de resultados
  const contador = $("resultsCount");
  if (contador) {
    contador.textContent =
      lista.length === 0
        ? "Nenhum alerta corresponde aos filtros."
        : `${lista.length} ${lista.length === 1 ? "alerta encontrado" : "alertas encontrados"}.`;
  }

  if (!lista.length) {
    box.innerHTML = `<div class="card empty-state">Nenhum alerta encontrado para os filtros selecionados.</div>`;
    return;
  }

  box.innerHTML = lista
    .map(
      (a) => `
    <div class="card alert-card ${a.nivel} reveal">
      <div class="alert-top">
        <span class="alert-type">${iconeRisco(a.tipo)} ${a.tipo}</span>
        <span class="badge ${a.nivel}">${a.nivel}</span>
      </div>
      <div class="alert-region">${ic("pin")} ${a.regiao} — ${a.estado}</div>
      <p class="alert-msg">${a.mensagem}</p>
      <div class="alert-foot">
        <span>${a.data}</span>
        <span class="status-tag ${a.status}">${a.status}</span>
      </div>
    </div>`
    )
    .join("");

  // Reaplica a animação aos novos cartões
  initReveal();
}

/** Aplica um filtro vindo da URL (ex.: alertas.html?tipo=Queimada),
 *  usado pelos marcadores clicáveis do hero. */
function aplicarFiltroDaURL() {
  const painel = $("filtros");
  if (!painel) return;

  const params = new URLSearchParams(location.search);
  const tipo = params.get("tipo");
  const nivel = params.get("nivel");
  const tiposValidos = ["Enchente", "Queimada", "Seca", "Deslizamento"];
  const niveisValidos = ["Baixo", "Médio", "Alto", "Crítico"];

  // Atualiza o estado e marca o chip correspondente como ativo
  function aplicar(grupo, valor) {
    filtroAtual[grupo] = valor;
    painel.querySelectorAll(`.chip[data-grupo="${grupo}"]`).forEach((c) => {
      c.classList.toggle("active", c.dataset.valor === valor);
    });
  }

  if (tipo && tiposValidos.includes(tipo)) aplicar("tipo", tipo);
  if (nivel && niveisValidos.includes(nivel)) aplicar("nivel", nivel);
}

/** Liga os chips de filtro à atualização da lista */
function initFiltros() {
  const painel = $("filtros");
  if (!painel) return;

  painel.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const grupo = chip.dataset.grupo;
      // Apenas um chip ativo por grupo
      painel.querySelectorAll(`.chip[data-grupo="${grupo}"]`).forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      filtroAtual[grupo] = chip.dataset.valor;
      renderAlertas();
    });
  });
}

/** Botão "Simular envio de alerta" -> feedback visual via toast */
function initSimularAlerta() {
  const btn = $("btnSimular");
  if (!btn) return;
  btn.addEventListener("click", () => {
    mostrarToast(
      "Alerta transmitido com sucesso",
      "Notificação enviada à Defesa Civil e aos contatos cadastrados (simulação)."
    );
  });
}

/* ===================================================================
   F. CADASTRO DE REGIÕES
   =================================================================== */

const regioesCadastradas = []; // mantido em memória durante a sessão
let proximoIdRegiao = 1;        // gera ids únicos para identificar/excluir cada região

/** Renderiza os cartões das regiões cadastradas pelo usuário */
function renderRegioesCadastradas() {
  const box = $("listaCadastro");
  if (!box) return;

  if (!regioesCadastradas.length) {
    box.innerHTML = `<div class="card empty-state">Nenhuma região cadastrada ainda. Use o formulário acima para adicionar a primeira à malha de monitoramento.</div>`;
    return;
  }

  box.innerHTML = regioesCadastradas
    .map(
      (r) => `
    <div class="card card-hover region-card reveal">
      <div class="region-head">
        <div>
          <h3>${r.nome}</h3>
          <span class="uf">${r.estado} · Área ${r.area}</span>
        </div>
        <div class="region-actions">
          <span class="badge ${r.risco}">${r.risco}</span>
          <button class="region-remove" data-id="${r.id}" type="button" title="Excluir região" aria-label="Excluir região">${ic("close")}</button>
        </div>
      </div>
      <div class="region-stats">
        <div class="stat"><div class="k">População</div><div class="v">${Number(r.populacao).toLocaleString("pt-BR")}</div></div>
        <div class="stat"><div class="k">Risco predom.</div><div class="v" style="font-size:.95rem">${iconeRisco(r.tipoRisco)} ${r.tipoRisco}</div></div>
      </div>
    </div>`
    )
    .join("");

  // Liga o botão X de cada card à exclusão da região correspondente
  box.querySelectorAll(".region-remove").forEach((btn) => {
    btn.addEventListener("click", () => excluirRegiao(Number(btn.dataset.id)));
  });

  initReveal();
}

/** Remove uma região cadastrada pelo id, após confirmação do usuário */
async function excluirRegiao(id) {
  const i = regioesCadastradas.findIndex((r) => r.id === id);
  if (i === -1) return;
  const nome = regioesCadastradas[i].nome;

  const confirmado = await confirmar(
    "Excluir região?",
    `Tem certeza que deseja remover "${nome}" da malha de monitoramento? Esta ação não pode ser desfeita.`,
    "Excluir"
  );
  if (!confirmado) return;

  regioesCadastradas.splice(i, 1);
  renderRegioesCadastradas();
  mostrarToast("Região removida", `"${nome}" saiu da malha de monitoramento.`);
}

/** Marca/limpa o estado de erro de um campo */
function setErro(campo, mensagem) {
  const field = campo.closest(".field");
  field.querySelector(".error-msg").textContent = mensagem || "";
  field.classList.toggle("invalid", Boolean(mensagem));
}

/** Validação e submissão do formulário de cadastro */
function initFormCadastro() {
  const form = $("formRegiao");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const { nome, estado, area, populacao, tipoRisco } = form;
    let valido = true;

    // Validação simples: nenhum campo pode ficar vazio
    if (!nome.value.trim()) { setErro(nome, "Informe o nome da região."); valido = false; } else setErro(nome, "");
    if (!estado.value)      { setErro(estado, "Selecione o estado."); valido = false; } else setErro(estado, "");
    if (!area.value)        { setErro(area, "Selecione o tipo de área."); valido = false; } else setErro(area, "");
    if (!populacao.value || Number(populacao.value) <= 0) { setErro(populacao, "Informe uma população válida."); valido = false; } else setErro(populacao, "");
    if (!tipoRisco.value)   { setErro(tipoRisco, "Selecione o risco predominante."); valido = false; } else setErro(tipoRisco, "");

    if (!valido) return;

    // Nível inicial de risco coerente com o tipo escolhido
    const nivelPorTipo = { Enchente: "Médio", Queimada: "Alto", Seca: "Alto", Deslizamento: "Alto" };

    regioesCadastradas.unshift({
      id: proximoIdRegiao++,
      nome: nome.value.trim(),
      estado: estado.value,
      area: area.value,
      populacao: populacao.value,
      tipoRisco: tipoRisco.value,
      risco: nivelPorTipo[tipoRisco.value] || "Médio"
    });

    renderRegioesCadastradas();
    form.reset();
    mostrarToast("Região cadastrada", `"${regioesCadastradas[0].nome}" entrou na malha de monitoramento (simulação).`);
  });
}

/* ===================================================================
   G. TOAST REUTILIZÁVEL
   =================================================================== */

/** Modal de confirmação reutilizável. Retorna uma Promise<boolean>.
 *  Fecha em: Confirmar (true), Cancelar/Esc/clique fora (false). */
function confirmar(titulo, mensagem, textoConfirmar = "Confirmar") {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal" role="alertdialog" aria-modal="true" aria-label="${titulo}">
        <div class="modal-icon">${ic("warning")}</div>
        <h3 class="modal-title">${titulo}</h3>
        <p class="modal-msg">${mensagem}</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" data-act="cancel" type="button">Cancelar</button>
          <button class="btn btn-danger" data-act="confirm" type="button">${textoConfirmar}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("show"));

    // Foca o botão de confirmar para acesso por teclado
    overlay.querySelector('[data-act="confirm"]').focus();

    function fechar(resultado) {
      overlay.classList.remove("show");
      document.removeEventListener("keydown", aoTeclar);
      setTimeout(() => overlay.remove(), 250);
      resolve(resultado);
    }
    function aoTeclar(e) {
      if (e.key === "Escape") fechar(false);
      if (e.key === "Enter") fechar(true);
    }

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) return fechar(false); // clique no fundo
      const acao = e.target.closest("[data-act]");
      if (acao) fechar(acao.dataset.act === "confirm");
    });
    document.addEventListener("keydown", aoTeclar);
  });
}

function mostrarToast(titulo, descricao) {
  let toast = $("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div class="toast-icon">${ic("check")}</div>
    <div><strong>${titulo}</strong><small>${descricao}</small></div>`;

  toast.classList.remove("show");
  void toast.offsetWidth; // reinicia a animação
  toast.classList.add("show");

  clearTimeout(mostrarToast._timer);
  mostrarToast._timer = setTimeout(() => toast.classList.remove("show"), 4200);
}

/* ===================================================================
   H. INICIALIZAÇÃO
   =================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Chrome compartilhado
  renderHeader();
  renderFooter();
  renderIcons();      // ícones SVG nos elementos [data-icon] do HTML estático
  initStarfield();
  initHeroVisual();
  initCalibradorHero();

  // Dashboard
  renderMetricas();
  renderIndiceRisco();
  renderStatusOrbital();
  renderMapa();
  renderLeituras();
  renderRegioesDashboard();
  renderGrafico();

  // Alertas
  aplicarFiltroDaURL();  // lê ?tipo=... vindo dos marcadores do hero
  renderAlertas();
  initFiltros();
  initSimularAlerta();

  // Regiões
  renderRegioesCadastradas();
  initFormCadastro();

  // Animações por último (observa elementos já renderizados)
  initReveal();
});
