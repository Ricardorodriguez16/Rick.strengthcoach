'use strict';

const { documento, encabezado, titulo, firmas } = require('./comun');
const { moneda, monedaEnLetras, fechaLarga, dato, esc, concordancia, mesesEnAnio } = require('../lib/formato');
const { retencionHonorarios } = require('../lib/retencion');

function consolidar(d) {
  const { contrato: k, retencion: cfg, retenciones: r } = d;
  const meses = mesesEnAnio(k.fechaInicio, r.anioGravable);
  const totalPagos = r.totalPagos ?? Math.round(k.honorariosMensuales * meses);

  const mes = retencionHonorarios({
    honorarios: k.honorariosMensuales,
    uvt: r.uvtAnioGravable,
    salarioMinimo: cfg.salarioMinimoAnioGravable,
    modo: cfg.modo,
    tarifa: cfg.tarifaHonorarios
  });

  return {
    meses,
    totalPagos,
    retencion: r.retencionPracticada ?? Math.round(mes.retencion * meses),
    mes
  };
}

// Certificado de retenciones — contenido del art. 381 del Estatuto Tributario.
function certificadoRetenciones(d) {
  const { contratante: e, contratista: c, contrato: k, retenciones: r, documento: doc } = d;
  const v = consolidar(d);
  const g = concordancia(c.genero);
  const rotulo = (rot, val) => `<td class="rotulo">${rot}</td><td>${val}</td>`;

  const cuerpo = `
${encabezado(e, { consecutivo: `Año gravable ${r.anioGravable}`, fecha: `${doc.ciudadExpedicion}, ${fechaLarga(doc.fechaExpedicion)}` })}

${titulo('CERTIFICADO DE INGRESOS Y RETENCIONES', `HONORARIOS · AÑO GRAVABLE ${r.anioGravable}`)}

<table class="ficha">
  <tr>${rotulo('Agente retenedor', esc(e.nombre))}${rotulo('NIT', esc(dato(e.nit, 14)))}</tr>
  <tr>${rotulo('Dirección', `${esc(e.direccion)}, ${esc(e.ciudad)} (${esc(e.departamento)})`)}
      ${rotulo('Ciudad donde se consignó la retención', esc(r.ciudadConsignacion || e.ciudad))}</tr>
  <tr>${rotulo('Beneficiario del pago', esc(dato(c.nombre, 28)))}
      ${rotulo('Identificación', `${esc(c.tipoDocumento)} ${esc(dato(c.documento, 12))}`)}</tr>
  <tr>${rotulo('Concepto', `Honorarios · ${esc(k.rol)}`)}
      ${rotulo('Periodo certificado', `${fechaLarga(k.fechaInicio)} a 31 de diciembre de ${r.anioGravable}`)}</tr>
</table>

<table>
  <tr><th>Pagos o abonos en cuenta del año gravable ${r.anioGravable}</th><th class="num" style="width:28%">Valor</th></tr>
  <tr><td>Honorarios por prestación de servicios profesionales</td>
      <td class="num">${moneda(v.totalPagos)}</td></tr>
  <tr><td>Otros conceptos</td><td class="num">${moneda(0)}</td></tr>
  <tr class="total"><td>Total de pagos sujetos a retención</td>
      <td class="num">${moneda(v.totalPagos)}</td></tr>
</table>

<table>
  <tr class="destacado"><td>RETENCIÓN EN LA FUENTE PRACTICADA POR HONORARIOS</td>
      <td class="num" style="width:28%">${moneda(v.retencion)}</td></tr>
  <tr><td colspan="2" class="enletras">${monedaEnLetras(v.retencion)}</td></tr>
</table>

<p>${v.retencion === 0
  ? `Durante el año gravable ${r.anioGravable} no se practicó retención en la fuente
     ${esc(g.aSenor)} aquí ${esc(g.identificado)}: sus honorarios se someten a la tabla del artículo
     383 del Estatuto Tributario, y la base gravable mensual depurada
     (${moneda(v.mes.baseGravable)}, equivalente a ${v.mes.baseUvt} UVT) no alcanzó las 95 UVT desde
     las que esa tabla empieza a aplicar.`
  : `Los valores retenidos fueron declarados y consignados a la Dirección de Impuestos y Aduanas
     Nacionales dentro de los plazos legales.`}</p>

<p>Este certificado se expide en ${esc(doc.ciudadExpedicion)} el ${fechaLarga(doc.fechaExpedicion)},
en cumplimiento del artículo 381 del Estatuto Tributario.</p>

${firmas(e)}

<div class="pie">Certificado expedido con el contenido que exige el artículo 381 del Estatuto
Tributario para retenciones por conceptos distintos a los de una relación laboral. Requiere la firma
del pagador para su validez.</div>
`;

  return documento({
    titulo: `Ingresos y retenciones ${r.anioGravable} — ${c.nombre || 'sin diligenciar'}`,
    cuerpo
  });
}

