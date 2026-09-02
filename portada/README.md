# Portada · Athlete Spotlight

Calco de la portada del N°7 —cuenta en dorado, titular blanco en una línea con el número de la
entrega y la bajada debajo, todo centrado— con la foto que toque en cada entrega.

```bash
node generar.js     # HTML en salida/ — Node 18+, sin dependencias
node render.js      # PNG 2160 × 2700 en png/ — usa el Chrome que tengas instalado
```

## Para la siguiente entrega

Se deja la foto nueva en `activos/`, se apunta a ella y se sube el número. Nada más:

```json
{
  "cuenta": "@RICK.STRENGTHCOACH",
  "titulo": "ATHLETE SPOTLIGHT",
  "numero": 9,
  "subtitulo": "BEHIND THE LIFT",

  "foto": {
    "archivo": "activos/atleta-09.jpg",
    "foco": "52% 58%",     ← mueve la ventana visible: subir el 2º número sube la foto
    "zoom": 1.16,          ← acerca sin abrir un editor de imagen
    "oscurecer": 0.5,      ← cuánto se apaga la foto para que el titular blanco respire
    "saturacion": 0.72,
    "calido": 0.1
  }
}
```

Los tamaños del texto están calcados de las proporciones del N°7: la cuenta y la bajada ocupan un
28 % del ancho y el titular un 84 %. Si se cambia el largo del titular hay que revisar que siga
cabiendo en una línea.

Las fuentes van incrustadas en base64 en `lib/fuentes.css`, así que el HTML se abre igual sin
internet y sin tenerlas instaladas.
