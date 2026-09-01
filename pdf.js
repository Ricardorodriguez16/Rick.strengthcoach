#!/usr/bin/env node
'use strict';

// Convierte los HTML de salida/ en PDF usando el Chrome que haya instalado.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SALIDA = path.join(__dirname, 'salida');
const PDFS = path.join(__dirname, 'pdf');

const CANDIDATOS = [
  process.env.CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
].filter(Boolean);

const navegador = CANDIDATOS.find((c) => fs.existsSync(c));
if (!navegador) {
  console.error('No se encontró Chrome. Indica la ruta con la variable CHROME:\n' +
    '  CHROME="/ruta/a/chrome" node pdf.js');
  process.exit(1);
}

const paginas = fs.readdirSync(SALIDA)
  .filter((f) => f.endsWith('.html') && f !== 'index.html');

if (!paginas.length) {
  console.error('No hay documentos en salida/. Ejecuta primero: node generar.js');
  process.exit(1);
}

fs.mkdirSync(PDFS, { recursive: true });
console.log(`\nUsando ${navegador}\n`);

for (const pagina of paginas) {
  const destino = path.join(PDFS, pagina.replace(/\.html$/, '.pdf'));
  execFileSync(navegador, [
    '--headless', '--disable-gpu', '--no-sandbox', '--no-pdf-header-footer',
    `--print-to-pdf=${destino}`,
    'file://' + path.join(SALIDA, pagina)
  ], { stdio: ['ignore', 'ignore', 'ignore'] });
  const kb = Math.round(fs.statSync(destino).size / 1024);
  console.log(`  · ${path.basename(destino).padEnd(42)} ${kb} KB`);
}

console.log(`\n${paginas.length} PDF en pdf/\n`);
