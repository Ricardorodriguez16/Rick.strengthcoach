# Post de Instagram · Alan Cabrera — Sudamericano FESUPO Chile 2026

`alan-cabrera-sudamericano.png`: 1080 × 1350 (vertical 4:5), listo para subir.

## Regenerar

```bash
python3 preparar.py                          # recorte del atleta y logos → activos/
NODE_PATH="$(npm root -g)" node render.js    # post.html → PNG
```

`preparar.py` necesita `pip install "rembg[cpu]" pillow numpy opencv-python-headless` (la primera vez
descarga los modelos de recorte). `render.js` usa Playwright; el `--screenshot` de Chrome no sirve aquí
porque deja sin pintar la franja inferior del lienzo. El texto se edita directamente en `post.html`.

## Texto para la publicación

> ¡Mañana compite Alan Cabrera! 🏋️
>
> Sale a la plataforma en el Campeonato Sudamericano FESUPO Chile 2026, categoría −83 kg Sub Junior.
>
> 🇨🇴 11:00 a. m. hora Colombia
> 🇨🇱 1:00 p. m. hora Chile
>
> Le deseamos muchos éxitos en su competición. ¡Vamos, Alan! 💪
>
> #LIPOA #Powerlifting #LevantamientoDePotencia #FESUPO #SudamericanoFESUPO #Chile2026

## Estructura

```
post.html        diseño (tipografías y colores en :root)
preparar.py      fuentes/ → activos/
render.js        exporta el PNG
fuentes/         foto original y logos tal como llegaron
activos/         atleta recortado, insignia de LIPOA y logo del Sudamericano sin fondo
tipografias/     Big Shoulders Display y Barlow Condensed (SIL OFL)
filosofia.md     criterio visual del post
```
