'use strict';

const { documento, encabezado, titulo, firmas } = require('./comun');
const { moneda, monedaEnLetras, fechaLarga, dato, esc, concordancia } = require('../lib/formato');

module.exports = function certificacionContractual(d) {
  const { contratante: e, contratista: c, contrato: k, documento: doc } = d;
  const g = concordancia(c.genero);
  const gf = concordancia(e.firmante.genero);
  const contacto = [e.telefono, e.correo].filter(Boolean).map(esc).join(' o al correo ');
  const rotulo = (rot, val) => `<tr><td class="rotulo">${rot}</td><td>${val}</td></tr>`;

  const cuerpo = `
${encabezado(e, { consecutivo: doc.consecutivo, fecha: `${doc.ciudadExpedicion}, ${fechaLarga(doc.fechaExpedicion)}` })}

${doc.dirigidoA ? `<p class="destinatario"><strong>${esc(doc.dirigidoA)}</strong></p>` : ''}

${titulo('CERTIFICACIÓN CONTRACTUAL', 'CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES')}

<p>${esc(gf.suscrito)} ${esc(e.firmante.cargo || 'Representante legal')} de
<strong>${esc(e.nombre)}</strong>, institución educativa identificada con NIT
${esc(dato(e.nit, 14))} y domiciliada en ${esc(e.direccion)} de ${esc(e.ciudad)}
(${esc(e.departamento)}),</p>

<div class="certifica">HACE CONSTAR</div>

<p>Que ${esc(g.senor)} <strong>${esc(dato(c.nombre, 32))}</strong>, ${esc(g.identificado)} con
${esc(c.tipoDocumento)} No. ${esc(dato(c.documento, 14))}, de profesión ${esc(c.profesion.toLowerCase())},
presta sus servicios profesionales a esta institución como <strong>${esc(k.rol)}</strong> desde el
<strong>${fechaLarga(k.fechaInicio)}</strong>, en los siguientes términos:</p>

<table class="ficha">
  ${rotulo('Modalidad', esc(k.modalidad))}
  ${rotulo('Objeto', esc(k.objeto.replace(/^la /, 'La ')))}
  ${rotulo('Fecha de inicio', fechaLarga(k.fechaInicio))}
  ${rotulo('Honorarios mensuales', '<strong>' + moneda(k.honorariosMensuales) + '</strong> · ' + monedaEnLetras(k.honorariosMensuales))}
  ${rotulo('Forma de pago', esc(k.formaPago))}
  ${rotulo('Estado del contrato', k.vigente ? 'Vigente a la fecha de expedición' : 'Terminado')}
</table>

<p>Entre las partes no existe relación laboral ni subordinación: se trata de un contrato civil de
prestación de servicios, y ${esc(g.el || 'el')} contratista atiende por su propia cuenta los aportes
al Sistema de Seguridad Social Integral en calidad de trabajador independiente, conforme al artículo
244 de la Ley 1955 de 2019.</p>

<p>La presente certificación se expide ${esc(doc.motivo || 'a solicitud del interesado')} en
${esc(doc.ciudadExpedicion)}, el ${fechaLarga(doc.fechaExpedicion)}.${
  contacto ? ` Con gusto ampliamos cualquier información al ${contacto}.` : ''}</p>

<p>Cordialmente,</p>

${firmas(e)}
`;

  return documento({ titulo: 'Certificación contractual — ' + (c.nombre || 'sin diligenciar'), cuerpo });
};
