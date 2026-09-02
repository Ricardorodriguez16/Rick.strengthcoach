# Athlete Spotlight — carrusel de Instagram

Genera los 7 slides de la serie **Athlete Spotlight · Behind the Lift** en 1080 × 1350 y los
exporta a PNG retina. Se diligencia un solo archivo, `datos.json`, y sale el carrusel completo
más el pie de foto.

```bash
node generar.js     # HTML en salida/ — Node 18+, sin dependencias
node render.js      # PNG 2160 × 2700 en png/ — usa el Chrome que tengas instalado
```

`salida/index.html` es la hoja de contacto con los 7 slides a escala. `salida/caption.txt` es el
texto para publicar, armado con los mismos números de la tabla para que no se descuadren.

## La portada

El N°7 tenía tres problemas: el titular más grande de la portada era el nombre de la serie y no
el atleta, el texto iba centrado sobre la parte más cargada de la foto sin nada que lo apoyara, y
el número de la entrega —lo único que distingue una portada de la siguiente— quedaba escondido
dentro del título.

La N°8 los corrige:

- **El número manda.** El `08` sale a 356 px en contorno dorado, mordido por el borde izquierdo.
  Es lo que hace reconocible la serie de una entrega a otra.
- **El atleta es el titular.** El nombre va en el cuerpo más grande; `ATHLETE SPOTLIGHT` baja a
  cintillo. Quien pasa por el feed ve una persona, no una plantilla.
- **El texto se apoya en negro.** Velo de abajo hacia arriba, viñeta y gradación de la foto a gris
  cálido: las letras nunca pelean con la imagen.
- **Retícula a la izquierda.** Márgenes de 76 px, todo alineado, y una franja de tres marcas al
  pie que da la credencial del atleta antes de deslizar.
- **94 px de margen inferior**, porque Instagram tapa esa franja con el usuario y los puntos del
  carrusel.

Se generan **tres variantes** de portada y las tres quedan en `salida/` y `png/` para compararlas
de verdad y no de memoria:

| | Cómo es | Cuándo |
|---|---|---|
| **A · Apilada** | Foto a sangre, `08` mordido por la izquierda, texto anclado abajo | La de por defecto: más golpe en el feed |
| **B · Expediente** | Foto enmarcada sobre papel negro, ficha del atleta debajo | Se lee mejor en miniatura; más sobria |
| **C · Partida** | Foto arriba, panel negro abajo, `08` a caballo entre los dos | La más gráfica si la serie va a ser larga |

Se cambia con `portada.variante` en `datos.json` (`"A"`, `"B"` o `"C"`).

## Los 7 slides

| # | Slide | Qué cuenta |
|---|---|---|
| 1 | Portada | Nombre, marcas y número de entrega |
| 2 | Quién es | De dónde salió y con qué llegó |
| 3 | El punto de partida | La cita del atleta y el problema real |
| 4 | Lo que cambió | Tres decisiones de entrenamiento |
| 5 | Los números | Tabla antes → ahora con la diferencia |
| 6 | El día | El levantamiento de la foto |
| 7 | Lo que me llevo | Conclusión del coach y llamada a la acción |

El orden y el reparto están en `INTERIORES`, al final de `plantillas/slides.js`.

## Encuadre de las fotos sin editor

Cada marco tiene una proporción distinta, así que la misma foto necesita un recorte distinto en
cada uno. Se ajusta desde `datos.json` sin abrir un editor de imagen:

```json
"foto": { "archivo": "activos/atleta-08.jpg", "foco": "54% 62%", "zoom": 1.14 }
```

`foco` mueve la ventana visible (subir el segundo número sube la foto dentro del marco) y `zoom`
acerca. `portada.encuadres` lleva un ajuste propio para cada variante de portada.

## Cuando el texto no cabe

Cada slide se mide a sí mismo al abrirse y marca en el `<body>` cuántos píxeles se sale del margen
inferior. `render.js` lo lee y avisa al terminar:

```
· 04-proceso.png    671 KB   ⚠ se sale 38 px
```

Si aparece el aviso, se acorta el texto en `datos.json` o se baja el cuerpo en
`plantillas/estilos.js`. La medición espera a que carguen las fuentes: con la tipografía de
reserva el texto ocupa menos y el slide parece caber cuando en el PNG sale cortado.

## Tildes en los titulares

Anton dibuja las tildes muy por encima de la altura de mayúscula. Con el interlineado cerrado de
cartel, la tilde de una línea cae dentro de la letra blanca de la línea anterior y **RÍOS se lee
RIOS**. `lib/formato.js` detecta si el titular lleva tildes y, solo en ese caso, le abre el
interlineado. Los titulares sin tildes mantienen el cierre.

## Estructura

```
datos.json              todo lo que hay que llenar: atleta, marcas, copy de los 7 slides
generar.js              punto de entrada — HTML + caption.txt
render.js               exporta salida/ a PNG con Chrome y avisa si algo no cabe
activos/atleta-08.jpg   la foto del atleta
lib/fuentes.css         Anton, Archivo y JetBrains Mono en base64 (el HTML no depende de internet)
lib/formato.js          escapado, fotos incrustadas, encuadre y el arreglo de las tildes
plantillas/estilos.js   tokens, marco del slide, portadas y slides interiores
plantillas/portada.js   las tres variantes de portada
plantillas/slides.js    los seis slides interiores y su orden
salida/                 HTML + hoja de contacto + caption.txt
png/                    los slides en 2160 × 2700
```

## Sistema visual

Para la entrega N°9 no hay que volver a decidir nada de esto:

```
Display    Anton 400              titulares y cifras
Texto      Archivo 400–800        cuerpo, cintillos y epígrafes
Cifras     JetBrains Mono 500/700 datos, contador y etiquetas

--tinta   #0A0A0B    fondo
--hueso   #F4F2ED    texto
--oro     #E9B93C    acento, uno solo
--M       76px       retícula
--MB      94px       margen inferior seguro de Instagram
```

Se copia la carpeta, se cambian `datos.json` y la foto, y se sube `serie.numero` a 9.
