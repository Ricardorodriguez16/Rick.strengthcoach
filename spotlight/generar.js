#!/usr/bin/env node
'use strict';

// Arma los 7 slides del carrusel en HTML. Sin dependencias: node generar.js
const fs = require('fs');
const path = require('path');
const { esc } = require('./lib/formato');
const estilos = require('./plantillas/estilos');
const { portada, VARIANTES } = require('./plantillas/portada');
const { INTERIORES } = require('./plantillas/slides');

const RAIZ = __dirname;
const SALIDA = path.join(RAIZ, 'salida');

// Marca en el <body> cuántos píxeles se sale el contenido del margen inferior.
// render.js lo lee y avisa: un texto largo en datos.json no se cuela sin ruido.
const MEDIDA = `<script>
// Hay que esperar a las fuentes: medido con la tipografía de reserva, el texto
// ocupa menos y el slide parece caber cuando en el PNG sale cortado.
document.fonts.ready.then(function () {
  var slide = document.querySelector('.slide');
  if (!slide) return;
  var margen = parseFloat(getComputedStyle(slide).getPropertyValue('--MB')) || 76;
  var limite = slide.getBoundingClientRect().bottom - margen;
  var fondo = 0;
  slide.querySelectorAll('.interior *, .bloque *').forEach(function (el) {
    if (!el.offsetHeight) return;
    fondo = Math.max(fondo, el.getBoundingClientRect().bottom);
  });
  document.body.setAttribute('data-desborde', Math.max(0, Math.round(fondo - limite)));
});
</script>`;

const pagina = (titulo, cuerpo, clase = '') => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1080, initial-scale=1">
<title>${esc(titulo)}</title>
<style>${estilos}</style>
</head>
<body class="${clase}">
${cuerpo}
${clase === 'indice' ? '' : MEDIDA}
</body>
</html>
`;

const leer = (obj, ruta) => ruta.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

function indice(datos, archivos) {
  const tira = archivos.map(({ nombre, rotulo }) => `<figure>
      <div class="marco"><iframe src="${nombre}" scrolling="no"></iframe></div>
      <figcaption><a href="${nombre}">${esc(rotulo)}</a><br>${nombre}</figcaption>
    </figure>`).join('\n    ');

  const n = String(datos.serie.numero).padStart(2, '0');
  return pagina(`Athlete Spotlight N°${n}`, `
  <h1>Athlete Spotlight N°${n} · ${esc(datos.atleta.nombre)}</h1>
  <p class="sub">Portada en variante ${esc(datos.portada.variante)} · ${archivos.length} slides ·
     1080 × 1350 px. Para exportar los PNG: <code>node render.js</code></p>
  <div class="tira">
    ${tira}
  </div>`, 'indice');
}

// El pie de foto sale del mismo datos.json que los slides: si cambian los
// números en la tabla, cambian también en el texto que se publica.
function caption(d) {
  const n = d.slides.numeros;
  const marca = (f) => `${f.movimiento} ${f.antes} → ${f.ahora} kg (${f.delta})`;
  const cierre = d.slides.cierre;
  return [
    d.caption.gancho,
    '',
    d.slides.partida.cuerpo.replace(/<[^>]+>/g, ''),
    '',
    (n.filas || []).map(marca).join('\n'),
    n.total ? `${n.total.movimiento} ${n.total.antes} → ${n.total.ahora} kg (${n.total.delta})` : '',
    n.nota,
    '',
    cierre.cuerpo.replace(/<[^>]+>/g, ''),
    '',
    cierre.cta.texto.replace(/<[^>]+>/g, ''),
    '',
    d.caption.hashtags
  ].filter((l) => l !== null && l !== undefined).join('\n');
}

function main() {
  const datos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'datos.json'), 'utf8'));
  fs.rmSync(SALIDA, { recursive: true, force: true });
  fs.mkdirSync(SALIDA, { recursive: true });

  const n = String(datos.serie.numero).padStart(2, '0');
  const archivos = [];
  const escribir = (nombre, html, rotulo) => {
    fs.writeFileSync(path.join(SALIDA, nombre), html);
    archivos.push({ nombre, rotulo });
  };

  // Las tres portadas se generan siempre, para poder compararlas de verdad y
  // no de memoria. La que entra al carrusel es portada.variante.
  for (const v of VARIANTES) {
    escribir(`portada-${v.toLowerCase()}.html`,
      pagina(`Portada ${v}`, portada(datos, v)), `Portada · variante ${v}`);
  }

  const elegida = archivos.splice(VARIANTES.indexOf(datos.portada.variante), 1)[0];
  archivos.splice(0, VARIANTES.length - 1);            // las otras dos quedan solo en disco
  escribir('01-portada.html', fs.readFileSync(path.join(SALIDA, elegida.nombre), 'utf8'),
    '01 · Portada');

  INTERIORES.forEach(({ id, fn }, i) => {
    const orden = String(i + 2).padStart(2, '0');
    escribir(`${orden}-${id}.html`, pagina(`Slide ${orden}`, fn(datos, i + 2)),
      `${orden} · ${datos.slides[id].rotulo}`);
  });

  fs.writeFileSync(path.join(SALIDA, 'index.html'), indice(datos, archivos));
  fs.writeFileSync(path.join(SALIDA, 'caption.txt'), caption(datos) + '\n');

  console.log(`\nAthlete Spotlight N°${n} · ${archivos.length} slides en salida/`);
  archivos.forEach((a) => console.log('  · ' + a.rotulo.padEnd(26) + a.nombre));
  console.log(`\n  portada en uso: variante ${datos.portada.variante}` +
    `  (las otras dos quedan en salida/portada-*.html para comparar)`);
  console.log('  pie de foto:    salida/caption.txt');

  const pendientes = (datos.porConfirmar || []).filter((r) => leer(datos, r) != null);
  if (pendientes.length) {
    console.log('\nDatos de ejemplo — cámbialos en datos.json antes de publicar:');
    pendientes.forEach((r) => console.log('  · ' + r));
  }
  console.log('');
}

main();
