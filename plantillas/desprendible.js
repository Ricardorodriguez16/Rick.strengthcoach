'use strict';

const { documento, encabezado, titulo, firmas } = require('./comun');
const { moneda, monedaEnLetras, fechaLarga, dato, esc, concordancia } = require('../lib/formato');
const { retencionMensual } = require('../lib/retencion');

// Liquidación de un mes completo de nómina para un salario fijo mensual.
function liquidar(salario, uvt) {
  const ibc = salario.basicoMensual; // el auxilio de transporte no es base de aportes
  const salud = Math.round(ibc * salario.porcentajeSalud);
  const pension = Math.round(ibc * salario.porcentajePension);
  const devengado = salario.basicoMensual + salario.auxilioTransporte;

  const r = retencionMensual({ devengado, aportesObligatorios: salud + pension, uvt });
  const deducciones = salud + pension + r.retencion;

  return { ibc, salud, pension, devengado, deducciones, neto: devengado - deducciones, ...r };
}

function desprendible(d, p) {
  const { empleador: e, empleado: t, salario: s } = d;
  const uvt = d.retenciones.uvtAnioEnCurso;
  const l = liquidar(s, uvt);
  const g = concordancia(t.genero);
  const pct = (x) => (x * 100).toFixed(0) + ' %';
  const rotulo = (k, v) => `<td class="rotulo">${k}</td><td>${v}</td>`;

  const cuerpo = `
${encabezado(e, { consecutivo: `Nómina ${esc(p.clave)}`, fecha: `Pagado el ${fechaLarga(p.fin)}` })}

${titulo('COMPROBANTE DE PAGO DE NÓMINA', p.nombre.toUpperCase())}

<table class="ficha">
  <tr>${rotulo(g.trabajador.replace(/^./, (c) => c.toUpperCase()), esc(dato(t.nombre, 28)))}
      ${rotulo('Documento', `${esc(t.tipoDocumento)} ${esc(dato(t.documento, 12))}`)}</tr>
  <tr>${rotulo('Cargo', esc(dato(t.cargo, 20)))}
      ${rotulo('Fecha de ingreso', fechaLarga(t.fechaIngreso))}</tr>
  <tr>${rotulo('Periodo liquidado', `${esc(p.inicio)} a ${esc(p.fin)} · ${p.diasLiquidados} días`)}
      ${rotulo('Contrato', `${esc(t.tipoContrato)} · ${esc(t.jornada)}`)}</tr>
  <tr>${rotulo('EPS', esc(dato(t.eps, 20)))}
      ${rotulo('Fondo de pensiones', esc(dato(t.fondoPension, 20)))}</tr>
  <tr>${rotulo('Forma de pago', esc(t.banco ? 'Transferencia · ' + t.banco : dato('', 20)))}
      ${rotulo('Cuenta', esc(dato(t.cuenta, 16)))}</tr>
</table>

<table>
  <tr><th>Devengados</th><th class="num" style="width:26%">Valor</th></tr>
  <tr><td>Salario básico (${p.diasLiquidados} días)</td><td class="num">${moneda(s.basicoMensual)}</td></tr>
  <tr><td>Auxilio de transporte</td><td class="num">${moneda(s.auxilioTransporte)}</td></tr>
  <tr class="total"><td>Total devengado</td><td class="num">${moneda(l.devengado)}</td></tr>
</table>

<table>
  <tr><th>Deducciones</th><th class="num" style="width:26%">Base</th><th class="num" style="width:26%">Valor</th></tr>
  <tr><td>Aporte a salud (${pct(s.porcentajeSalud)})</td>
      <td class="num">${moneda(l.ibc)}</td><td class="num">${moneda(l.salud)}</td></tr>
  <tr><td>Aporte a pensión (${pct(s.porcentajePension)})</td>
      <td class="num">${moneda(l.ibc)}</td><td class="num">${moneda(l.pension)}</td></tr>
  <tr><td>Retención en la fuente</td>
      <td class="num">${moneda(l.baseGravable)}</td><td class="num">${moneda(l.retencion)}</td></tr>
  <tr class="total"><td colspan="2">Total deducciones</td><td class="num">${moneda(l.deducciones)}</td></tr>
</table>

<table>
  <tr class="destacado"><td>NETO PAGADO</td><td class="num" style="width:26%">${moneda(l.neto)}</td></tr>
  <tr><td colspan="2" class="enletras">${monedaEnLetras(l.neto)}</td></tr>
</table>

<p style="font-size:10pt">Recibí de <strong>${esc(e.nombre)}</strong> el valor aquí liquidado como
pago completo de mis servicios durante ${esc(p.nombre)}. A la fecha no se me adeuda suma alguna por
salarios de este periodo.</p>

${firmas(e, { ...t, rol: g.trabajador.replace(/^./, (c) => c.toUpperCase()) })}

<div class="pie">El auxilio de transporte no constituye base para aportes al Sistema de Seguridad
Social (Ley 344 de 1996, art. 17); por eso los aportes del ${pct(s.porcentajeSalud)} en salud y
${pct(s.porcentajePension)} en pensión a cargo del trabajador (Ley 100 de 1993,
arts. 204 y 271) se calculan sobre el salario básico. Al liquidarse en PILA el IBC se aproxima al
múltiplo de mil más cercano, por lo que el aporte consignado puede diferir en unos pesos.
${l.retencion === 0
  ? `No se practica retención en la fuente: la base gravable depurada del mes (${moneda(l.baseGravable)},
     equivalente a ${l.baseUvt} UVT) no alcanza las ${l.topeUvt} UVT — ${moneda(l.topePesos)} — desde
     las que aplica la tabla del artículo 383 del Estatuto Tributario.`
  : `La retención se calcula sobre una base gravable depurada de ${moneda(l.baseGravable)}
     (${l.baseUvt} UVT) según la tabla del artículo 383 del Estatuto Tributario.`}</div>
`;

  return documento({
    titulo: `Nómina ${p.nombre} — ${t.nombre || 'sin diligenciar'}`,
    cuerpo
  });
}

module.exports = desprendible;
module.exports.liquidar = liquidar;
