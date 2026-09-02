#!/usr/bin/env node
'use strict';

// Exporta las portadas a PNG 2160 × 2700 (1080 × 1350 @2x) con el Chrome que
// haya instalado. Sin dependencias:  node render.js
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

const paginas = fs.readdirSync(SALIDA).filter((f) => f.endsWith('.html')).sort();
if (!paginas.length) {
  console.error('No hay portadas en salida/. Ejecuta primero:  node generar.js');
  process.exit(1);
}

fs.mkdirSync(PNG, { recursive: true });
console.log(`\nUsando ${navegador}\n`);

for (const pagina of paginas) {
  const destino = path.join(PNG, pagina.replace(/\.html$/, '.png'));
  execFileSync(navegador, [
    '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=2', '--window-size=1080,1350',
    '--virtual-time-budget=3000', `--screenshot=${destino}`,
    'file://' + path.join(SALIDA, pagina)
  ], { stdio: ['ignore', 'ignore', 'ignore'] });
  console.log(`  · ${path.basename(destino).padEnd(28)} ${Math.round(fs.statSync(destino).size / 1024)} KB`);
}

console.log(`\n${paginas.length} PNG en png/  ·  2160 × 2700 px\n`);
