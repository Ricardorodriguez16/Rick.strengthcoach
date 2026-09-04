#!/usr/bin/env node
'use strict';

// Exporta manual.html a PDF con el Chrome instalado. A4 apaisado, sin encabezados del navegador.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ORIGEN = path.join(__dirname, 'manual.html');
const DESTINO = path.join(__dirname, 'pdf', 'Manual_derecho_societario_y_empresarial.pdf');

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
  console.error('No se encontró Chrome. Indica la ruta:  CHROME="/ruta/a/chrome" node exportar.js');
  process.exit(1);
}

fs.mkdirSync(path.dirname(DESTINO), { recursive: true });
execFileSync(navegador, [
  '--headless', '--disable-gpu', '--no-sandbox', '--no-pdf-header-footer',
  '--virtual-time-budget=6000',
  `--print-to-pdf=${DESTINO}`,
  'file://' + ORIGEN
], { stdio: ['ignore', 'ignore', 'inherit'] });

const kb = Math.round(fs.statSync(DESTINO).size / 1024);
console.log(`\n  ${path.relative(process.cwd(), DESTINO)}  ·  ${kb} KB\n`);
