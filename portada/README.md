# Portada · Athlete Spotlight N°8

Misma dinámica de la portada del N°7 —cuenta en dorado, titular blanco con el número de la
entrega y la bajada debajo— con la foto nueva. Cuatro opciones para elegir.

```bash
node generar.js     # HTML en salida/ — Node 18+, sin dependencias
node render.js      # PNG 2160 × 2700 en png/ — usa el Chrome que tengas instalado
```

| Opción | Cómo es |
|---|---|
| **1 · Calco** | La del N°7 tal cual: titular en una línea, bloque centrado |
| **2 · Abajo** | Mismo bloque en el tercio inferior; se ve la cara y la barra |
| **3 · Dos líneas** | El titular parte y el `N°8` gana tamaño de cartel |
| **4 · Acento** | Como la 1, con filete dorado y el `N°8` en el color de la cuenta |

## Ajustes

Todo sale de `datos.json`. Para la entrega N°9 se cambia la foto y se sube `numero`.

```json
"foto": {
  "archivo": "activos/atleta-08.jpg",
  "foco": "52% 56%",     ← mueve la ventana visible: subir el 2º número sube la foto
  "zoom": 1.2,           ← acerca sin abrir un editor de imagen
  "oscurecer": 0.46,     ← cuánto se apaga la foto para que el titular blanco respire
  "calido": 0.18         ← temperatura, como el tono rojizo del N°7
}
```

Las fuentes (Archivo y Anton) van incrustadas en base64 en `lib/fuentes.css`, así que el HTML
se abre igual sin internet y sin tenerlas instaladas.
