#!/usr/bin/env node
'use strict';

// Arma la portada en HTML.  node generar.js
const fs = require('fs');
const path = require('path');
const portada = require('./plantillas');

const RAIZ = __dirname;
const SALIDA = path.join(RAIZ, 'salida');

function main() {
  const d = JSON.parse(fs.readFileSync(path.join(RAIZ, 'datos.json'), 'utf8'));
  fs.mkdirSync(SALIDA, { recursive: true });

  const nombre = `portada-n${d.numero}.html`;
  fs.writeFileSync(path.join(SALIDA, nombre), portada(d));

  console.log(`\nAthlete Spotlight N°${d.numero} · salida/${nombre}`);
  console.log('Exporta el PNG con:  node render.js\n');
}

main();
