'use strict';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const moneda = (n) => '$ ' + Math.round(n).toLocaleString('es-CO');

// "2026-09-01" -> "1 de septiembre de 2026"
function fechaLarga(iso) {
  if (!iso) return '____________________';
  const [a, m, d] = iso.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} de ${a}`;
}

// "2026-06" -> { nombre: "Junio 2026", inicio: "2026-06-01", fin: "2026-06-30", dias: 30 }
function periodo(ym) {
  const [a, m] = ym.split('-').map(Number);
  const fin = new Date(Date.UTC(a, m, 0)).getUTCDate();
  const dosDig = (x) => String(x).padStart(2, '0');
  return {
    clave: ym,
    nombre: MESES[m - 1].replace(/^./, (c) => c.toUpperCase()) + ' ' + a,
    inicio: `${a}-${dosDig(m)}-01`,
    fin: `${a}-${dosDig(m)}-${dosDig(fin)}`,
    diasCalendario: fin,
    diasLiquidados: 30 // la nómina mensual en Colombia se liquida sobre 30 días
  };
}

const UNIDADES = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO',
  'NUEVE', 'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS',
  'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE', 'VEINTE', 'VEINTIUNO', 'VEINTIDÓS',
  'VEINTITRÉS', 'VEINTICUATRO', 'VEINTICINCO', 'VEINTISÉIS', 'VEINTISIETE',
  'VEINTIOCHO', 'VEINTINUEVE'];
const DECENAS = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA',
  'SETENTA', 'OCHENTA', 'NOVENTA'];
const CENTENAS = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS',
  'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

function bloqueDecenas(n) {
  if (n < 30) return UNIDADES[n];
  const d = Math.floor(n / 10), u = n % 10;
  return DECENAS[d] + (u ? ' Y ' + UNIDADES[u] : '');
}

function bloqueCentenas(n) {
  if (n === 100) return 'CIEN';
  const c = Math.floor(n / 100), r = n % 100;
  return (CENTENAS[c] + (r ? ' ' + bloqueDecenas(r) : '')).trim();
}

function bloqueMiles(n) {
  const m = Math.floor(n / 1000), r = n % 1000;
  if (!m) return bloqueCentenas(r);
  const prefijo = m === 1 ? 'MIL' : bloqueCentenas(m) + ' MIL';
  return (prefijo + (r ? ' ' + bloqueCentenas(r) : '')).trim();
}

function numeroALetras(n) {
  n = Math.round(n);
  if (n === 0) return 'CERO';
  const millones = Math.floor(n / 1e6), r = n % 1e6;
  if (!millones) return bloqueMiles(r);
  const prefijo = millones === 1 ? 'UN MILLÓN' : bloqueMiles(millones) + ' MILLONES';
  return (prefijo + (r ? ' ' + bloqueMiles(r) : '')).trim();
}

// "dos millones DE pesos" cuando la cifra es de millones exactos
const monedaEnLetras = (n) =>
  numeroALetras(n) + (Math.round(n) >= 1e6 && Math.round(n) % 1e6 === 0 ? ' DE' : '') + ' PESOS M/CTE';

// Marca visible cuando un dato de datos.json quedó vacío.
const dato = (v, ancho = 28) => (v && String(v).trim()) || '_'.repeat(ancho);

// Concordancia de género. Sin dato conocido cae en la forma neutra con paréntesis.
const FORMAS = {
  M: { senor: 'el señor', identificado: 'identificado', trabajador: 'trabajador',
       vinculado: 'vinculado', suscrito: 'El suscrito', interesado: 'el interesado',
       asalariado: 'el asalariado', su: 'del', afiliado: 'afiliado' },
  F: { senor: 'la señora', identificado: 'identificada', trabajador: 'trabajadora',
       vinculado: 'vinculada', suscrito: 'La suscrita', interesado: 'la interesada',
       asalariado: 'la asalariada', su: 'de la', afiliado: 'afiliada' },
  '': { senor: 'el(la) señor(a)', identificado: 'identificado(a)', trabajador: 'trabajador(a)',
        vinculado: 'vinculado(a)', suscrito: 'El(la) suscrito(a)', interesado: 'el(la) interesado(a)',
        asalariado: 'el(la) asalariado(a)', su: 'del(la)', afiliado: 'afiliado(a)' }
};

const concordancia = (genero) => FORMAS[String(genero || '').trim().toUpperCase()] || FORMAS[''];

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

module.exports = {
  MESES, moneda, fechaLarga, periodo, numeroALetras, monedaEnLetras, dato, esc, concordancia
};