// Situación del año en curso, cuando el trámite no acepta el certificado del año anterior.
function certificacionAnioEnCurso(d) {
  const { contratante: e, contratista: c, contrato: k, retencion: cfg, retenciones: r, documento: doc } = d;
  const g = concordancia(c.genero);
  const gf = concordancia(e.firmante.genero);
  const uvt = r.uvtAnioEnCurso;
  const v = retencionHonorarios({
    honorarios: k.honorariosMensuales,
    uvt,
    salarioMinimo: cfg.salarioMinimo,
    modo: cfg.modo,
    tarifa: cfg.tarifaHonorarios
  });

  const cuerpo = `
${encabezado(e, { consecutivo: doc.consecutivo, fecha: `${doc.ciudadExpedicion}, ${fechaLarga(doc.fechaExpedicion)}` })}

<p class="destinatario"><strong>${esc(doc.dirigidoA || 'A QUIEN INTERESE')}</strong></p>

${titulo('CERTIFICACIÓN DE RETENCIÓN EN LA FUENTE', `HONORARIOS · AÑO GRAVABLE ${r.anioEnCurso}`)}

<p>${esc(gf.suscrito)} ${esc(e.firmante.cargo || 'Representante legal')} de
<strong>${esc(e.nombre)}</strong>, NIT ${esc(dato(e.nit, 14))}, en calidad de agente retenedor,</p>

<div class="certifica">CERTIFICA</div>

<p>Que ${esc(g.aSenor)} <strong>${esc(dato(c.nombre, 28))}</strong>, ${esc(g.identificado)} con
${esc(c.tipoDocumento)} No. ${esc(dato(c.documento, 12))}, ${esc(g.vinculado)} a esta institución
mediante contrato de prestación de servicios como ${esc(k.rol)} con honorarios mensuales de
<strong>${moneda(k.honorariosMensuales)}</strong>, ${v.retencion === 0
  ? '<strong>no se le ha practicado retención en la fuente</strong>'
  : `se le practica una retención en la fuente de <strong>${moneda(v.retencion)}</strong> mensuales`}
durante el año gravable ${r.anioEnCurso}.</p>

<table>
  <tr><th>Depuración mensual (artículos 383 y 388 del Estatuto Tributario)</th><th class="num" style="width:28%">Valor</th></tr>
  <tr><td>Honorarios del mes</td><td class="num">${moneda(k.honorariosMensuales)}</td></tr>
  <tr><td>Menos aportes obligatorios a seguridad social como independiente<br>
          <span style="font-size:9pt; color:#6b7482">IBC ${moneda(v.aportes.ibc)} — 40 % del contrato con piso de un salario mínimo</span></td>
      <td class="num">− ${moneda(v.aportes.total)}</td></tr>
  <tr><td>Menos renta exenta del 25 % (art. 206 num. 10)</td>
      <td class="num">− ${moneda(v.rentaExenta)}</td></tr>
  <tr class="total"><td>Base gravable mensual · ${v.baseUvt} UVT</td>
      <td class="num">${moneda(v.baseGravable)}</td></tr>
  <tr><td>Mínimo desde el que aplica la tabla · 95 UVT</td>
      <td class="num">${moneda(v.topePesos)}</td></tr>
  <tr class="destacado"><td>RETENCIÓN MENSUAL</td><td class="num">${moneda(v.retencion)}</td></tr>
</table>

<p>La UVT para ${r.anioEnCurso} es de ${moneda(uvt)}, fijada por la Resolución DIAN 000238 del
15 de diciembre de 2025.</p>

<p>Se expide ${esc(doc.motivo || 'a solicitud del interesado')} en ${esc(doc.ciudadExpedicion)},
el ${fechaLarga(doc.fechaExpedicion)}.</p>

<p>Cordialmente,</p>

${firmas(e)}

<div class="pie">Esta certificación no reemplaza el certificado de ingresos y retenciones del año
gravable anterior (artículo 381 del Estatuto Tributario), que se expide una vez cerrado el año.</div>
`;

  return documento({
    titulo: `Retención ${r.anioEnCurso} — ${c.nombre || 'sin diligenciar'}`,
    cuerpo
  });
}

module.exports = { certificadoRetenciones, certificacionAnioEnCurso, consolidar };
