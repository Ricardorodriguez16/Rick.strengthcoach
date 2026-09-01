'use strict';

const { documento, encabezado, titulo, firmas } = require('./comun');
const { moneda, monedaEnLetras, fechaLarga, dato, esc, concordancia } = require('../lib/formato');
const { retencionMensual } = require('../lib/retencion');

// Valores por defecto para un salario fijo: se calculan si vienen en null en datos.json.
function consolidar(r) {
  const meses = r.mesesLaborados;
  const proporcion = meses / 12;
  const baseTotal = r.salarioMensualDelAnio + r.auxilioTransporteDelAnio;

  const salarios = Math.round(r.salarioMensualDelAnio * meses);
  const prima = r.prestacionesSociales ?? Math.round(baseTotal * proporcion);
  const cesantias = Math.round(baseTotal * proporcion);
  const cesantiasTotal = r.cesantiasEInteresesPagados ?? cesantias + Math.round(cesantias * 0.12 * proporcion);
  const otros = r.otrosPagos ?? Math.round(r.auxilioTransporteDelAnio * meses);

  const salud = Math.round(r.salarioMensualDelAnio * 0.04 * meses);
  const pension = salud;

  const mes = retencionMensual({
    devengado: baseTotal,
    aportesObligatorios: Math.round(r.salarioMensualDelAnio * 0.08),
    uvt: r.uvtAnioGravable || r.uvtAnioEnCurso
  });

  return {
    salarios, prima, cesantiasTotal, otros,
    totalBruto: salarios + prima + cesantiasTotal + otros,
    salud, pension,
    retencion: r.retencionPracticada ?? mes.retencion * meses,
    baseMensual: mes
  };
}

// Certificado de ingresos y retenciones — contenido del art. 379 del Estatuto Tributario.
function certificadoIngresosRetenciones(d) {
  const { empleador: e, empleado: t, retenciones: r, constancia: c } = d;
  const v = consolidar(r);
  const g = concordancia(t.genero);
  const rotulo = (k, val) => `<td class="rotulo">${k}</td><td>${val}</td>`;
  const fila = (concepto, valor) => `<tr><td>${concepto}</td><td class="num">${moneda(valor)}</td></tr>`;

  const cuerpo = `
${encabezado(e, { consecutivo: `Año gravable ${r.anioGravable}`, fecha: `${c.ciudadExpedicion}, ${fechaLarga(c.fechaExpedicion)}` })}

${titulo('CERTIFICADO DE INGRESOS Y RETENCIONES', `POR RENTAS DE TRABAJO · AÑO GRAVABLE ${r.anioGravable}`)}

<table class="ficha">
  <tr>${rotulo('Agente retenedor', esc(e.nombre))}${rotulo('NIT', esc(dato(e.nit, 14)))}</tr>
  <tr>${rotulo('Dirección', `${esc(e.direccion)}, ${esc(e.ciudad)} (${esc(e.departamento)})`)}
      ${rotulo('Ciudad donde se consignó la retención', esc(r.ciudadConsignacion || e.ciudad))}</tr>
  <tr>${rotulo('Apellidos y nombres', esc(dato(t.nombre, 28)))}
      ${rotulo('Identificación', `${esc(t.tipoDocumento)} ${esc(dato(t.documento, 12))}`)}</tr>
  <tr>${rotulo('Cargo', esc(dato(t.cargo, 20)))}
      ${rotulo('Periodo certificado', `${r.mesesLaborados} mes(es) del año ${r.anioGravable}`)}</tr>
</table>

<table>
  <tr><th>Concepto de los pagos o abonos en cuenta</th><th class="num" style="width:26%">Valor</th></tr>
  ${fila('Pagos por salarios', v.salarios)}
  ${fila('Pagos por prestaciones sociales (prima de servicios)', v.prima)}
  ${fila('Cesantías e intereses sobre cesantías pagados o consignados', v.cesantiasTotal)}
  ${fila('Otros pagos — auxilio de transporte', v.otros)}
  ${fila('Honorarios, comisiones y servicios', 0)}
  ${fila('Gastos de representación y viáticos', 0)}
  <tr class="total"><td>Total de ingresos brutos</td><td class="num">${moneda(v.totalBruto)}</td></tr>
</table>

<table>
  <tr><th>Aportes y deducciones</th><th class="num" style="width:26%">Valor</th></tr>
  ${fila('Aportes obligatorios al Sistema General de Seguridad Social en Salud', v.salud)}
  ${fila('Aportes obligatorios a fondos de pensiones y solidaridad pensional', v.pension)}
  ${fila('Aportes voluntarios a fondos de pensiones y cuentas AFC/AVC', 0)}
</table>

<table>
  <tr class="destacado"><td>RETENCIÓN EN LA FUENTE PRACTICADA POR RENTAS DE TRABAJO</td>
      <td class="num" style="width:26%">${moneda(v.retencion)}</td></tr>
  <tr><td colspan="2" class="enletras">${monedaEnLetras(v.retencion)}</td></tr>
</table>

<p>${v.retencion === 0
  ? `Durante el año gravable ${r.anioGravable} no se practicó retención en la fuente por rentas de
     trabajo a ${esc(g.senor)} aquí ${esc(g.identificado)}, porque la base gravable depurada de sus
     pagos mensuales (${moneda(v.baseMensual.baseGravable)}, equivalente a
     ${v.baseMensual.baseUvt} UVT) no alcanzó las 95 UVT desde las que aplica la tabla del artículo
     383 del Estatuto Tributario.`
  : `Los valores retenidos fueron declarados y consignados a la Dirección de Impuestos y Aduanas
     Nacionales dentro de los plazos legales.`}</p>

<p>Este certificado se expide en ${esc(c.ciudadExpedicion)} el ${fechaLarga(c.fechaExpedicion)},
en cumplimiento de los artículos 378 y 379 del Estatuto Tributario.</p>

${firmas(e)}

<div class="pie">Certificado expedido con el contenido que exige el artículo 379 del Estatuto
Tributario, que permite el formato propio del agente retenedor cuando incluye todos los datos del
formulario 220 prescrito por la DIAN. Requiere la firma del pagador para su validez.</div>
`;

  return documento({
    titulo: `Ingresos y retenciones ${r.anioGravable} — ${t.nombre || 'sin diligenciar'}`,
    cuerpo
  });
}

