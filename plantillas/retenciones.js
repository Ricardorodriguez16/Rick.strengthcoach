'use strict';

const { documento, encabezado, firma, aviso } = require('./comun');
const { moneda, monedaEnLetras, fechaLarga, dato, esc } = require('../lib/formato');

// Valores por defecto para un salario fijo: se calculan si vienen en null en datos.json.
function consolidar(r) {
  const meses = r.mesesLaborados;
  const proporcion = meses / 12;
  const baseTotal = r.salarioMensualDelAnio + r.auxilioTransporteDelAnio;

  const salarios = Math.round(r.salarioMensualDelAnio * meses);
  const prima = r.prestacionesSociales ?? Math.round(baseTotal * proporcion);
  const cesantias = Math.round(baseTotal * proporcion);
  const intereses = Math.round(cesantias * 0.12 * proporcion);
  const cesantiasTotal = r.cesantiasEInteresesPagados ?? cesantias + intereses;
  const otros = r.otrosPagos ?? Math.round(r.auxilioTransporteDelAnio * meses);

  const salud = Math.round(r.salarioMensualDelAnio * 0.04 * meses);
  const pension = salud;

  return {
    salarios, prima, cesantiasTotal, otros,
    totalBruto: salarios + prima + cesantiasTotal + otros,
    salud, pension,
    retencion: r.retencionPracticada || 0
  };
}

// Certificado de ingresos y retenciones — contenido del art. 379 del Estatuto Tributario.
function certificadoIngresosRetenciones(d) {
  const { empleador: e, empleado: t, retenciones: r, constancia: c } = d;
  const v = consolidar(r);
  const fila = (concepto, valor) =>
    `<tr><td>${concepto}</td><td class="num">${moneda(valor)}</td></tr>`;

  const cuerpo = `
${aviso('los valores se calculan a partir de <code>retenciones</code> en <code>datos.json</code>. Si el año no fue completo o hubo pagos adicionales, ajusta esos campos.')}
${encabezado(e)}

<div class="titulo">CERTIFICADO DE INGRESOS Y RETENCIONES<br>
<span style="font-size:11pt; letter-spacing:.5pt">POR RENTAS DE TRABAJO — AÑO GRAVABLE ${r.anioGravable}</span></div>

<table class="ficha">
  <tr><td>Agente retenedor</td><td>${esc(e.nombre)}</td>
      <td>NIT</td><td>${esc(dato(e.nit, 14))}</td></tr>
  <tr><td>Dirección</td><td>${esc(e.direccion)}, ${esc(e.ciudad)} (${esc(e.departamento)})</td>
      <td>Ciudad donde se consignó la retención</td><td>${esc(r.ciudadConsignacion || e.ciudad)}</td></tr>
  <tr><td>Apellidos y nombres del asalariado</td><td>${esc(dato(t.nombre, 30))}</td>
      <td>Identificación</td><td>${esc(t.tipoDocumento)} ${esc(dato(t.documento, 14))}</td></tr>
  <tr><td>Cargo</td><td>${esc(dato(t.cargo, 22))}</td>
      <td>Periodo certificado</td><td>${r.mesesLaborados} mes(es) del año ${r.anioGravable}</td></tr>
</table>

<table>
  <tr><th>Concepto de los pagos o abonos en cuenta</th><th class="num">Valor</th></tr>
  ${fila('Pagos por salarios', v.salarios)}
  ${fila('Pagos por prestaciones sociales (prima de servicios)', v.prima)}
  ${fila('Cesantías e intereses sobre cesantías pagados o consignados', v.cesantiasTotal)}
  ${fila('Otros pagos — auxilio de transporte', v.otros)}
  ${fila('Pagos por honorarios, comisiones y servicios', 0)}
  ${fila('Gastos de representación y viáticos', 0)}
  <tr class="total"><td>TOTAL DE INGRESOS BRUTOS</td><td class="num">${moneda(v.totalBruto)}</td></tr>
</table>

<table>
  <tr><th>Aportes y deducciones</th><th class="num">Valor</th></tr>
  ${fila('Aportes obligatorios al Sistema General de Seguridad Social en Salud', v.salud)}
  ${fila('Aportes obligatorios a fondos de pensiones y solidaridad pensional', v.pension)}
  ${fila('Aportes voluntarios a fondos de pensiones y cuentas AFC/AVC', 0)}
</table>

<table>
  <tr class="total"><td>TOTAL RETENCIÓN EN LA FUENTE PRACTICADA POR RENTAS DE TRABAJO</td>
      <td class="num">${moneda(v.retencion)}</td></tr>
  <tr><td colspan="2">${monedaEnLetras(v.retencion)}</td></tr>
</table>

<p>${v.retencion === 0
  ? `Durante el año gravable ${r.anioGravable} <strong>no se practicó retención en la fuente</strong>
     por concepto de rentas de trabajo al(a la) asalariado(a) aquí identificado(a), por cuanto la base
     gravable depurada de sus pagos mensuales no superó los 95 UVT previstos en la tabla del artículo
     383 del Estatuto Tributario.`
  : `Los valores retenidos fueron declarados y consignados a la Dirección de Impuestos y Aduanas
     Nacionales dentro de los plazos legales.`}</p>

<p>El presente certificado se expide en ${esc(c.ciudadExpedicion)} el
${fechaLarga(c.fechaExpedicion)}, en cumplimiento de los artículos 378 y 379 del Estatuto Tributario.</p>

${firma(e)}

<div class="pie">Certificado expedido conforme al contenido exigido por el artículo 379 del Estatuto
Tributario. Sustituye al formulario 220 prescrito por la DIAN cuando contiene la totalidad de los
datos allí requeridos. Requiere la firma del pagador o agente retenedor para su validez.</div>
`;

  return documento({
    titulo: `Certificado de ingresos y retenciones ${r.anioGravable} — ${t.nombre || 'sin diligenciar'}`,
    cuerpo
  });
}

