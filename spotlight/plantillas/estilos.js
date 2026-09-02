'use strict';

const fs = require('fs');
const path = require('path');

const fuentes = fs.readFileSync(path.join(__dirname, '..', 'lib', 'fuentes.css'), 'utf8');

// Grano de película en SVG: le quita el plano digital a los fondos negros y a
// los degradados. Va como data URI para no sacar un PNG aparte.
const GRANO = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">
     <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
     <feColorMatrix type="saturate" values="0"/></filter>
     <rect width="220" height="220" filter="url(#g)" opacity="0.42"/>
   </svg>`);

const estilos = `
${fuentes}

/* ── Tokens ───────────────────────────────────────────────────────────────
   Negro cálido de base, hueso para el texto y un solo acento dorado. Un color
   de acento y no tres: lo que manda en la portada es la foto, no la paleta. */
:root{
  --tinta:#0A0A0B;
  --tinta-2:#141416;
  --hueso:#F4F2ED;
  --humo:rgba(244,242,237,.58);
  --oro:#E9B93C;
  --oro-suave:rgba(233,185,60,.22);
  --linea:rgba(244,242,237,.16);
  --W:1080px;
  --H:1350px;
  --M:76px;              /* margen de la retícula */
  --MB:94px;             /* margen inferior: Instagram tapa la franja de abajo
                            con el usuario y los puntos del carrusel */
}

