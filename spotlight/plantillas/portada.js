'use strict';

const { esc, imagenIncrustada, encuadre, holgado } = require('../lib/formato');

// El número de la entrega es el ancla de la serie: en el N°7 iba escondido
// dentro del titular. Aquí sale a tamaño de cartel, en contorno, mordido por el
// borde izquierdo. Es lo que hace reconocible una portada a la siguiente.
const numeroSerie = (n) => String(n).padStart(2, '0');

const marcasPie = (marcas = []) => !marcas.length ? '' : `
    <div class="marcas">
      ${marcas.map((m) => `<div class="celda">
        <div class="et">${esc(m.etiqueta)}</div>
        <div class="nu">${esc(m.valor)}${m.unidad ? `<span>${esc(m.unidad)}</span>` : ''}</div>
      </div>`).join('\n      ')}
    </div>`;

const cabecera = (s) => `
    <div class="cabecera">
      <div class="marca">${esc(s.cuenta)}</div>
      <div class="contador">1 / ${esc(s.totalSlides)}</div>
    </div>`;

// Nombre en dos líneas: el apellido debajo del nombre pesa más que una línea
// larga y encajada. Se corta por el espacio, o donde diga el usuario con "|".
function nombreEnLineas(nombre) {
  if (nombre.includes('|')) return nombre.split('|').map((t) => t.trim());
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 1) return partes;
  const corte = Math.ceil(partes.length / 2);
  return [partes.slice(0, corte).join(' '), partes.slice(corte).join(' ')];
}

const foto = (f, clases = '') => {
  const uri = imagenIncrustada(f.archivo);
  return `<div class="foto ${clases}">
      <img src="${uri}" alt="" style="${encuadre(f)}">
    </div>`;
};

const fotoDe = (portada, variante) =>
  ({ ...portada.foto, ...((portada.encuadres || {})[variante] || {}) });

// ── A · APILADA ───────────────────────────────────────────────────────────
// Foto a sangre, velo hacia arriba y todo el texto anclado abajo a la
// izquierda sobre negro sólido. Es la que recomiendo: la foto respira, el
// texto nunca pelea con la imagen y el 08 le da arquitectura al encuadre.
function variantePilada(d) {
  const { serie, portada, atleta } = d;
  const f = fotoDe(portada, 'A');
  const [l1, l2] = nombreEnLineas(atleta.nombre);
  return `<div class="slide portada-a">
    ${foto(f)}
    <div class="velo vineta"></div>
    <div class="velo arriba"></div>
    <div class="velo abajo"></div>
    ${cabecera(serie)}
    <div class="cifra-serie">${numeroSerie(serie.numero)}</div>
    <div class="bloque">
      <div class="kicker"><i></i>${esc(serie.titulo)}</div>
      <h1 class="display nombre${holgado(atleta.nombre)}">${esc(l1)}${l2 ? `<br>${esc(l2)}` : ''}</h1>
      <div class="sub mono">${esc(serie.subtitulo)}</div>
      ${marcasPie(portada.marcas)}
    </div>
  </div>`;
}

// ── B · EXPEDIENTE ────────────────────────────────────────────────────────
// La foto va enmarcada sobre papel negro, como ficha de revista. Más sobria y
// más fácil de leer en el feed pequeño; pierde algo de golpe.
function varianteExpediente(d) {
  const { serie, portada, atleta } = d;
  const f = fotoDe(portada, 'B');
  const [l1, l2] = nombreEnLineas(atleta.nombre);
  return `<div class="slide portada-b">
    ${cabecera(serie)}
    <div class="ventana">
      ${foto(f)}
      <div class="velo vineta"></div>
    </div>
    <div class="cifra-serie">${numeroSerie(serie.numero)}</div>
    <div class="bloque">
      <div class="kicker"><i></i>${esc(serie.titulo)} · ${esc(serie.subtitulo)}</div>
      <h1 class="display nombre${holgado(atleta.nombre)}">${esc(l1)}${l2 ? `<br>${esc(l2)}` : ''}</h1>
      <div class="ficha mono">${esc([atleta.categoria, atleta.gimnasio].filter(Boolean).join('  ·  '))}</div>
      ${marcasPie(portada.marcas)}
    </div>
  </div>`;
}

// ── C · PARTIDA ───────────────────────────────────────────────────────────
// Foto arriba, panel negro abajo y el 08 a caballo entre los dos. La más
// gráfica de las tres; funciona muy bien si la serie va a ser larga.
function varianteCortada(d) {
  const { serie, portada, atleta } = d;
  const f = fotoDe(portada, 'C');
  const [l1, l2] = nombreEnLineas(atleta.nombre);
  return `<div class="slide portada-c">
    <div class="mitad">
      ${foto(f)}
      <div class="velo vineta"></div>
      <div class="velo arriba"></div>
      <div class="desvanecido"></div>
    </div>
    ${cabecera(serie)}
    <div class="cifra-serie">${numeroSerie(serie.numero)}</div>
    <div class="bloque">
      <div class="kicker"><i></i>${esc(serie.titulo)}</div>
      <h1 class="display nombre${holgado(atleta.nombre)}">${esc(l1)}${l2 ? `<br>${esc(l2)}` : ''}</h1>
      <div class="sub mono">${esc(serie.subtitulo)}</div>
      ${marcasPie(portada.marcas)}
    </div>
  </div>`;
}

const VARIANTES = { A: variantePilada, B: varianteExpediente, C: varianteCortada };

const portada = (d, variante) => (VARIANTES[variante] || VARIANTES.A)(d);

module.exports = { portada, VARIANTES: Object.keys(VARIANTES), nombreEnLineas, marcasPie, cabecera, foto };
