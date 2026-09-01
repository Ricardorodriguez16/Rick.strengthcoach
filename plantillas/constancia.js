'use strict';

const { documento, encabezado, firma, aviso } = require('./comun');
const { moneda, monedaEnLetras, fechaLarga, dato, esc } = require('../lib/formato');

module.exports = function constanciaLaboral(d) {
  const { empleador: e, empleado: t, salario: s, constancia: c } = d;
  const totalMensual = s.basicoMensual + s.auxilioTransporte;

  const cuerpo = `
${aviso('completa en <code>datos.json</code> los campos vacíos (marcados con guiones) y vuelve a ejecutar <code>node generar.js</code>.')}
${encabezado(e)}

<div class="consecutivo">${esc(c.consecutivo || '')}</div>
<p>${esc(c.ciudadExpedicion)}, ${fechaLarga(c.fechaExpedicion)}</p>

<p><strong>${esc(c.dirigidoA || 'A QUIEN INTERESE')}</strong></p>

<div class="titulo">CONSTANCIA LABORAL</div>

<p>El(la) suscrito(a) ${esc(e.firmante.cargo || 'Representante Legal')} de
<strong>${esc(e.nombre)}</strong>, identificada con NIT ${esc(dato(e.nit, 14))}, con domicilio en
${esc(e.direccion)}, ${esc(e.ciudad)} (${esc(e.departamento)}),</p>

<div class="certifica">HACE CONSTAR QUE:</div>

<p>El(la) señor(a) <strong>${esc(dato(t.nombre, 34))}</strong>, identificado(a) con
${esc(t.tipoDocumento)} No. ${esc(dato(t.documento, 16))}, labora en esta institución desde el
<strong>${fechaLarga(t.fechaIngreso)}</strong>, desempeñando el cargo de
<strong>${esc(dato(t.cargo, 26))}</strong>, mediante contrato de trabajo a
<strong>${esc(t.tipoContrato)}</strong> en jornada de ${esc(t.jornada)}.</p>

<p>Su asignación mensual asciende a la suma de <strong>${moneda(s.basicoMensual)}</strong>
(${monedaEnLetras(s.basicoMensual)}) por concepto de salario básico, más
<strong>${moneda(s.auxilioTransporte)}</strong> (${monedaEnLetras(s.auxilioTransporte)}) por
auxilio de transporte, para un ingreso mensual total de <strong>${moneda(totalMensual)}</strong>
(${monedaEnLetras(totalMensual)}).</p>

<p>A la fecha de expedición de este documento el vínculo laboral se encuentra vigente y el(la)
trabajador(a) está afiliado(a) al Sistema de Seguridad Social Integral en salud, pensión y riesgos
laborales, conforme a la normatividad vigente.</p>

<p>La presente constancia se expide ${esc(c.motivo || 'a solicitud del(la) interesado(a)')}, en
${esc(c.ciudadExpedicion)}, el ${fechaLarga(c.fechaExpedicion)}.</p>

${firma(e)}

<div class="pie">Documento expedido por el empleador para fines informativos. Su validez está sujeta a
la firma del representante legal. Para verificar la autenticidad de esta constancia comuníquese con
${esc(e.nombre)} — ${esc(dato(e.telefono, 14))} ${esc(e.correo ? '· ' + e.correo : '')}.</div>
`;

  return documento({ titulo: 'Constancia laboral — ' + (t.nombre || 'sin diligenciar'), cuerpo });
};
