#!/usr/bin/env node
'use strict';

// Exporta post.html a PNG de 1080 × 1350 (formato vertical de Instagram).
// Usa Playwright: el --screenshot de Chrome recorta el viewport y deja la parte baja sin pintar.
const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Falta Playwright. Instálalo con: npm i -g playwright && npx playwright install chromium\n' +
    'y ejecuta: NODE_PATH="$(npm root -g)" node render.js');
  process.exit(1);
}

(async () => {
  const destino = path.resolve(__dirname, process.argv[2] || 'alan-cabrera-sudamericano.png');
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 1080, height: 1350 } });
  await pagina.goto('file://' + path.join(__dirname, 'post.html'));
  await pagina.waitForFunction(() => document.body.dataset.listo === '1');
  await pagina.screenshot({ path: destino });
  await navegador.close();
  console.log(path.basename(destino));
})();
