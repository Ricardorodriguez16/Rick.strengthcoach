'use strict';

// Calco de la portada del N°7: cuenta en dorado pegada encima, titular blanco
// en una sola línea de borde a borde con el número de la entrega, y la bajada
// debajo. Todo centrado y a media altura. Lo único que cambia entre entregas
// es la foto y el número.
const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const fuentes = fs.readFileSync(path.join(RAIZ, 'lib', 'fuentes.css'), 'utf8');

const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const foto = (ruta) =>
  `data:image/jpeg;base64,${fs.readFileSync(path.join(RAIZ, ruta)).toString('base64')}`;

const estilos = (f) => `
${fuentes}

:root{
  --hueso:#FFFFFF;
  --oro:#EFC04A;
  --tinta:#0A0A0B;
}
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#111;font-family:'Archivo',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}

.portada{position:relative;width:1080px;height:1350px;overflow:hidden;background:var(--tinta);}

.fondo{position:absolute;inset:0;overflow:hidden;}
.fondo img{
  width:100%;height:100%;object-fit:cover;display:block;
  object-position:${f.foco};transform:scale(${f.zoom});
  /* La foto se apaga como en el N°7 para que el titular blanco no pelee. */
  filter:contrast(1.10) saturate(${f.saturacion}) brightness(${1 - f.oscurecer}) sepia(${f.calido});
}
.velo{position:absolute;inset:0;pointer-events:none;}
.velo.vineta{background:radial-gradient(112% 70% at 50% 46%,
  rgba(10,10,11,0) 24%, rgba(10,10,11,.66) 100%);}
.velo.banda{background:linear-gradient(to bottom,
  rgba(10,10,11,0) 18%, rgba(10,10,11,.50) 40%, rgba(10,10,11,.50) 62%, rgba(10,10,11,0) 84%);}

/* Bloque de texto: centrado en los dos ejes, como el N°7. */
.bloque{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);
  z-index:20;text-align:center;}

.cuenta{
  font-weight:800;font-size:22px;letter-spacing:.02em;color:var(--oro);
  margin-bottom:3px;text-shadow:0 3px 20px rgba(0,0,0,.75);
}
.titular{
  font-weight:900;font-size:69px;line-height:1;letter-spacing:-.026em;
  white-space:nowrap;color:var(--hueso);text-shadow:0 6px 32px rgba(0,0,0,.66);
}
.bajada{
  font-weight:700;font-size:35px;letter-spacing:.012em;color:var(--hueso);
  margin-top:10px;text-shadow:0 3px 20px rgba(0,0,0,.75);
}
/* El número de la entrega en el dorado de la cuenta (numeroEnDorado). */
.titular .oro{color:var(--oro);}
`;

function portada(d) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Athlete Spotlight N°${d.numero}</title>
<style>${estilos(d.foto)}</style>
</head>
<body>
<div class="portada">
  <div class="fondo"><img src="${foto(d.foto.archivo)}" alt=""></div>
  <div class="velo vineta"></div>
  <div class="velo banda"></div>
  <div class="bloque">
    <div class="cuenta">${esc(d.cuenta)}</div>
    <div class="titular">${esc(d.titulo)} <span class="${d.numeroEnDorado ? 'oro' : ''}">N°${d.numero}</span></div>
    <div class="bajada">${esc(d.subtitulo)}</div>
  </div>
</div>
</body>
</html>
`;
}

module.exports = portada;
