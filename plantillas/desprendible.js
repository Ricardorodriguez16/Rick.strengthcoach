'use strict';

const { documento, encabezado, firma, aviso } = require('./comun');
const { moneda, monedaEnLetras, fechaLarga, dato, esc } = require('../lib/formato');

// Liquidación de un mes completo de nómina para un salario fijo mensual.
function liquidar(salario) {
  const ibc = salario.basicoMensual; // el auxilio de transporte no es base de aportes
  const salud = Math.round(ibc * salario.porcentajeSalud);
  const pension = Math.round(ibc * salario.porcentajePension);
  const devengado = salario.basicoMensual + salario.auxilioTransporte;
  const deducciones = salud + pension;
  return { ibc, salud, pension, devengado, deducciones, neto: devengado - deducciones };
}

function desprendible(d, p) {
  const { empleador: e, empleado: t, salario: s } = d;
  const l = liquidar(s);
  const pct = (x) => (x * 100).toFixed(0) + ' %';

  const cuerpo = `
${aviso('verifica los datos del(la) trabajador(a) y el periodo antes de imprimir o firmar.')}
${encabezado(e)}

<div class="titulo">COMPROBANTE DE PAGO DE NÓMINA</div>

<table class="ficha">
  <tr><td>Trabajador(a)</td><td>${esc(dato(t.nombre, 30))}</td>
      <td>Documento</td><td>${esc(t.tipoDocumento)} ${esc(dato(t.documento, 14))}</td></tr>
  <tr><td>Cargo</td><td>${esc(dato(t.cargo, 22))}</td>
      <td>Fecha de ingreso</td><td>${fechaLarga(t.fechaIngreso)}</td></tr>
  <tr><td>Periodo</td><td>${esc(p.nombre)} (${esc(p.inicio)} a ${esc(p.fin)})</td>
      <td>Días liquidados</td><td>${p.diasLiquidados}</td></tr>
  <tr><td>Tipo de contrato</td><td>${esc(t.tipoContrato)}</td>
      <td>Jornada</td><td>${esc(t.jornada)}</td></tr>
  <tr><td>EPS</td><td>${esc(dato(t.eps, 22))}</td>
      <td>Fondo de pensiones</td><td>${esc(dato(t.fondoPension, 22))}</td></tr>
  <tr><td>Forma de pago</td><td>${esc(t.banco ? 'Transferencia — ' + t.banco : dato('', 22))}</td>
      <td>Cuenta</td><td>${esc(dato(t.cuenta, 18))}</td></tr>
</table>

<table>
  <tr><th colspan="2">Devengados</th><th class="num">Valor</th></tr>
  <tr><td colspan="2">Salario básico (${p.diasLiquidados} días)</td>
      <td class="num">${moneda(s.basicoMensual)}</td></tr>
  <tr><td colspan="2">Auxilio de transporte</td>
      <td class="num">${moneda(s.auxilioTransporte)}</td></tr>
  <tr class="total"><td colspan="2">Total devengado</td>
      <td class="num">${moneda(l.devengado)}</td></tr>
</table>

<table>
  <tr><th>Deducciones</th><th class="num">Base</th><th class="num">Valor</th></tr>
  <tr><td>Aporte a salud (${pct(s.porcentajeSalud)})</td>
      <td class="num">${moneda(l.ibc)}</td><td class="num">${moneda(l.salud)}</td></tr>
  <tr><td>Aporte a pensión (${pct(s.porcentajePension)})</td>
      <td class="num">${moneda(l.ibc)}</td><td class="num">${moneda(l.pension)}</td></tr>
  <tr><td>Retención en la fuente</td>
      <td class="num">${moneda(l.ibc)}</td><td class="num">${moneda(0)}</td></tr>
  <tr class="total"><td colspan="2">Total deducciones</td>
      <td class="num">${moneda(l.deducciones)}</td></tr>
</table>

<table>
  <tr class="total"><td>NETO A PAGAR</td><td class="num">${moneda(l.neto)}</td></tr>
  <tr><td colspan="2">${monedaEnLetras(l.neto)}</td></tr>
</table>

<p style="font-size:10pt">Recibí de <strong>${esc(e.nombre)}</strong> la suma indicada como pago
íntegro de mis servicios durante el periodo ${esc(p.nombre)}, y declaro que a la fecha no se me
adeuda suma alguna por concepto de salarios correspondientes a este periodo.</p>

<table style="border:none; margin-top:34pt">
  <tr>
    <td style="border:none; width:50%; padding-top:26pt; border-top:.8pt solid #111">
      <strong>${esc(t.nombre || '')}</strong><br>
      ${esc(t.tipoDocumento)} ${esc(dato(t.documento, 14))}<br>Trabajador(a)
    </td>
    <td style="border:none; width:8%"></td>
    <td style="border:none; width:42%; padding-top:26pt; border-top:.8pt solid #111">
      <strong>${esc(e.firmante.nombre || '')}</strong><br>
      ${esc(e.firmante.cargo || 'Representante Legal')}<br>${esc(e.nombre)}
    </td>
  </tr>
</table>

<div class="pie">Base de cotización: el auxilio de transporte no constituye base para aportes al
Sistema de Seguridad Social (art. 17, Ley 344 de 1996). Los aportes aquí descontados corresponden al
4 % a cargo del trabajador en salud y el 4 % en pensión (arts. 204 y 271 de la Ley 100 de 1993);
al liquidarse en PILA, el IBC se aproxima al múltiplo de mil más cercano, por lo que el valor
efectivamente consignado puede diferir en unos pesos. No se practica retención en la fuente por
ingresos laborales al no superarse la base gravable mínima del art. 383 del Estatuto Tributario.</div>
`;

  return documento({
    titulo: `Desprendible de nómina ${p.nombre} — ${t.nombre || 'sin diligenciar'}`,
    cuerpo
  });
}

module.exports = desprendible;
module.exports.liquidar = liquidar;
