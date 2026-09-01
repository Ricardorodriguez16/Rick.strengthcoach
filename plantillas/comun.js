'use strict';

const estilos = require('./estilos');
const { esc, dato } = require('../lib/formato');

function documento({ titulo, cuerpo }) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<style>${estilos}</style>
</head>
<body>
<div class="hoja">
${cuerpo}
</div>
</body>
</html>
`;
}

function encabezado(e) {
  const contacto = [e.direccion, e.ciudad && `${e.ciudad}, ${e.departamento}`, e.telefono, e.correo, e.sitioWeb]
    .filter(Boolean).map(esc).join(' &nbsp;·&nbsp; ');
  return `<div class="encabezado">
    <div class="nombre">${esc(e.nombre)}</div>
    <div class="lema">Sembrando ideales nobles en las nuevas generaciones</div>
    <div class="contacto">NIT ${esc(dato(e.nit, 14))} &nbsp;·&nbsp; ${contacto}</div>
  </div>`;
}

function firma(e) {
  const f = e.firmante || {};
  return `<div class="firma">
    <p>Cordialmente,</p>
    <div class="linea"></div>
    <div><strong>${esc(f.nombre || '')}</strong></div>
    <div class="rol">${esc(f.cargo || 'Representante Legal')}</div>
    <div class="rol">C.C. ${esc(dato(f.documento, 16))}</div>
    <div class="rol">${esc(e.nombre)} &nbsp;·&nbsp; NIT ${esc(dato(e.nit, 14))}</div>
  </div>`;
}

const aviso = (texto) => `<div class="aviso"><strong>Antes de imprimir:</strong> ${texto}
  Este bloque no aparece en la impresión.</div>`;

module.exports = { documento, encabezado, firma, aviso };
