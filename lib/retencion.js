'use strict';

// Retención en la fuente sobre rentas de trabajo — arts. 383 y 388 del Estatuto Tributario.
// Tabla en UVT: [desde, hasta, tarifa marginal, UVT que se suman]
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

// Devuelve la depuración mensual completa, no solo el valor final: así el
// desprendible puede mostrar de dónde sale el cero.
function retencionMensual({ devengado, aportesObligatorios, uvt, deduccionesAdicionales = 0 }) {
  const ingresoNeto = devengado - aportesObligatorios - deduccionesAdicionales;

  const exenta25 = Math.min(
    ingresoNeto * 0.25,
    LIMITE_RENTA_EXENTA_UVT * uvt
  );
  const beneficios = Math.min(
    exenta25 + deduccionesAdicionales,
    ingresoNeto * 0.40,
    LIMITE_GLOBAL_UVT * uvt
  );

  const baseGravable = Math.max(0, ingresoNeto - beneficios);
  const baseUvt = baseGravable / uvt;

  const tramo = TABLA.find(([desde, hasta]) => baseUvt > desde && baseUvt <= hasta) || TABLA[0];
  const [desde, , tarifa, sumaUvt] = tramo;
  const retencionUvt = (baseUvt - desde) * tarifa + sumaUvt;

  return {
    ingresoNeto,
    rentaExenta: Math.round(beneficios),
    baseGravable: Math.round(baseGravable),
    baseUvt: Number(baseUvt.toFixed(2)),
    topeUvt: 95,
    topePesos: Math.round(95 * uvt),
    // La retención se aproxima al múltiplo de mil más cercano (art. 577 E.T.).
    retencion: Math.round(Math.max(0, retencionUvt) * uvt / 1000) * 1000
  };
}

module.exports = { retencionMensual, TABLA };