*{margin:0;padding:0;box-sizing:border-box;}
html,body{background:#111;}
body{
  font-family:'Archivo',system-ui,sans-serif;
  color:var(--hueso);
  -webkit-font-smoothing:antialiased;
  text-rendering:geometricPrecision;
}

/* ── Marco del slide ──────────────────────────────────────────────────── */
.slide{
  position:relative;
  width:var(--W);
  height:var(--H);
  overflow:hidden;
  background:var(--tinta);
  isolation:isolate;
}
.slide::after{                      /* grano, siempre encima de todo */
  content:'';
  position:absolute;
  inset:0;
  background-image:url("${GRANO}");
  background-size:220px 220px;
  mix-blend-mode:overlay;
  opacity:.5;
  pointer-events:none;
  z-index:90;
}

/* ── Foto ─────────────────────────────────────────────────────────────── */
.foto{position:absolute;inset:0;overflow:hidden;z-index:0;}
.foto img{
  width:100%;height:100%;
  object-fit:cover;
  display:block;
  transform-origin:center;
  /* Gradación: se le baja el color a la foto de gimnasio (luces verdosas,
     paredes azules) para que la portada lea a blanco y negro con temperatura. */
  filter:grayscale(.72) contrast(1.16) brightness(.86) sepia(.16);
}
/* Velo inferior: el texto se apoya en negro sólido, no pelea con la imagen. */
.velo{position:absolute;inset:0;z-index:1;pointer-events:none;}
.velo.abajo{background:linear-gradient(to top,
  rgba(10,10,11,.97) 0%, rgba(10,10,11,.93) 24%, rgba(10,10,11,.72) 42%,
  rgba(10,10,11,.28) 62%, rgba(10,10,11,0) 82%);}
.velo.arriba{background:linear-gradient(to bottom,
  rgba(10,10,11,.82) 0%, rgba(10,10,11,.30) 22%, rgba(10,10,11,0) 40%);}
.velo.vineta{background:radial-gradient(120% 78% at 50% 38%,
  rgba(10,10,11,0) 40%, rgba(10,10,11,.55) 100%);}

/* ── Tipografía ───────────────────────────────────────────────────────── */
.display{
  font-family:'Anton',Impact,sans-serif;
  font-weight:400;
  line-height:.92;
  letter-spacing:-.018em;
  text-transform:uppercase;
  text-align:left;
}
.rotulo{                            /* cintillo de sección */
  font-family:'Archivo',sans-serif;
  font-weight:800;
  font-size:19px;
  letter-spacing:.30em;
  text-transform:uppercase;
  text-align:left;
}
.mono{
  font-family:'JetBrains Mono',monospace;
  font-weight:500;
  letter-spacing:.16em;
  text-transform:uppercase;
}
.cuerpo{
  font-family:'Archivo',sans-serif;
  font-weight:400;
  font-size:30px;
  line-height:1.44;
  letter-spacing:-.004em;
  color:rgba(244,242,237,.86);
  text-align:left;
}
.cuerpo strong{font-weight:700;color:var(--hueso);}
.oro{color:var(--oro);}

/* ── Piezas comunes ───────────────────────────────────────────────────── */
.marca{                             /* @rick.strengthcoach arriba a la izq. */
  display:flex;align-items:center;gap:14px;
  font-family:'Archivo',sans-serif;font-weight:700;
  font-size:18px;letter-spacing:.22em;text-transform:uppercase;color:var(--oro);
}
.marca::before{content:'';width:34px;height:3px;background:var(--oro);}
.contador{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:17px;letter-spacing:.10em;color:rgba(244,242,237,.72);
  border:1.5px solid var(--linea);border-radius:999px;padding:9px 17px;
}
.cabecera{
  position:absolute;top:var(--M);left:var(--M);right:var(--M);
  display:flex;align-items:center;justify-content:space-between;z-index:40;
}
.regla{height:1.5px;background:var(--linea);width:100%;}

/* Franja de marcas al pie: la credencial del atleta en tres celdas. */
.marcas{display:grid;grid-template-columns:repeat(3,1fr);border-top:1.5px solid var(--linea);}
.marcas .celda{padding:24px 26px 0 0;border-right:1.5px solid var(--linea);}
.marcas .celda + .celda{padding-left:30px;}
.marcas .celda:last-child{border-right:0;padding-right:0;}
.marcas .celda .et{font-family:'JetBrains Mono',monospace;font-weight:500;font-size:15px;
  letter-spacing:.22em;color:var(--humo);text-transform:uppercase;margin-bottom:10px;}
.marcas .celda .nu{font-family:'Anton',sans-serif;font-size:60px;line-height:.9;letter-spacing:-.01em;}
.marcas .celda .nu span{font-family:'Archivo',sans-serif;font-weight:600;font-size:20px;
  letter-spacing:.04em;margin-left:6px;color:var(--humo);vertical-align:.32em;}

/* ── Slides interiores ────────────────────────────────────────────────── */
.interior{display:flex;flex-direction:column;padding:var(--M) var(--M) var(--MB);z-index:10;position:relative;height:100%;}
.interior .tope{flex:none;}
.interior .tope .fila{display:flex;align-items:center;justify-content:space-between;}
.rotulo.seccion{margin-top:46px;padding-top:24px;border-top:1.5px solid var(--linea);}
.interior .num{
  font-family:'Anton',sans-serif;font-size:22px;color:var(--oro);letter-spacing:.04em;
}
.titular{font-family:'Anton',sans-serif;font-size:86px;line-height:.98;letter-spacing:-.02em;
  text-transform:uppercase;text-align:left;margin:0 0 30px;}
/* Interlineado de rescate para titulares con tilde (ver lib/formato.js). */
.display.holgado,.titular.holgado{line-height:1.22;}
.titular .baja{color:var(--humo);}
.pie-slide{margin-top:auto;padding-top:34px;flex:none;}

/* Cita: filete dorado a la izquierda en vez de comilla decorativa. */
.cita{position:relative;padding-left:34px;border-left:5px solid var(--oro);}
.cita p{font-family:'Archivo',sans-serif;font-weight:600;font-size:42px;line-height:1.26;
  letter-spacing:-.012em;text-align:left;position:relative;}
.cita .firma{margin-top:30px;}

/* Tabla de números: antes → ahora, con la diferencia en dorado. */
.tabla{width:100%;border-collapse:collapse;}
.tabla th{font-family:'JetBrains Mono',monospace;font-weight:500;font-size:16px;
  letter-spacing:.18em;color:var(--humo);text-transform:uppercase;
  text-align:right;padding:0 0 18px;}
.tabla th:first-child{text-align:left;}
.tabla td{padding:19px 0;border-top:1.5px solid var(--linea);vertical-align:baseline;}
.tabla td:first-child{font-family:'Archivo',sans-serif;font-weight:700;font-size:30px;
  letter-spacing:.02em;text-transform:uppercase;}
.tabla td.n{text-align:right;font-family:'Anton',sans-serif;font-size:52px;letter-spacing:-.01em;}
.tabla td.n.antes{color:rgba(244,242,237,.42);}
.tabla td.n.delta{color:var(--oro);font-size:40px;}
.tabla tr.total td{border-top:3px solid var(--oro);}
.tabla tr.total td:first-child{color:var(--oro);}

/* Lista de puntos numerados de los slides de proceso. */
.puntos{display:flex;flex-direction:column;gap:32px;}
.punto{display:grid;grid-template-columns:76px 1fr;gap:8px;align-items:start;}
.punto .i{font-family:'Anton',sans-serif;font-size:44px;color:var(--oro);line-height:.9;}
.punto h3{font-family:'Archivo',sans-serif;font-weight:800;font-size:31px;letter-spacing:-.01em;
  text-transform:uppercase;margin-bottom:9px;}
.punto p{font-family:'Archivo',sans-serif;font-weight:400;font-size:26px;line-height:1.42;
  color:rgba(244,242,237,.78);}

/* Cierre con llamada a la acción. */
.cta{border:2px solid var(--oro);border-radius:6px;padding:30px 36px;}
.cta .et{font-family:'JetBrains Mono',monospace;font-weight:500;font-size:16px;letter-spacing:.22em;
  color:var(--oro);text-transform:uppercase;margin-bottom:14px;}
.cta .tx{font-family:'Archivo',sans-serif;font-weight:700;font-size:33px;line-height:1.22;
  letter-spacing:-.01em;}

/* ── Piezas de los slides interiores ─────────────────────────────────────── */
.interior .centro{flex:1;display:flex;flex-direction:column;justify-content:flex-end;min-height:0;}
.interior .cuerpo + .cuerpo{margin-top:22px;}
.marcas.ficha{margin-top:32px;}
.marcas.ficha .nu.chico{font-family:'Archivo',sans-serif;font-weight:700;font-size:26px;
  letter-spacing:-.005em;line-height:1.2;}
.regla.separador{margin:34px 0 0;}
.cuerpo.nota{margin-top:24px;font-size:27px;color:rgba(244,242,237,.72);}
.nota-kg{font-size:17px;letter-spacing:.16em;color:var(--humo);padding-top:26px;
  border-top:1.5px solid var(--linea);}
.susurro{margin-top:26px;font-family:'Archivo',sans-serif;font-weight:600;font-style:italic;
  font-size:28px;line-height:1.32;color:var(--oro);letter-spacing:-.008em;}
.firma-serie{margin-top:30px;font-size:16px;letter-spacing:.20em;color:var(--humo);}
.s-numeros .centro,.s-proceso .centro{width:100%;}
.s-presentacion .titular,.s-momento .titular{font-size:78px;}
.s-presentacion .cuerpo,.s-momento .cuerpo{max-width:880px;}

/* ── Portadas ─────────────────────────────────────────────────────────────
   Tres encuadres del mismo sistema. Cambian la arquitectura, no la paleta ni
   la tipografía: la serie se tiene que reconocer entre entregas. */
.kicker{
  display:flex;align-items:center;gap:15px;
  font-family:'Archivo',sans-serif;font-weight:800;font-size:19px;
  letter-spacing:.30em;text-transform:uppercase;color:var(--hueso);
}
.kicker i{width:30px;height:3px;background:var(--oro);flex:none;}
.cifra-serie{
  position:absolute;
  font-family:'Anton',sans-serif;
  line-height:.74;
  color:transparent;
  -webkit-text-stroke:3.5px rgba(233,185,60,.80);
  z-index:5;
  pointer-events:none;
}

/* A · APILADA */
.portada-a .cifra-serie{left:-52px;bottom:702px;font-size:356px;}
.portada-a .bloque{position:absolute;left:var(--M);right:var(--M);bottom:var(--MB);z-index:20;}
.portada-a .nombre{font-size:126px;margin:26px 0 20px;}
.portada-a .sub{font-size:21px;letter-spacing:.34em;color:var(--oro);margin-bottom:42px;}

/* B · EXPEDIENTE */
.portada-b{background:var(--tinta);}
.portada-b .ventana{position:absolute;left:var(--M);right:var(--M);top:154px;height:588px;
  overflow:hidden;border-radius:3px;z-index:10;}
.portada-b .ventana .foto img{filter:grayscale(.70) contrast(1.18) brightness(.92) sepia(.14);}
.portada-b .sello{position:absolute;left:26px;bottom:24px;z-index:20;font-size:17px;
  font-weight:700;color:var(--oro);letter-spacing:.14em;}
.portada-b .cifra-serie{right:calc(var(--M) - 6px);top:790px;font-size:236px;
  -webkit-text-stroke-width:3px;}
.portada-b .bloque{position:absolute;left:var(--M);right:var(--M);top:784px;z-index:20;}
.portada-b .nombre{font-size:100px;margin:22px 0 18px;}
.portada-b .ficha{font-size:18px;letter-spacing:.20em;color:var(--humo);margin-bottom:34px;}

/* C · PARTIDA */
.portada-c{background:var(--tinta);}
.portada-c .mitad{position:absolute;top:0;left:0;right:0;height:800px;overflow:hidden;z-index:1;}
.portada-c .desvanecido{position:absolute;left:0;right:0;bottom:0;height:280px;z-index:5;
  background:linear-gradient(to top,var(--tinta) 8%,rgba(10,10,11,.6) 48%,rgba(10,10,11,0) 100%);}
.portada-c .cifra-serie{right:-16px;top:636px;font-size:296px;z-index:15;}
.portada-c .bloque{position:absolute;left:var(--M);right:var(--M);bottom:var(--MB);z-index:20;}
.portada-c .nombre{font-size:126px;margin:26px 0 20px;}
.portada-c .sub{font-size:21px;letter-spacing:.34em;color:var(--oro);margin-bottom:42px;}

/* ── Hoja de contacto (index) ─────────────────────────────────────────── */
body.indice{background:#0E0E10;padding:56px;font-family:'Archivo',sans-serif;}
body.indice h1{font-family:'Anton',sans-serif;font-size:44px;letter-spacing:-.01em;
  text-transform:uppercase;margin-bottom:8px;}
body.indice p.sub{color:var(--humo);font-size:18px;margin-bottom:40px;}
body.indice .tira{display:flex;flex-wrap:wrap;gap:26px;}
body.indice figure{width:340px;}
body.indice iframe{width:1080px;height:1350px;border:0;transform:scale(.3148);
  transform-origin:top left;pointer-events:none;}
body.indice .marco{width:340px;height:425px;overflow:hidden;border:1px solid var(--linea);
  border-radius:4px;background:#000;}
body.indice figcaption{margin-top:12px;font-size:15px;color:var(--humo);}
body.indice figcaption a{color:var(--hueso);text-decoration:none;font-weight:700;}
body.indice figcaption a:hover{color:var(--oro);}
`;

module.exports = estilos;
