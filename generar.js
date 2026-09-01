#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { periodo, fechaLarga, esc } = require('./lib/formato');
const { documento, encabezado, titulo } = require('./plantillas/comun');
const certificacionContractual = require('./plantillas/certificacion');
const comprobanteHonorarios = require('./plantillas/comprobante');
const { certificadoRetenciones, certificacionAnioEnCurso } = require('./plantillas/retenciones');

const RAIZ = __dirname;
const SALIDA = path.join(RAIZ, 'salida');

const OBLIGATORIOS = [
  ['contratista.banco', 'banco donde se consigna el pago'],
  ['contratista.cuenta', 'número de cuenta'],
  ['contratante.telefono', 'teléfono de contacto de la institución'],
  ['contratante.correo', 'correo de contacto de la institución']
];

const leer = (obj, ruta) => ruta.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

function indice(datos, archivos) {
  const filas = archivos.map(({ nombre, rotulo, detalle }) => `<li>
      <a href="${nombre}">${esc(rotulo)}</a>
      <small>${esc(detalle)} · ${nombre}</small>
    </li>`).join('\n');

  const cuerpo = `
${encabezado(datos.contratante, { fecha: fechaLarga(datos.documento.fechaExpedicion) })}
${titulo('DOCUMENTACIÓN CONTRACTUAL', [datos.contratista.nombre, datos.documento.dirigidoA].filter(Boolean).join(' · '))}
<ul>${filas}</ul>
<div class="pie">Cada documento se imprime en A4 desde el navegador: Imprimir → Guardar como PDF,
sin encabezados ni pies de página. Para actualizar los datos, edita <code>datos.json</code> y vuelve
a ejecutar <code>node generar.js</code>.</div>
`;
  return documento({ titulo: 'Documentación contractual', cuerpo, clase: 'indice' });
}

function main() {
  const datos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'datos.json'), 'utf8'));
  fs.rmSync(SALIDA, { recursive: true, force: true });
  fs.mkdirSync(SALIDA, { recursive: true });

  const archivos = [];
  const escribir = (nombre, html, rotulo, detalle) => {
    fs.writeFileSync(path.join(SALIDA, nombre), html);
    archivos.push({ nombre, rotulo, detalle });
  };

  escribir('certificacion-contractual.html', certificacionContractual(datos),
    'Certificación contractual', 'Vínculo vigente, rol y honorarios mensuales');

  for (const ym of datos.periodos) {
    const p = periodo(ym);
    escribir(`comprobante-honorarios-${ym}.html`, comprobanteHonorarios(datos, p),
      `Comprobante de honorarios · ${p.nombre}`, 'Honorarios, retención y neto consignado');
  }

  const { anioGravable, anioEnCurso } = datos.retenciones;
  escribir(`certificado-ingresos-retenciones-${anioGravable}.html`, certificadoRetenciones(datos),
    `Certificado de ingresos y retenciones · ${anioGravable}`,
    'Artículo 381 del Estatuto Tributario');
  escribir(`certificacion-retencion-${anioEnCurso}.html`, certificacionAnioEnCurso(datos),
    `Certificación de retención en la fuente · ${anioEnCurso}`,
    'Depuración mensual del año en curso');

  fs.writeFileSync(path.join(SALIDA, 'index.html'), indice(datos, archivos));

  console.log(`\n${archivos.length} documentos generados en salida/ (más index.html)\n`);
  archivos.forEach((a) => console.log('  · ' + a.nombre));

  const faltantes = OBLIGATORIOS.filter(([ruta]) => !String(leer(datos, ruta) ?? '').trim());
  if (faltantes.length) {
    console.log('\nPendiente en datos.json — sale como línea en blanco en el documento:');
    faltantes.forEach(([ruta, desc]) => console.log(`  · ${ruta.padEnd(24)} ${desc}`));
  }
  console.log('');
}

main();
