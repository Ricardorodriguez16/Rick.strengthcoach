'use strict';

// Hoja de estilos común: pensada para imprimir / "Guardar como PDF" en A4.
module.exports = `
  @page { size: A4; margin: 13mm 16mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 18mm 0; background: #eceef1;
    font-family: "Times New Roman", Georgia, serif; font-size: 11pt; color: #1a1a1a;
    line-height: 1.38;
  }
  .hoja {
    width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff;
    padding: 16mm 18mm 14mm; box-shadow: 0 2px 10px rgba(0,0,0,.14);
  }

  /* Encabezado con escudo */
  .encabezado { display: flex; align-items: center; gap: 10mm;
                border-bottom: 2pt solid #1b3a75; padding-bottom: 7pt; margin-bottom: 5pt; }
  .encabezado img { width: 21mm; height: auto; flex: none; }
  .encabezado .datos { flex: 1; }
  .encabezado .nombre { font-size: 15.5pt; font-weight: 700; letter-spacing: .6pt; color: #1b3a75; }
  .encabezado .lema { font-style: italic; font-size: 10pt; color: #55606f; margin: 1pt 0 5pt; }
  .encabezado .contacto { font-size: 9pt; color: #55606f; line-height: 1.45; }
  .cintillo { font-size: 8.5pt; color: #8a93a0; letter-spacing: .4pt;
              display: flex; justify-content: space-between; margin-bottom: 14pt; }

  /* Títulos y párrafos */
  .titulo { text-align: center; margin: 12pt 0 3pt; }
  .titulo h1 { font-size: 13pt; font-weight: 700; letter-spacing: 2.5pt; margin: 0; }
  .titulo .sub { font-size: 10pt; letter-spacing: 1.2pt; color: #55606f; margin-top: 3pt; }
  .titulo::after { content: ""; display: block; width: 26mm; height: 1.5pt;
                   background: #1b3a75; margin: 6pt auto 11pt; }
  p { text-align: justify; margin: 0 0 9pt; }
  .destinatario { margin-bottom: 4pt; }
  .destinatario strong { letter-spacing: .8pt; }
  .certifica { text-align: center; font-weight: 700; letter-spacing: 4pt;
               margin: 13pt 0; color: #1b3a75; }

  /* Tablas */
  table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin: 0 0 10pt; }
  th, td { border: .5pt solid #c3c9d2; padding: 4pt 7pt; vertical-align: top; }
  th { background: #1b3a75; color: #fff; text-align: left; font-weight: 700;
       letter-spacing: .3pt; border-color: #1b3a75; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  tr.total td { font-weight: 700; background: #eaeef6; }
  tr.destacado td { font-weight: 700; background: #1b3a75; color: #fff; border-color: #1b3a75;
                    font-size: 11pt; letter-spacing: .3pt; }
  .ficha td.rotulo { background: #f4f6f9; width: 24%; font-weight: 700; color: #3b465a; }
  .ficha td { padding: 5pt 7pt; }
  .enletras { font-size: 9.5pt; font-style: italic; color: #55606f; }

  /* Firmas */
  .firmas { width: 100%; border: none; margin-top: 14pt; page-break-inside: avoid; }
  .firmas td { border: none; padding: 0; vertical-align: top; }
  .rubrica { border-top: .8pt solid #1a1a1a; padding-top: 5pt; font-size: 10pt; line-height: 1.45; }
  .rubrica .quien { font-size: 10.5pt; font-weight: 700; }
  .firma-espacio { height: 16mm; display: flex; align-items: flex-end; overflow: hidden; }
  .firma-espacio img.firma { max-height: 16mm; max-width: 46mm; margin: 0 0 -2mm 4mm; }

  .pie { margin-top: 12pt; border-top: .5pt solid #d4d9e0; padding-top: 6pt;
         font-size: 7.5pt; color: #7b8593; text-align: justify; line-height: 1.45; }
  .vacio { color: #9aa3b0; }

  /* Índice */
  .indice .hoja { min-height: 0; }
  .indice ul { list-style: none; padding: 0; margin: 0; }
  .indice li { border-bottom: .5pt solid #dde1e7; padding: 10pt 0; }
  .indice a { color: #1b3a75; text-decoration: none; font-size: 12pt; font-weight: 700; }
  .indice small { display: block; color: #6b7482; font-size: 9.5pt; font-family: Arial, sans-serif; }

  @media print {
    /* Conserva los fondos de las tablas al imprimir o exportar a PDF. */
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { background: #fff; padding: 0; }
    .hoja { box-shadow: none; padding: 0; width: auto; min-height: 0; }
  }
`;
