#!/usr/bin/env node
'use strict';

// Constancia deportiva del club: un HTML A4 con el logo y la firma incrustados.
const fs = require('fs');
const path = require('path');
const { esc, fechaLarga } = require('../lib/formato');

const DIAS = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
  'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
  'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis',
  'veintisiete', 'veintiocho', 'veintinueve', 'treinta', 'treinta y uno'];

// "2026-11-24" -> "a los veinticuatro (24) días del mes de noviembre de 2026"
function fechaSolemne(iso) {
  if (!iso) return '____________________';
  const [a, m, d] = iso.split('-').map(Number);
  const mes = fechaLarga(iso).split(' de ')[1];
  const art = d === 1 ? 'al' : 'a los';
  const dia = d === 1 ? 'un (1) día' : `${DIAS[d]} (${d}) días`;
  return `${art} ${dia} del mes de ${mes} de ${a}`;
}

const RAIZ = __dirname;
const datos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'datos-club.json'), 'utf8'));

function incrustar(ruta) {
  if (!ruta) return '';
  const abs = path.join(RAIZ, ruta);
  if (!fs.existsSync(abs)) { console.warn(`  aviso: falta la imagen ${ruta}`); return ''; }
  const tipo = path.extname(abs).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${tipo};base64,${fs.readFileSync(abs).toString('base64')}`;
}

const { club, firmante, deportista, documento } = datos;
const fecha = fechaLarga(documento.fechaExpedicion);
const contacto = [
  [club.ciudad, club.departamento].filter(Boolean).join(', '),
  [club.telefono, club.correo].filter(Boolean).join(' · ')
].filter(Boolean);

const ficha = [
  ['Deportista', deportista.nombre],
  ['Documento de identidad', `${deportista.tipoDocumento} ${deportista.documento}`],
  ['Club', club.nombre],
  ['Modalidad', deportista.modalidad],
  ['Condición', deportista.condicion]
];

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Constancia deportiva — ${esc(deportista.nombre)}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #eef0f3; color: #15161b;
         font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 11pt; line-height: 1.5; }
  .hoja { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; display: flex; flex-direction: column; }

  .banda { background: linear-gradient(135deg, #0f1b3a 0%, #1c2e5a 100%); color: #fff;
           padding: 12mm 18mm 10mm; display: flex; align-items: center; gap: 9mm; }
  .banda img { width: 26mm; height: 26mm; flex: none; border-radius: 3mm; }
  .banda .nombre { font-size: 17pt; font-weight: 800; letter-spacing: 1.1pt; line-height: 1.2; }
  .banda .lema { font-size: 9.5pt; color: #c3cbe0; margin-top: 2mm; letter-spacing: .4pt; }
  .banda .meta { font-size: 8.5pt; color: #9aa6c4; margin-top: 1.5mm; }
  .filo { height: 2.2mm; background: #f6b93b; }

  .cuerpo { flex: 1; padding: 11mm 18mm 0; }
  .cintillo { display: flex; justify-content: space-between; font-size: 8.5pt;
              color: #8a93a0; letter-spacing: .4pt; margin-bottom: 9mm; }
  .titulo { text-align: center; margin-bottom: 9mm; }
  .titulo h1 { font-size: 14pt; font-weight: 800; letter-spacing: 2.6pt; margin: 0; color: #1c2e5a; }
  .titulo .sub { font-size: 9.5pt; letter-spacing: 1.1pt; color: #464a56; margin-top: 2mm; }
  .titulo::after { content: ""; display: block; width: 28mm; height: 1.2mm; background: #f6b93b; margin: 4mm auto 0; }

  p { text-align: justify; margin: 0 0 4mm; }
  .destinatario { margin-bottom: 6mm; font-size: 10.5pt; }
  .certifica { text-align: center; font-weight: 800; letter-spacing: 5pt; color: #1c2e5a; margin: 7mm 0; }

  table.ficha { width: 100%; border-collapse: collapse; font-size: 10pt; margin: 0 0 6mm; }
  table.ficha td { border: .3mm solid #e1e4ea; padding: 2.6mm 4mm; vertical-align: top; }
  table.ficha td.rotulo { background: #f4f6f9; width: 36%; font-weight: 700; color: #1c2e5a; }
  ul.participaciones { margin: 0 0 5mm; padding-left: 6mm; }
  ul.participaciones li { margin-bottom: 2.2mm; text-align: justify; }

  .firma-bloque { margin-top: 14mm; width: 78mm; page-break-inside: avoid; }
  .firma-espacio { height: 20mm; display: flex; align-items: flex-end; }
  .firma-espacio img { max-height: 20mm; max-width: 44mm; margin-left: 4mm; }
  .rubrica { border-top: .4mm solid #15161b; padding-top: 2mm; font-size: 9.5pt; line-height: 1.5; }
  .rubrica .quien { font-size: 11pt; font-weight: 800; letter-spacing: .4pt; }
  .rubrica .cargo { color: #464a56; }

  .pie { margin-top: auto; padding: 8mm 18mm 9mm; }
  .pie .nota { border-top: .3mm solid #e1e4ea; padding-top: 3mm; font-size: 7.5pt;
               color: #7b8593; text-align: justify; line-height: 1.5; }
  .pie .marca { font-size: 7pt; color: #a6adb8; margin-top: 2.5mm; }

  @media print {
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { background: #fff; }
    .hoja { width: auto; box-shadow: none; }
  }
</style>
</head>
<body>
<div class="hoja">

  <div class="banda">
    ${incrustar(club.logo) ? `<img src="${incrustar(club.logo)}" alt="Logo de ${esc(club.nombre)}">` : ''}
    <div>
      <div class="nombre">${esc(club.nombre)}</div>
      ${club.lema ? `<div class="lema">${esc(club.lema)}</div>` : ''}
      ${contacto.length ? `<div class="meta">${contacto.map(esc).join(' · ')}${club.nit ? ' · NIT ' + esc(club.nit) : ''}</div>` : ''}
    </div>
  </div>
  <div class="filo"></div>

  <div class="cuerpo">
    <div class="cintillo"><span>${esc(documento.consecutivo)}</span><span>${esc(documento.ciudadExpedicion)}, ${esc(fecha)}</span></div>

    ${documento.dirigidoA ? `<div class="destinatario">Señores<br><strong>${esc(documento.dirigidoA)}</strong></div>` : ''}

    <div class="titulo">
      <h1>CONSTANCIA DEPORTIVA</h1>
      <div class="sub">PERTENENCIA AL CLUB Y PARTICIPACIÓN EN COMPETENCIA</div>
    </div>

    <p>El suscrito, <strong>${esc(firmante.nombre)}</strong>, identificado con ${esc(firmante.tipoDocumento)} ${esc(firmante.documento)},
    en su calidad de ${esc(firmante.cargo).toLowerCase()} del club <strong>${esc(club.nombre)}</strong>,</p>

    <div class="certifica">HACE CONSTAR</div>

    <p>Que <strong>${esc(deportista.nombre)}</strong>, identificado con ${esc(deportista.tipoDocumento)} ${esc(deportista.documento)},
    pertenece al club <strong>${esc(club.nombre)}</strong> como deportista de powerlifting, bajo entrenamiento y
    supervisión técnica de este club.</p>

    <table class="ficha">
      ${ficha.map(([r, v]) => `<tr><td class="rotulo">${esc(r)}</td><td>${esc(v)}</td></tr>`).join('\n      ')}
    </table>

    <p>Que, en representación del club, ha participado en las siguientes competencias:</p>

    <ul class="participaciones">
      ${deportista.participaciones.map((t) => `<li>${esc(t)}</li>`).join('\n      ')}
    </ul>

    <p>La presente constancia se expide ${esc(documento.motivo)}, en ${esc(documento.ciudadExpedicion)},
    ${esc(fechaSolemne(documento.fechaExpedicion))}.</p>

    <div class="firma-bloque">
      <div class="firma-espacio">${incrustar(firmante.firma) ? `<img src="${incrustar(firmante.firma)}" alt="Firma de ${esc(firmante.nombre)}">` : ''}</div>
      <div class="rubrica">
        <div class="quien">${esc(firmante.nombre)}</div>
        <div class="cargo">${esc(firmante.cargo)}</div>
        <div class="cargo">${esc(firmante.tipoDocumento)} ${esc(firmante.documento)}</div>
        <div class="cargo">${esc(club.nombre)}</div>
      </div>
    </div>
  </div>

  <div class="pie">
    <div class="nota">Documento expedido por el club deportivo a solicitud del interesado. Para verificar su
    autenticidad puede comunicarse con la dirección técnica del club.</div>
    <div class="marca">Hecho con EntrenArt · entrenart.app</div>
  </div>

</div>
</body>
</html>
`;

const salida = path.join(RAIZ, 'constancia-juan-manuel-de-la-hoz.html');
fs.writeFileSync(salida, html);
console.log('\n  · ' + path.relative(process.cwd(), salida) + '\n');