// Constancia para el año en curso, cuando el trámite no acepta el certificado del año anterior.
function certificacionNoRetencion(d) {
  const { empleador: e, empleado: t, salario: s, retenciones: r, constancia: c } = d;
  const tope = Math.round(95 * r.uvtAnioEnCurso);

  const cuerpo = `
${aviso('úsala solo si el trámite pide la situación de retención del año en curso; si piden el certificado anual, entrega el del año gravable anterior.')}
${encabezado(e)}

<div class="consecutivo">${esc(c.consecutivo || '')}</div>
<p>${esc(c.ciudadExpedicion)}, ${fechaLarga(c.fechaExpedicion)}</p>
<p><strong>${esc(c.dirigidoA || 'A QUIEN INTERESE')}</strong></p>

<div class="titulo">CERTIFICACIÓN DE RETENCIÓN EN LA FUENTE<br>
<span style="font-size:11pt; letter-spacing:.5pt">AÑO GRAVABLE ${r.anioEnCurso}</span></div>

<p><strong>${esc(e.nombre)}</strong>, NIT ${esc(dato(e.nit, 14))}, en calidad de agente retenedor,</p>

<div class="certifica">CERTIFICA QUE:</div>

<p>Al(a la) señor(a) <strong>${esc(dato(t.nombre, 30))}</strong>, identificado(a) con
${esc(t.tipoDocumento)} No. ${esc(dato(t.documento, 14))}, vinculado(a) a esta institución en el cargo
de ${esc(dato(t.cargo, 22))} con una asignación básica mensual de <strong>${moneda(s.basicoMensual)}</strong>
más auxilio de transporte de ${moneda(s.auxilioTransporte)}, <strong>no se le ha practicado retención
en la fuente por ingresos laborales</strong> durante el año gravable ${r.anioEnCurso}.</p>

<p>Lo anterior por cuanto la base gravable depurada de sus pagos mensuales no supera el mínimo de
95 UVT a partir del cual se aplica la tabla del artículo 383 del Estatuto Tributario, equivalente a
${moneda(tope)} mensuales para el año ${r.anioEnCurso} (UVT ${moneda(r.uvtAnioEnCurso)}, Resolución
DIAN 000238 del 15 de diciembre de 2025).</p>

<p>Se expide ${esc(c.motivo || 'a solicitud del(la) interesado(a)')} en ${esc(c.ciudadExpedicion)},
el ${fechaLarga(c.fechaExpedicion)}.</p>

${firma(e)}

<div class="pie">Esta certificación no reemplaza el certificado de ingresos y retenciones del año
gravable anterior (arts. 378 y 379 del Estatuto Tributario), que se expide una vez cerrado el año.</div>
`;

  return documento({
    titulo: `Certificación de no retención ${r.anioEnCurso} — ${t.nombre || 'sin diligenciar'}`,
    cuerpo
  });
}

module.exports = { certificadoIngresosRetenciones, certificacionNoRetencion, consolidar };
