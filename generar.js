#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { periodo } = require('./lib/formato');
const constanciaLaboral = require('./plantillas/constancia');
const desprendible = require('./plantillas/desprendible');
const { certificadoIngresosRetenciones, certificacionNoRetencion } = require('./plantillas/retenciones');

const RAIZ = __dirname;
const SALIDA = path.join(RAIZ, 'salida');

const OBLIGATORIOS = [
  ['empleador.nit', 'NIT de la institución'],
  ['empleador.firmante.nombre', 'nombre de quien firma'],
  ['empleado.nombre', 'nombre del(la) trabajador(a)'],
  ['empleado.documento', 'número de documento'],
  ['empleado.cargo', 'cargo'],
  ['empleado.fechaIngreso', 'fecha de ingreso']
];

const leer = (obj, ruta) => ruta.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

function main() {
  const datos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'datos.json'), 'utf8'));
  fs.mkdirSync(SALIDA, { recursive: true });

  const archivos = [];
  const escribir = (nombre, html) => {
    fs.writeFileSync(path.join(SALIDA, nombre), html);
    archivos.push(nombre);
  };

  escribir('constancia-laboral.html', constanciaLaboral(datos));

  for (const ym of datos.periodos) {
    escribir(`desprendible-nomina-${ym}.html`, desprendible(datos, periodo(ym)));
  }

  escribir(
    `certificado-ingresos-retenciones-${datos.retenciones.anioGravable}.html`,
    certificadoIngresosRetenciones(datos)
  );
  escribir(
    `certificacion-no-retencion-${datos.retenciones.anioEnCurso}.html`,
    certificacionNoRetencion(datos)
  );

  console.log(`Generados ${archivos.length} documentos en salida/`);
  archivos.forEach((a) => console.log('  · ' + a));

  const faltantes = OBLIGATORIOS.filter(([ruta]) => !String(leer(datos, ruta) ?? '').trim());
  if (faltantes.length) {
    console.log('\nFaltan datos en datos.json (aparecen como guiones en el documento):');
    faltantes.forEach(([ruta, desc]) => console.log(`  · ${ruta} — ${desc}`));
    process.exitCode = 0;
  }
}

main();
