'use strict';

const { documento, encabezado, titulo, firmas } = require('./comun');
const { moneda, monedaEnLetras, fechaLarga, dato, esc, concordancia } = require('../lib/formato');

module.exports = function constanciaLaboral(d) {
  const { empleador: e, empleado: t, salario: s, constancia: c } = d;
  const g = concordancia(t.genero);
  const gf = concordancia(e.firmante.genero);
  const total = s.basicoMensual + s.auxilioTransporte;

  const contacto = [e.telefono, e.correo].filter(Boolean).map(esc).join(' o al correo ');

  const cuerpo = `
${encabezado(e, { consecutivo: c.consecutivo, fecha: `${c.ciudadExpedicion}, ${fechaLarga(c.fechaExpedicion)}` })}

<p class="destinatario"><strong>${esc(c.dirigidoA || 'A QUIEN INTERESE')}</strong></p>

${titulo('CONSTANCIA LABORAL')}

<p>${esc(gf.suscrito)} ${esc(e.firmante.cargo || 'Representante legal')} de
<strong>${esc(e.nombre)}</strong>, institución educativa identificada con NIT
${esc(dato(e.nit, 14))} y domiciliada en ${esc(e.direccion)} de ${esc(e.ciudad)}
(${esc(e.departamento)}),</p>

<div class="certifica">HACE CONSTAR</div>

<p>Que ${esc(g.senor)} <strong>${esc(dato(t.nombre, 32))}</strong>, ${esc(g.identificado)} con
${esc(t.tipoDocumento)} No. ${esc(dato(t.documento, 14))}, hace parte del equipo de esta institución
desde el <strong>${fechaLarga(t.fechaIngreso)}</strong>, donde se desempeña como
<strong>${esc(dato(t.cargo, 24))}</strong> mediante contrato de trabajo a
${esc(t.tipoContrato.toLowerCase())} en jornada de ${esc(t.jornada.toLowerCase())}.</p>

<p>Su asignación básica mensual es de <strong>${moneda(s.basicoMensual)}</strong>
(${monedaEnLetras(s.basicoMensual)}), a la que se suma el auxilio de transporte de
${moneda(s.auxilioTransporte)} (${monedaEnLetras(s.auxilioTransporte)}), para un ingreso mensual de
<strong>${moneda(total)}</strong> (${monedaEnLetras(total)}).</p>

<p>A la fecha el vínculo laboral se encuentra vigente y ${esc(g.senor.split(' ')[0])}
${esc(g.trabajador)} está ${esc(g.afiliado)} al Sistema de Seguridad Social Integral en salud,
pensión y riesgos laborales, con los aportes al día conforme a la ley.</p>

<p>La presente constancia se expide ${esc(c.motivo || 'a solicitud de la persona interesada')} en
${esc(c.ciudadExpedicion)}, el ${fechaLarga(c.fechaExpedicion)}.${
  contacto ? ` Con gusto ampliamos cualquier información al ${contacto}.` : ''}</p>

<p>Cordialmente,</p>

${firmas(e)}

<div class="pie">Documento expedido por el empleador. Su validez está sujeta a la firma
${esc(gf.su)} ${esc(e.firmante.cargo || 'representante legal')}. Para verificar su autenticidad
comuníquese con ${esc(e.nombre)}${contacto ? ` al ${contacto}` : ''}.</div>
`;

  return documento({ titulo: 'Constancia laboral — ' + (t.nombre || 'sin diligenciar'), cuerpo });
};
