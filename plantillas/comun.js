'use strict';

const fs = require('fs');
const path = require('path');
const estilos = require('./estilos');
const { esc, dato } = require('../lib/formato');

const RAIZ = path.join(__dirname, '..');
const cacheLogo = new Map();

// El escudo se incrusta como data URI para que el HTML viaje solo (correo, PDF, impresión).
function logoIncrustado(ruta) {
  if (!ruta) return '';
  if (cacheLogo.has(ruta)) return cacheLogo.get(ruta);
  let uri = '';
  try {
    const abs = path.join(RAIZ, ruta);
    const tipo = path.extname(abs).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
    uri = `data:${tipo};base64,${fs.readFileSync(abs).toString('base64')}`;
  } catch {
    console.warn(`  aviso: no se encontró el logo en ${ruta}`);
  }
  cacheLogo.set(ruta, uri);
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
  const logo = logoIncrustado(e.logo);
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

// Firma del representante legal, sola o junto a la del trabajador.
function firmas(e, trabajador = null) {
  const f = e.firmante || {};
  const empleador = `<div class="rubrica">
    <div class="quien">${esc(f.nombre || '')}</div>
    ${esc(f.cargo || 'Representante legal')}<br>
    C.C. ${esc(dato(f.documento, 14))}<br>
    ${esc(e.nombre)}
  </div>`;

  if (!trabajador) {
    return `<table class="firmas"><tr><td class="espacio-firma" style="width:58%"></td><td style="width:42%"></td></tr>
      <tr><td>${empleador}</td><td></td></tr></table>`;
  }

  const t = trabajador;
  return `<table class="firmas">
    <tr><td class="espacio-firma" style="width:46%"></td><td style="width:8%"></td><td style="width:46%"></td></tr>
    <tr>
      <td><div class="rubrica">
        <div class="quien">${esc(t.nombre || '')}</div>
        ${esc(t.tipoDocumento)} ${esc(dato(t.documento, 14))}<br>
        ${esc(t.rol || 'Trabajador')}
      </div></td>
      <td></td>
      <td>${empleador}</td>
    </tr>
  </table>`;
}

module.exports = { documento, encabezado, titulo, firmas, logoIncrustado };
