'use strict';

const fs = require('fs');
const path = require('path');
const estilos = require('./estilos');
const { esc, dato } = require('../lib/formato');

const RAIZ = path.join(__dirname, '..');
const cacheImagenes = new Map();

// Escudo y firmas se incrustan como data URI para que el HTML viaje solo
// (correo, PDF, impresión) sin depender de archivos sueltos.
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

function documento({ titulo, cuerpo, clase = '' }) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<style>${estilos}</style>
</head>
<body class="${clase}">
<div class="hoja">
${cuerpo}
</div>
</body>
</html>
`;
}

function encabezado(e, { consecutivo = '', fecha = '' } = {}) {
  const logo = imagenIncrustada(e.logo);
  const contacto = [
    e.direccion && `${e.direccion} · ${e.ciudad}, ${e.departamento}`,
    [e.telefono, e.correo].filter(Boolean).join(' · '),
    e.sitioWeb
  ].filter(Boolean).map(esc).join('<br>');

  return `<div class="encabezado">
  ${logo ? `<img src="${logo}" alt="Escudo de ${esc(e.nombre)}">` : ''}
  <div class="datos">
    <div class="nombre">${esc(e.nombre)}</div>
    ${e.lema ? `<div class="lema">${esc(e.lema)}</div>` : ''}
    <div class="contacto">NIT ${esc(dato(e.nit, 14))}<br>${contacto}</div>
  </div>
</div>
<div class="cintillo"><span>${esc(consecutivo)}</span><span>${esc(fecha)}</span></div>`;
}

function titulo(principal, sub = '') {
  return `<div class="titulo"><h1>${esc(principal)}</h1>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}</div>`;
}

// Firma del representante legal, sola o junto a la del contratista.
function firmas(e, contratista = null) {
  const f = e.firmante || {};

  const bloque = (firma, quien, lineas) => `<div class="firma-espacio">${
    firma ? `<img class="firma" src="${firma}" alt="Firma de ${esc(quien)}">` : ''
  }</div>
  <div class="rubrica">
    <div class="quien">${esc(quien)}</div>
    ${lineas.map(esc).join('<br>')}
  </div>`;

  const empleador = bloque(imagenIncrustada(f.firma), f.nombre || '', [
    f.cargo || 'Representante legal',
    `C.C. ${dato(f.documento, 14)}`,
    e.nombre
  ]);

  if (!contratista) {
    return `<table class="firmas"><tr>
      <td style="width:58%">${empleador}</td><td style="width:42%"></td>
    </tr></table>`;
  }

  const c = contratista;
  return `<table class="firmas"><tr>
    <td style="width:46%">${bloque(imagenIncrustada(c.firma), c.nombre || '', [
      `${c.tipoDocumento} ${dato(c.documento, 14)}`,
      c.rol || 'Contratista'
    ])}</td>
    <td style="width:8%"></td>
    <td style="width:46%">${empleador}</td>
  </tr></table>`;
}

module.exports = { documento, encabezado, titulo, firmas, imagenIncrustada };
