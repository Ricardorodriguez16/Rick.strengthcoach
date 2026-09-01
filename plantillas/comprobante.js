'use strict';

const { documento, encabezado, titulo, firmas } = require('./comun');
const { moneda, monedaEnLetras, fechaLarga, dato, esc, concordancia } = require('../lib/formato');
const { retencionHonorarios } = require('../lib/retencion');

module.exports = function comprobanteHonorarios(d, p) {
  const { contratante: e, contratista: c, contrato: k, retencion: cfg } = d;
  const g = concordancia(c.genero);
  const r = retencionHonorarios({
    honorarios: k.honorariosMensuales,
    uvt: d.retenciones.uvtAnioEnCurso,
    salarioMinimo: cfg.salarioMinimo,
    modo: cfg.modo,
    tarifa: cfg.tarifaHonorarios
  });
  const neto = k.honorariosMensuales - r.retencion;
  const rotulo = (rot, val) => `<td class="rotulo">${rot}</td><td>${val}</td>`;

  const cuerpo = `
${encabezado(e, { consecutivo: `Cuenta de cobro ${esc(p.clave)}`, fecha: `Pagado el ${fechaLarga(p.fin)}` })}

${titulo('COMPROBANTE DE PAGO DE HONORARIOS', p.nombre.toUpperCase())}

<table class="ficha">
  <tr>${rotulo('Contratista', esc(dato(c.nombre, 28)))}
      ${rotulo('Documento', `${esc(c.tipoDocumento)} ${esc(dato(c.documento, 12))}`)}</tr>
  <tr>${rotulo('Rol', esc(k.rol))}
      ${rotulo('Inicio del contrato', fechaLarga(k.fechaInicio))}</tr>
  <tr>${rotulo('Periodo', `${esc(p.inicio)} a ${esc(p.fin)}`)}
      ${rotulo('Modalidad', esc(k.modalidad))}</tr>
  <tr>${rotulo('Forma de pago', esc(c.banco ? 'Transferencia · ' + c.banco : dato('', 20)))}
      ${rotulo('Cuenta', esc(dato(c.cuenta, 16)))}</tr>
</table>

<table>
  <tr><th>Concepto</th><th class="num" style="width:28%">Valor</th></tr>
  <tr><td>Honorarios profesionales como ${esc(k.rol)} · ${esc(p.nombre)}</td>
      <td class="num">${moneda(k.honorariosMensuales)}</td></tr>
  <tr><td>Retención en la fuente por honorarios${cfg.modo === 'tarifa'
        ? ` (${(cfg.tarifaHonorarios * 100).toFixed(0)} %, art. 392 E.T.)`
        : ' (art. 383 E.T.)'}</td>
      <td class="num">${r.retencion ? '− ' : ''}${moneda(r.retencion)}</td></tr>
  <tr class="total"><td>Total pagado</td><td class="num">${moneda(neto)}</td></tr>
</table>

<table>
  <tr class="destacado"><td>NETO CONSIGNADO</td><td class="num" style="width:28%">${moneda(neto)}</td></tr>
  <tr><td colspan="2" class="enletras">${monedaEnLetras(neto)}</td></tr>
</table>

<p style="font-size:10pt">Recibí de <strong>${esc(e.nombre)}</strong> el valor aquí relacionado por
concepto de honorarios profesionales de ${esc(p.nombre)}. A la fecha no se me adeuda suma alguna por
este periodo.</p>

${firmas(e, { ...c, rol: 'Contratista' })}
`;

  return documento({
    titulo: `Honorarios ${p.nombre} — ${c.nombre || 'sin diligenciar'}`,
    cuerpo
  });
};
