#!/usr/bin/env node
'use strict';

// Arma las opciones de portada en HTML.  node generar.js
const fs = require('fs');
const path = require('path');
const opciones = require('./plantillas');

const RAIZ = __dirname;
const SALIDA = path.join(RAIZ, 'salida');

function main() {
  const d = JSON.parse(fs.readFileSync(path.join(RAIZ, 'datos.json'), 'utf8'));
  fs.rmSync(SALIDA, { recursive: true, force: true });
  fs.mkdirSync(SALIDA, { recursive: true });

  for (const { id, rotulo, fn } of opciones) {
    fs.writeFileSync(path.join(SALIDA, `opcion-${id}.html`), fn(d));
    console.log(`  · opcion-${id}.html`.padEnd(34) + rotulo);
  }
  console.log(`\n${opciones.length} opciones de portada para el N°${d.numero} en salida/`);
  console.log('Exporta los PNG con:  node render.js\n');
}

main();
