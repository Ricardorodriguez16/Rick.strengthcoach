'use strict';

const { esc, imagenIncrustada, encuadre, holgado } = require('../lib/formato');

// El cuerpo de los slides admite <strong> y <span class="oro"> desde
// datos.json; el resto se escapa para que un apellido con & no rompa el HTML.
const rico = (t) => String(t ?? '')
  .split(/(<\/?strong>|<span class="oro">|<\/span>|<br>)/)
  .map((p) => (/^<\/?(strong|span|br)/.test(p) ? p : esc(p)))
  .join('');

// Los titulares se cortan con "|" en datos.json: dónde parte una línea es
// decisión de diseño, no del ancho de la caja.
const titular = (t) => String(t).split('|').map(esc).join('<br>');

const tope = (serie, n, seccion = '') => `
    <div class="tope">
      <div class="fila">
        <div class="marca">${esc(serie.cuenta)}</div>
        <div class="contador">${n} / ${esc(serie.totalSlides)}</div>
      </div>
      ${seccion ? `<div class="rotulo oro seccion">${esc(seccion)}</div>` : ''}
    </div>`;

const fondo = (f, velos = 'vineta abajo') => {
  if (!f || !f.archivo) return '';
  return `<div class="foto"><img src="${imagenIncrustada(f.archivo)}" alt="" style="${encuadre(f)}"></div>
    ${velos.split(' ').map((v) => `<div class="velo ${v}"></div>`).join('\n    ')}`;
};

const envoltura = (clase, contenido) => `<div class="slide ${clase}">${contenido}</div>`;

// ── 2 · Quién es ──────────────────────────────────────────────────────────
function presentacion(d, n) {
  const s = d.slides.presentacion;
  const ficha = (s.ficha || []).map((f) => `<div class="celda">
        <div class="et">${esc(f.etiqueta)}</div>
        <div class="nu chico">${esc(f.valor)}</div>
      </div>`).join('\n      ');

  return envoltura('s-presentacion', `
    ${fondo(s.foto, 'vineta arriba abajo')}
    <div class="interior">
      ${tope(d.serie, n, s.rotulo)}
      <div class="pie-slide">
        <h2 class="titular${holgado(s.titular)}">${titular(s.titular)}</h2>
        <p class="cuerpo">${rico(s.cuerpo)}</p>
        <div class="marcas ficha">${ficha}</div>
      </div>
    </div>`);
}

// ── 3 · El punto de partida ───────────────────────────────────────────────
function partida(d, n) {
  const s = d.slides.partida;
  return envoltura('s-partida', `
    <div class="interior">
      ${tope(d.serie, n, s.rotulo)}
      <div class="centro">
        <h2 class="titular${holgado(s.titular)}">${titular(s.titular)}</h2>
        <div class="cita"><p>${rico(s.cita)}</p>
          <div class="firma mono oro">${esc(d.atleta.nombre)}</div>
        </div>
        <div class="regla separador"></div>
        <p class="cuerpo nota">${rico(s.cuerpo)}</p>
      </div>
    </div>`);
}

// ── 4 · Lo que cambió ─────────────────────────────────────────────────────
function proceso(d, n) {
  const s = d.slides.proceso;
  const puntos = (s.puntos || []).map((p, i) => `<div class="punto">
        <div class="i">${String(i + 1).padStart(2, '0')}</div>
        <div><h3>${esc(p.titulo)}</h3><p>${rico(p.texto)}</p></div>
      </div>`).join('\n      ');

  return envoltura('s-proceso', `
    <div class="interior">
      ${tope(d.serie, n, s.rotulo)}
      <div class="centro">
        <h2 class="titular${holgado(s.titular)}">${titular(s.titular)}</h2>
        <div class="puntos">${puntos}</div>
      </div>
    </div>`);
}

// ── 5 · Los números ───────────────────────────────────────────────────────
function numeros(d, n) {
  const s = d.slides.numeros;
  const fila = (f, clase = '') => `<tr class="${clase}">
        <td>${esc(f.movimiento)}</td>
        <td class="n antes">${esc(f.antes)}</td>
        <td class="n">${esc(f.ahora)}</td>
        <td class="n delta">${esc(f.delta)}</td>
      </tr>`;

  return envoltura('s-numeros', `
    <div class="interior">
      ${tope(d.serie, n, s.rotulo)}
      <div class="centro">
        <h2 class="titular${holgado(s.titular)}">${titular(s.titular)}</h2>
        <table class="tabla">
          <thead><tr>${(s.columnas || []).map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
          <tbody>
            ${(s.filas || []).map((f) => fila(f)).join('\n            ')}
            ${s.total ? fila(s.total, 'total') : ''}
          </tbody>
        </table>
      </div>
      <div class="pie-slide"><div class="mono nota-kg">${esc(s.nota)}</div></div>
    </div>`);
}

// ── 6 · El día ────────────────────────────────────────────────────────────
function momento(d, n) {
  const s = d.slides.momento;
  return envoltura('s-momento', `
    ${fondo(s.foto, 'vineta arriba abajo')}
    <div class="interior">
      ${tope(d.serie, n, s.rotulo)}
      <div class="pie-slide">
        <h2 class="titular${holgado(s.titular)}">${titular(s.titular)}</h2>
        <p class="cuerpo">${rico(s.cuerpo)}</p>
        ${s.cita ? `<div class="susurro">“${esc(s.cita)}”</div>` : ''}
      </div>
    </div>`);
}

// ── 7 · Cierre ────────────────────────────────────────────────────────────
function cierre(d, n) {
  const s = d.slides.cierre;
  return envoltura('s-cierre', `
    <div class="interior">
      ${tope(d.serie, n, s.rotulo)}
      <div class="centro">
        <h2 class="titular${holgado(s.titular)}">${titular(s.titular)}</h2>
        <p class="cuerpo">${rico(s.cuerpo)}</p>
      </div>
      <div class="pie-slide">
        <div class="cta">
          <div class="et">${esc(s.cta.etiqueta)}</div>
          <div class="tx">${rico(s.cta.texto)}</div>
        </div>
        <div class="firma-serie mono">${esc(d.serie.cuenta)} · ${esc(d.serie.titulo)} N°${String(d.serie.numero).padStart(2, '0')}</div>
      </div>
    </div>`);
}

// Orden de la serie. Cambiarlo aquí cambia el carrusel entero.
const INTERIORES = [
  { id: 'presentacion', fn: presentacion },
  { id: 'partida', fn: partida },
  { id: 'proceso', fn: proceso },
  { id: 'numeros', fn: numeros },
  { id: 'momento', fn: momento },
  { id: 'cierre', fn: cierre }
];

module.exports = { INTERIORES };
