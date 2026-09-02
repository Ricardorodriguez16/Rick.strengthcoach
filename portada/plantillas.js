'use strict';

// Las cuatro opciones son la misma portada del N°7 —cuenta en dorado, titular
// blanco con el número de la entrega y bajada— movida de sitio o de tamaño.
// Ninguna añade datos que la del N°7 no tuviera.
const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const fuentes = fs.readFileSync(path.join(RAIZ, 'lib', 'fuentes.css'), 'utf8');

const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const foto = (ruta) => {
  const abs = path.join(RAIZ, ruta);
  return `data:image/jpeg;base64,${fs.readFileSync(abs).toString('base64')}`;
};

// Grano de película: le quita el plano digital al negro y a los degradados.
const GRANO = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
     <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
     <feColorMatrix type="saturate" values="0"/></filter>
     <rect width="200" height="200" filter="url(#g)" opacity="0.4"/>
   </svg>`);

const estilos = (f) => `
${fuentes}

:root{
  --hueso:#FFFFFF;
  --oro:#F2C14E;
  --tinta:#0A0A0B;
  --M:74px;
}
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#111;font-family:'Archivo',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}

.portada{position:relative;width:1080px;height:1350px;overflow:hidden;background:var(--tinta);}
.portada::after{content:'';position:absolute;inset:0;background-image:url("${GRANO}");
  background-size:200px 200px;mix-blend-mode:overlay;opacity:.42;pointer-events:none;z-index:60;}

.fondo{position:absolute;inset:0;overflow:hidden;}
.fondo img{width:100%;height:100%;object-fit:cover;display:block;
  object-position:${f.foco};transform:scale(${f.zoom});
  filter:grayscale(.55) contrast(1.14) brightness(${1 - f.oscurecer}) sepia(${f.calido});}
/* Igual que en el N°7: la foto va muy apagada para que el titular blanco
   respire. La viñeta cierra las esquinas y evita que el texto flote. */
.velo{position:absolute;inset:0;pointer-events:none;}
.velo.vineta{background:radial-gradient(115% 72% at 50% 44%,
  rgba(10,10,11,0) 26%, rgba(10,10,11,.62) 100%);}
.velo.abajo{background:linear-gradient(to top,
  rgba(10,10,11,.94) 0%, rgba(10,10,11,.74) 26%, rgba(10,10,11,.30) 52%, rgba(10,10,11,0) 78%);}
.velo.centro{background:linear-gradient(to bottom,
  rgba(10,10,11,0) 14%, rgba(10,10,11,.58) 40%, rgba(10,10,11,.58) 62%, rgba(10,10,11,0) 88%);}

.bloque{position:absolute;left:var(--M);right:var(--M);z-index:20;text-align:center;}
.bloque.medio{top:54%;transform:translateY(-50%);}
.bloque.bajo{bottom:150px;}

.cuenta{font-weight:800;font-size:27px;letter-spacing:.055em;color:var(--oro);
  margin-bottom:6px;text-shadow:0 3px 22px rgba(0,0,0,.7);}
.titular{font-weight:900;font-size:96px;line-height:.98;letter-spacing:-.012em;
  color:var(--hueso);text-shadow:0 6px 34px rgba(0,0,0,.62);}
/* Una sola línea de borde a borde, como en el N°7. */
.titular.linea{font-size:70px;letter-spacing:-.022em;white-space:nowrap;}
.bajada{font-weight:700;font-size:36px;letter-spacing:.018em;color:var(--hueso);
  margin-top:10px;text-shadow:0 3px 22px rgba(0,0,0,.7);}
.bajada.tenue{color:rgba(255,255,255,.86);}

.op-3 .titular{font-size:84px;}
.op-3 .titular .num{font-family:'Anton',sans-serif;font-weight:400;font-size:190px;
  line-height:1.02;letter-spacing:-.01em;display:inline-block;}
.op-4 .titular{font-size:88px;}

.oro{color:var(--oro);}
.filete{width:74px;height:4px;background:var(--oro);margin:0 auto 22px;}
`;

const pagina = (d, clase, cuerpo) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Athlete Spotlight N°${d.numero} · ${clase}</title>
<style>${estilos(d.foto)}</style>
</head>
<body>
<div class="portada ${clase}">
  <div class="fondo"><img src="${foto(d.foto.archivo)}" alt=""></div>
${cuerpo}
</div>
</body>
</html>
`;

const n = (d) => `${esc(d.titulo)} N°${d.numero}`;

// 1 · CALCO — la del N°7 tal cual, con la foto nueva.
const calco = (d) => pagina(d, 'op-1', `
  <div class="velo vineta"></div>
  <div class="velo centro"></div>
  <div class="bloque medio">
    <div class="cuenta">${esc(d.cuenta)}</div>
    <div class="titular linea">${n(d)}</div>
    <div class="bajada">${esc(d.subtitulo)}</div>
  </div>`);

// 2 · ABAJO — mismo bloque en el tercio inferior: se ve la cara y la barra.
const abajo = (d) => pagina(d, 'op-2', `
  <div class="velo vineta"></div>
  <div class="velo abajo"></div>
  <div class="bloque bajo">
    <div class="cuenta">${esc(d.cuenta)}</div>
    <div class="titular linea">${n(d)}</div>
    <div class="bajada">${esc(d.subtitulo)}</div>
  </div>`);

// 3 · DOS LÍNEAS — el titular parte y el número gana tamaño de cartel.
const dosLineas = (d) => pagina(d, 'op-3', `
  <div class="velo vineta"></div>
  <div class="velo centro"></div>
  <div class="bloque medio">
    <div class="cuenta">${esc(d.cuenta)}</div>
    <div class="titular grande">${esc(d.titulo)}<br><span class="num">N°${d.numero}</span></div>
    <div class="bajada tenue">${esc(d.subtitulo)}</div>
  </div>`);

// 4 · NÚMERO EN DORADO — la 1 con el N°8 en el acento de la cuenta.
const acento = (d) => pagina(d, 'op-4', `
  <div class="velo vineta"></div>
  <div class="velo centro"></div>
  <div class="bloque medio">
    <div class="cuenta">${esc(d.cuenta)}</div>
    <div class="filete"></div>
    <div class="titular">${esc(d.titulo)} <span class="oro">N°${d.numero}</span></div>
    <div class="bajada">${esc(d.subtitulo)}</div>
  </div>`);

module.exports = [
  { id: '1-calco', rotulo: 'Calco del N°7', fn: calco },
  { id: '2-abajo', rotulo: 'Texto abajo', fn: abajo },
  { id: '3-dos-lineas', rotulo: 'Titular en dos líneas', fn: dosLineas },
  { id: '4-acento', rotulo: 'Número en dorado', fn: acento }
];
