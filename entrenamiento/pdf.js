#!/usr/bin/env node
'use strict';

// Exporta plan-5-dias.html a PDF: incrusta las fuentes de Google como data URI
// (el HTML publicado las carga por enlace, pero el PDF tiene que ser autónomo)
// y renderiza con el Chrome que haya instalado.  Node 18+, sin dependencias.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const FUENTE = path.join(__dirname, 'plan-5-dias.html');
const DESTINO = path.join(__dirname, 'plan-5-dias.pdf');

// API v1 de Google Fonts: sirve una instancia estática por peso.  Las fuentes
// variables de la v2 se renderizan con el peso mínimo en Chrome headless.
const FAMILIAS = [
  'Bricolage+Grotesque:600,800',
  'Public+Sans:400,400i,600',
  'IBM+Plex+Mono:400,500,600'
];
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/120.0.0.0 Safari/537.36';

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

async function caras() {
  const vistas = new Set();
  const bloques = [];
  for (const familia of FAMILIAS) {
    const css = await (await fetch(
      `https://fonts.googleapis.com/css?family=${familia}&display=swap`,
      { headers: { 'User-Agent': UA } }
    )).text();
    const re = /\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[\s\S]*?\})/g;
    for (const [, subset, bloque] of css.matchAll(re)) {
      if (subset !== 'latin' && subset !== 'latin-ext') continue;
      const url = bloque.match(/url\((https:\/\/[^)]+)\)/)[1];
      if (vistas.has(url)) continue;
      vistas.add(url);
      const woff2 = Buffer.from(await (await fetch(url)).arrayBuffer());
      bloques.push(bloque.replace(/url\(https:\/\/[^)]+\)/,
        `url(data:font/woff2;base64,${woff2.toString('base64')})`));
    }
  }
  return bloques;
}

(async () => {
  const navegador = CANDIDATOS.find((c) => fs.existsSync(c));
  if (!navegador) {
    console.error('No se encontró Chrome. Indica la ruta con la variable CHROME:\n' +
      '  CHROME="/ruta/a/chrome" node entrenamiento/pdf.js');
    process.exit(1);
  }

  const bloques = await caras();
  const html = fs.readFileSync(FUENTE, 'utf8').replace(
    /<link rel="preconnect"[\s\S]*?<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^"]*">/,
    `<style>\n${bloques.join('\n')}\n</style>`
  );

  // El HTML se publica dentro de un esqueleto que ya trae <meta charset>; aquí no.
  const temporal = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'plan-')), 'plan.html');
  fs.writeFileSync(temporal, `<meta charset="utf-8">\n${html}`);

  execFileSync(navegador, [
    '--headless', '--disable-gpu', '--no-sandbox', '--no-pdf-header-footer',
    '--virtual-time-budget=10000',
    `--print-to-pdf=${DESTINO}`,
    'file://' + temporal
  ], { stdio: ['ignore', 'ignore', 'ignore'] });
  fs.rmSync(path.dirname(temporal), { recursive: true, force: true });

  console.log(`\n  ${bloques.length} fuentes incrustadas`);
  console.log(`  ${path.relative(process.cwd(), DESTINO)} · ` +
    `${Math.round(fs.statSync(DESTINO).size / 1024)} KB\n`);
})();
