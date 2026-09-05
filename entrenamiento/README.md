# Plan Cuatro y Seis

Plan de entrenamiento de cinco sesiones semanales para una atleta de 22 años y 62 kg que entrena
en casa con un par de mancuernas de 4 kg y otro de 6 kg, y que busca perder grasa en déficit
calórico.

| Archivo | Qué es |
|---|---|
| `plan-5-dias.html` | El plan completo. Se abre en el navegador; es también la versión publicada. |
| `plan-5-dias.pdf` | El mismo plan en A4, con las fuentes incrustadas y los vídeos como enlaces. |
| `pdf.js` | Genera el PDF: `node entrenamiento/pdf.js` (Node 18+, sin dependencias, usa Chrome). |

Los días 2 y 5 son de pilates a elección de la atleta; la fuerza queda en los días 1, 3 y 4.
Cada ejercicio enlaza a un vídeo de técnica en YouTube.

## Cómo está construido el plan

La restricción real es la carga: 6 kg por mano es poco para el tren inferior, así que el estímulo
se genera con tempo (excéntricas de 3-4 s), pausas, trabajo a una pierna y cercanía al fallo
(RIR 3 → 1 a lo largo del bloque), no con peso. La progresión sube exigencia semana a semana y
descarga en la cuarta.

El déficit sale de un gasto estimado en ~2.000 kcal (Mifflin-St Jeor con factor de actividad 1,45
por 3 sesiones de fuerza, 2 de pilates y 7-10 k pasos): 1.650 kcal, 2 g/kg de proteína y un ritmo
de pérdida de 0,4 kg por semana. Los pasos quedan por debajo del máximo a propósito, como margen
para cuando el peso se estanque.

## Nota sobre el PDF

`pdf.js` descarga las fuentes de la API v1 de Google Fonts, que sirve una instancia estática por
peso: las variables de la v2 se renderizan con el peso mínimo en Chrome headless. El HTML no lleva
`<meta charset>` porque el publicador lo añade al envolver la página, así que el script lo inserta
antes de imprimir.
