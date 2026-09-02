'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const cacheImagenes = new Map();

const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Las fotos viajan dentro del HTML para que un slide se pueda abrir, mandar o
// renderizar sin arrastrar la carpeta de activos detrás.
function imagenIncrustada(ruta) {
  if (!ruta) return '';
  if (cacheImagenes.has(ruta)) return cacheImagenes.get(ruta);
  let uri = '';
  try {
    const abs = path.join(RAIZ, ruta);
    const tipo = path.extname(abs).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
    uri = `data:${tipo};base64,${fs.readFileSync(abs).toString('base64')}`;
  } catch {
    console.warn(`  aviso: no se encontró la imagen ${ruta}`);
  }
  cacheImagenes.set(ruta, uri);
  return uri;
}

// Encuadre de una foto dentro del marco 4:5 sin recortarla en un editor:
// foco mueve la ventana visible, zoom acerca. Se ajustan desde datos.json.
function encuadre(foto = {}) {
  const { foco = '50% 60%', zoom = 1 } = foto;
  return `object-position:${foco};transform:scale(${zoom});`;
}

const cifra = (n) => (n == null || n === '' ? '—' : String(n));

// Anton dibuja las tildes muy por encima de la altura de mayúscula. Con
// interlineado cerrado la tilde de una línea cae dentro de la letra blanca de
// la línea anterior y la palabra se acaba leyendo sin tilde: RIOS por RÍOS.
// Cuando el titular lleva tildes se abre el interlineado; si no, se mantiene
// el cierre de cartel.
const TILDES = /[ÁÉÍÓÚÜÑáéíóúüñ]/;
const holgado = (texto) => (TILDES.test(String(texto)) ? ' holgado' : '');

// 210 kg en dos piezas para poder componer el número grande y la unidad chica.
function marca(valor, unidad = 'kg') {
  if (valor == null || valor === '') return { valor: '—', unidad: '' };
  return { valor: String(valor), unidad };
}

module.exports = { esc, imagenIncrustada, encuadre, cifra, marca, holgado, RAIZ };
