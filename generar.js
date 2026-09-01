#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { periodo, fechaLarga, esc } = require('./lib/formato');
const { documento, encabezado, titulo } = require('./plantillas/comun');
const constanciaLaboral = require('./plantillas/constancia');
const desprendible = require('./plantillas/desprendible');
const { certificadoIngresosRetenciones, certificacionNoRetencion } = require('./plantillas/retenciones');

const RAIZ = __dirname;
const SALIDA = path.join(RAIZ, 'salida');

const OBLIGATORIOS = [
  ['empleado.nombre', 'nombre completo'],
  ['empleado.genero', 'género, "F" o "M" (define la redacción)'],
  ['empleado.documento', 'número de cédula'],
  ['empleado.cargo', 'cargo que desempeña'],
  ['empleado.fechaIngreso', 'fecha de ingreso, formato AAAA-MM-DD'],
  ['empleado.eps', 'EPS'],
  ['empleado.fondoPension', 'fondo de pensiones'],
  ['empleador.telefono', 'teléfono de contacto de la institución']
];

const leer = (obj, ruta) => ruta.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

function indice(datos, archivos) {
  const e = datos.empleador;
  const filas = archivos.map(({ nombre, rotulo, detalle }) => `<li>
      <a href="${nombre}">${esc(rotulo)}</a>
      <small>${esc(detalle)} · ${nombre}</small>
    </li>`).join('\n');

  const cuerpo = `
${encabezado(e, { fecha: fechaLarga(datos.constancia.fechaExpedicion) })}
${titulo('DOCUMENTACIÓN LABORAL', esc(datos.empleado.nombre || 'Sin diligenciar'))}
<ul>${filas}</ul>
<div class="pie">Cada documento se imprime en A4 desde el navegador: Imprimir → Guardar como PDF,
sin encabezados ni pies de página. Para actualizar los datos, edita <code>datos.json</code> y vuelve
a ejecutar <code>node generar.js</code>.</div>
`;
  return documento({ titulo: 'Documentación laboral', cuerpo, clase: 'indice' });
}

function main() {
  const datos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'datos.json'), 'utf8'));
  fs.mkdirSync(SALIDA, { recursive: true });

  const archivos = [];
  const escribir = (nombre, html, rotulo, detalle) => {
    fs.writeFileSync(path.join(SALIDA, nombre), html);
    archivos.push({ nombre, rotulo, detalle });
  };

  escribir('constancia-laboral.html', constanciaLaboral(datos),
    'Constancia laboral', 'Vínculo vigente, cargo y asignación mensual');

  for (const ym of datos.periodos) {
    const p = periodo(ym);
    escribir(`desprendible-nomina-${ym}.html`, desprendible(datos, p),
      `Desprendible de nómina · ${p.nombre}`, 'Devengados, deducciones y neto pagado');
  }

  const { anioGravable, anioEnCurso } = datos.retenciones;
  escribir(`certificado-ingresos-retenciones-${anioGravable}.html`,
    certificadoIngresosRetenciones(datos),
    `Certificado de ingresos y retenciones · ${anioGravable}`,
    'Artículos 378 y 379 del Estatuto Tributario');
  escribir(`certificacion-no-retencion-${anioEnCurso}.html`,
    certificacionNoRetencion(datos),
    `Certificación de retención en la fuente · ${anioEnCurso}`,
    'Opcional, para trámites que piden el año en curso');

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
