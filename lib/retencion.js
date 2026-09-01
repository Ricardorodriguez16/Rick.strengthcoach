'use strict';

// Retención en la fuente sobre honorarios de una persona natural.
// Tabla del art. 383 E.T. en UVT: [desde, hasta, tarifa marginal, UVT que se suman]
const TABLA = [
  [0, 95, 0.00, 0],
  [95, 150, 0.19, 0],
  [150, 360, 0.28, 10],
  [360, 640, 0.33, 69],
  [640, 945, 0.35, 162],
  [945, 2300, 0.37, 268],
  [2300, Infinity, 0.39, 770]
];

const LIMITE_RENTA_EXENTA_UVT = 790 / 12;   // art. 206 num. 10, tope anual prorrateado
const LIMITE_GLOBAL_UVT = 1340 / 12;        // art. 336, tope anual prorrateado

// Aportes del contratista independiente: el IBC es el 40 % del contrato mensualizado,
// con piso de un salario mínimo (art. 244 de la Ley 1955 de 2019).
function aportesIndependiente(honorarios, salarioMinimo) {
  const ibc = Math.max(Math.round(honorarios * 0.40), salarioMinimo);
  const salud = Math.round(ibc * 0.125);
  const pension = Math.round(ibc * 0.16);
  return { ibc, salud, pension, total: salud + pension };
}

function aplicarTabla(baseGravable, uvt) {
  const baseUvt = baseGravable / uvt;
  const [desde, , tarifa, sumaUvt] =
    TABLA.find(([d, h]) => baseUvt > d && baseUvt <= h) || TABLA[0];
  const retencionUvt = (baseUvt - desde) * tarifa + sumaUvt;
  return {
    baseUvt: Number(baseUvt.toFixed(2)),
    // La retención se aproxima al múltiplo de mil más cercano (art. 577 E.T.).
    retencion: Math.round(Math.max(0, retencionUvt) * uvt / 1000) * 1000
  };
}

// Devuelve la depuración completa, no solo el valor final: así el comprobante
// puede mostrar de dónde sale la cifra.
function retencionHonorarios({ honorarios, uvt, salarioMinimo, modo = 'art383', tarifa = 0.10 }) {
  const aportes = aportesIndependiente(honorarios, salarioMinimo);

  if (modo === 'tarifa') {
    return {
      modo,
      tarifa,
      aportes,
      baseGravable: honorarios,
      baseUvt: Number((honorarios / uvt).toFixed(2)),
      retencion: Math.round(honorarios * tarifa / 1000) * 1000,
      topeUvt: 95,
      topePesos: Math.round(95 * uvt)
    };
  }

  const ingresoNeto = honorarios - aportes.total;
  const rentaExenta = Math.min(
    ingresoNeto * 0.25,
    LIMITE_RENTA_EXENTA_UVT * uvt,
    ingresoNeto * 0.40,
    LIMITE_GLOBAL_UVT * uvt
  );
  const baseGravable = Math.max(0, ingresoNeto - rentaExenta);
  const { baseUvt, retencion } = aplicarTabla(baseGravable, uvt);

  return {
    modo,
    aportes,
    ingresoNeto,
    rentaExenta: Math.round(rentaExenta),
    baseGravable: Math.round(baseGravable),
    baseUvt,
    retencion,
    topeUvt: 95,
    topePesos: Math.round(95 * uvt)
  };
}

module.exports = { retencionHonorarios, aportesIndependiente, TABLA };
