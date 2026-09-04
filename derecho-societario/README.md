# Derecho societario y empresarial — manual de trabajo del temario

Documento de treinta páginas en A4 apaisado que desarrolla el temario completo del curso, con la misma
factura del cuadro comparativo de tipos societarios pero cubriendo las seis unidades, no solo una.

| Unidad | Contenido | Páginas |
|---|---|---|
| — | Portada, índice y mapa del temario con línea de tiempo normativa | 1–3 |
| 1 | Nociones básicas: objeto y fuentes, contrato de sociedad, persona jurídica y órganos | 4–6 |
| 2 | Tipos de sociedades: criterios de clasificación, matriz de los seis tipos, elección del vehículo | 7–9 |
| 3 | Estructuras no societarias: cuadro maestro, sucursales, colaboración empresarial, patrimonios autónomos, sociedades de hecho | 10–14 |
| T1 | Taller 1: cinco casos y su guía de solución | 15–16 |
| 4 | Constitución: requisitos, procedimiento de trece pasos, control de legalidad y reformas | 17–19 |
| 5 | Contrato societario: características, estatutos, pactos para-estatutarios, levantamiento del velo | 20–23 |
| 6 | El capital social: concepto, aportes, estructura por tipo, utilidades y variaciones | 24–27 |
| T2 | Taller 2: cinco casos, ejercicio de cálculo y guía de solución | 28–29 |
| A | Glosario, fuentes normativas y advertencia de cierre | 30 |

Cada regla va con su artículo exacto y una nota de riesgo graduada en cuatro niveles. Las normas
derogadas —el artículo 370, la causal de disolución por pérdidas, los artículos 458 y 459— se señalan
como tales y no se transcriben como vigentes.

## Uso

```bash
node exportar.js     # genera pdf/Manual_derecho_societario_y_empresarial.pdf
```

Busca Chrome o Chromium en las rutas habituales de macOS, Windows y Linux; si no lo encuentra, se le
indica la ruta con `CHROME="/ruta/a/chrome" node exportar.js`. También sirve abrir `manual.html` en el
navegador e imprimir a PDF en A4 horizontal, con márgenes en cero y sin encabezados ni pies del navegador.

`manual.html` es autocontenido: estilos, diagramas SVG y numeración de folios van dentro del archivo, sin
dependencias externas. Para editarlo, cada página es una `<section class="hoja">` de alto fijo; el contenido
que se pase de esa altura **queda recortado sin aviso**, así que conviene revisar el resultado después de
agregar texto.

## Corte normativo

Legislación vigente a septiembre de 2026. El Proyecto de Ley 457 de 2025 Cámara —reforma al Código de
Comercio y al régimen societario— estaba en trámite a esa fecha: hay que verificar su estado antes de usar
el documento para emitir concepto.

Las sentencias de la Superintendencia de Sociedades en funciones jurisdiccionales se citan por caso y año,
no por radicado, porque la numeración circula con variantes en la doctrina. Antes de llevarlas a un escrito
conviene confrontarlas en la fuente oficial.