// Constancia para el año en curso, cuando el trámite no acepta el certificado del año anterior.
function certificacionNoRetencion(d) {
  const { empleador: e, empleado: t, salario: s, retenciones: r, constancia: c } = d;
  const g = concordancia(t.genero);
  const gf = concordancia(e.firmante.genero);
  const uvt = r.uvtAnioEnCurso;
  const mes = retencionMensual({
    devengado: s.basicoMensual + s.auxilioTransporte,
    aportesObligatorios: Math.round(s.basicoMensual * (s.porcentajeSalud + s.porcentajePension)),
    uvt
  });

  const cuerpo = `
${encabezado(e, { consecutivo: c.consecutivo, fecha: `${c.ciudadExpedicion}, ${fechaLarga(c.fechaExpedicion)}` })}

<p class="destinatario"><strong>${esc(c.dirigidoA || 'A QUIEN INTERESE')}</strong></p>

${titulo('CERTIFICACIÓN DE RETENCIÓN EN LA FUENTE', `AÑO GRAVABLE ${r.anioEnCurso}`)}

<p>${esc(gf.suscrito)} ${esc(e.firmante.cargo || 'Representante legal')} de
<strong>${esc(e.nombre)}</strong>, NIT ${esc(dato(e.nit, 14))}, en calidad de agente retenedor,</p>

<div class="certifica">CERTIFICA</div>

<p>Que a ${esc(g.senor)} <strong>${esc(dato(t.nombre, 28))}</strong>, ${esc(g.identificado)} con
${esc(t.tipoDocumento)} No. ${esc(dato(t.documento, 12))} y ${esc(g.vinculado)} a esta institución
como ${esc(dato(t.cargo, 20))} con una asignación básica mensual de
<strong>${moneda(s.basicoMensual)}</strong> más auxilio de transporte de
${moneda(s.auxilioTransporte)}, <strong>no se le ha practicado retención en la fuente</strong> por
ingresos laborales durante el año gravable ${r.anioEnCurso}.</p>

<table>
  <tr><th>Depuración mensual (artículos 383 y 388 del Estatuto Tributario)</th><th class="num" style="width:26%">Valor</th></tr>
  <tr><td>Total devengado</td><td class="num">${moneda(s.basicoMensual + s.auxilioTransporte)}</td></tr>
  <tr><td>Menos aportes obligatorios a salud y pensión</td>
      <td class="num">− ${moneda(Math.round(s.basicoMensual * (s.porcentajeSalud + s.porcentajePension)))}</td></tr>
  <tr><td>Menos renta exenta del 25 % (art. 206 num. 10)</td>
      <td class="num">− ${moneda(mes.rentaExenta)}</td></tr>
  <tr class="total"><td>Base gravable mensual · ${mes.baseUvt} UVT</td>
      <td class="num">${moneda(mes.baseGravable)}</td></tr>
  <tr><td>Mínimo desde el que aplica la tabla · 95 UVT</td>
      <td class="num">${moneda(mes.topePesos)}</td></tr>
  <tr class="destacado"><td>RETENCIÓN MENSUAL</td><td class="num">${moneda(mes.retencion)}</td></tr>
</table>

<p>La UVT para ${r.anioEnCurso} es de ${moneda(uvt)}, fijada por la Resolución DIAN 000238 del
15 de diciembre de 2025.</p>

<p>Se expide ${esc(c.motivo || 'a solicitud de la persona interesada')} en
${esc(c.ciudadExpedicion)}, el ${fechaLarga(c.fechaExpedicion)}.</p>

<p>Cordialmente,</p>

${firmas(e)}

<div class="pie">Esta certificación no reemplaza el certificado de ingresos y retenciones del año
gravable anterior (artículos 378 y 379 del Estatuto Tributario), que se expide una vez cerrado
el año.</div>
`;

  return documento({
    titulo: `No retención ${r.anioEnCurso} — ${t.nombre || 'sin diligenciar'}`,
    cuerpo
  });
}

module.exports = { certificadoIngresosRetenciones, certificacionNoRetencion, consolidar };
