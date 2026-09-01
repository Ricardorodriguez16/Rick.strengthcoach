'use strict';

// Hoja de estilos común: pensada para imprimir / "Guardar como PDF" en A4.
module.exports = `
  @page { size: A4; margin: 20mm 18mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 20mm 18mm; background: #f2f2f2;
    font-family: "Times New Roman", Georgia, serif; font-size: 12pt; color: #111;
    line-height: 1.55;
  }
  .hoja {
    max-width: 190mm; margin: 0 auto; background: #fff; padding: 14mm 14mm 10mm;
    box-shadow: 0 1px 6px rgba(0,0,0,.18);
  }
  .encabezado { text-align: center; border-bottom: 1.5pt solid #14387f; padding-bottom: 8pt; margin-bottom: 18pt; }
  .encabezado .nombre { font-size: 15pt; font-weight: 700; letter-spacing: .5pt; color: #14387f; }
  .encabezado .lema { font-style: italic; font-size: 10pt; color: #444; margin-top: 2pt; }
  .encabezado .contacto { font-size: 9.5pt; color: #444; margin-top: 4pt; }
  .titulo { text-align: center; font-size: 13pt; font-weight: 700; letter-spacing: 1.5pt;
            text-decoration: underline; margin: 22pt 0 18pt; }
  .consecutivo { text-align: right; font-size: 10pt; color: #555; }
  p { text-align: justify; margin: 0 0 11pt; }
  .certifica { text-align: center; font-weight: 700; letter-spacing: 3pt; margin: 16pt 0; }
  table { width: 100%; border-collapse: collapse; font-size: 10.5pt; margin-bottom: 12pt; }
  th, td { border: .5pt solid #999; padding: 4pt 6pt; vertical-align: top; }
  th { background: #eef1f7; text-align: left; font-weight: 700; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  tr.total td { font-weight: 700; background: #eef1f7; }
  .ficha td:nth-child(odd) { background: #f7f8fa; width: 22%; font-weight: 700; }
  .firma { margin-top: 46pt; }
  .firma .linea { border-top: .8pt solid #111; width: 62mm; margin-bottom: 4pt; }
  .firma .rol { font-size: 10.5pt; }
  .pie { margin-top: 20pt; border-top: .5pt solid #bbb; padding-top: 6pt;
         font-size: 8.5pt; color: #666; text-align: justify; }
  .aviso { background: #fff8e1; border: .5pt solid #e0c069; padding: 8pt 10pt;
           font-size: 9pt; color: #5c4600; margin-bottom: 14pt; }
  .vacio { color: #b00020; }
  @media print {
    body { background: #fff; padding: 0; }
    .hoja { box-shadow: none; padding: 0; max-width: none; }
    .aviso { display: none; }
  }
`;
