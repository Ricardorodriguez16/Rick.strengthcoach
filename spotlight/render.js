#!/usr/bin/env node
'use strict';

// Exporta cada slide a PNG 2160 × 2700 (1080 × 1350 @2x) con el Chrome que haya
// instalado. Sin Playwright ni dependencias:  node render.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SALIDA = path.join(__dirname, 'salida');
const PNG = path.join(__dirname, 'png');

const CANDIDATOS = [
  process.env.CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
].filter(Boolean);

const navegador = CANDIDATOS.find((c) => fs.existsSync(c));
if (!navegador) {
  console.error('No se encontró Chrome. Indica la ruta:  CHROME="/ruta/a/chrome" node render.js');
  process.exit(1);
}

// Los slides numerados son los del carrusel; portada-*.html son las tres
// variantes de portada, que se exportan también para poder compararlas.
const paginas = fs.readdirSync(SALIDA)
  .filter((f) => f.endsWith('.html') && f !== 'index.html')
  .sort();

if (!paginas.length) {
  console.error('No hay slides en salida/. Ejecuta primero:  node generar.js');
  process.exit(1);
}

fs.mkdirSync(PNG, { recursive: true });
console.log(`\nUsando ${navegador}\n`);

const desbordes = [];

for (const pagina of paginas) {
  const destino = path.join(PNG, pagina.replace(/\.html$/, '.png'));
  execFileSync(navegador, [
    '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=2',
    '--window-size=1080,1350',
    '--virtual-time-budget=3000',
    `--screenshot=${destino}`,
    'file://' + path.join(SALIDA, pagina)
  ], { stdio: ['ignore', 'ignore', 'ignore'] });
  const kb = Math.round(fs.statSync(destino).size / 1024);

  // El propio slide midió si se sale del margen inferior; aquí se lee.
  const dom = execFileSync(navegador, [
    '--headless', '--disable-gpu', '--no-sandbox', '--window-size=1080,1350',
    '--virtual-time-budget=2000', '--dump-dom',
    'file://' + path.join(SALIDA, pagina)
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const sobra = Number((dom.match(/data-desborde="(\d+)"/) || [])[1] || 0);
  if (sobra > 0) desbordes.push([pagina, sobra]);

  console.log(`  · ${path.basename(destino).padEnd(26)} ${String(kb).padStart(5)} KB` +
    (sobra ? `   ⚠ se sale ${sobra} px` : ''));
}

console.log(`\n${paginas.length} PNG en png/  ·  2160 × 2700 px`);
if (desbordes.length) {
  console.log('\nTexto que no cabe — acórtalo en datos.json o baja el cuerpo en plantillas/estilos.js:');
  desbordes.forEach(([p, px]) => console.log(`  · ${p.padEnd(26)} ${px} px por debajo del margen`));
}
console.log('');
