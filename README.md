# Documentación laboral — Unidad Pedagógica Bolivariana

Generador de los documentos que suelen pedirle a un trabajador de la institución en un banco,
una entidad de crédito o un consulado. Se diligencia un solo archivo y salen todos con el escudo,
el NIT y la firma de la rectoría.

| Documento | Archivo |
|---|---|
| Constancia laboral | `constancia-laboral.html` |
| Desprendibles de nómina (3 meses) | `desprendible-nomina-2026-06/07/08.html` |
| Certificado de ingresos y retenciones | `certificado-ingresos-retenciones-2025.html` |
| Certificación de retención del año en curso | `certificacion-no-retencion-2026.html` |

## Uso

```bash
node generar.js          # Node 18+, sin dependencias
```

Los archivos quedan en `salida/`. Abre `salida/index.html` para ver el listado y entrar a cada uno.
Para el PDF: abrir en el navegador → **Imprimir** → **Guardar como PDF**, con márgenes por defecto
y sin encabezados ni pies del navegador. El escudo va incrustado en el HTML, así que el archivo se
puede enviar por correo sin adjuntar la imagen aparte.

## Qué falta diligenciar

Todo vive en `datos.json`. Lo que quede vacío sale como línea en blanco para llenar a mano, y el
generador lo lista al terminar:

- `empleado.nombre`, `empleado.documento`, `empleado.cargo`, `empleado.fechaIngreso`
- `empleado.genero` — `"F"` o `"M"`. Ajusta la redacción de los tres documentos (*la señora …
  identificada … vinculada*). Si se deja vacío, sale la forma neutra con paréntesis.
- `empleado.eps`, `empleado.fondoPension`, `empleado.banco`, `empleado.cuenta`
- `empleador.telefono` y `empleador.correo` — aparecen en la constancia como datos de verificación
- `constancia.consecutivo` — el radicado interno del documento

Ya están cargados el NIT (900.385.699-4, con dígito de verificación), el escudo (`activos/logo.jpg`)
y la firma de Claudia García, rectora y representante legal, C.C. 32.857.367.

## Cifras 2026

| Concepto | Valor | Norma |
|---|---|---|
| Salario básico mensual | $ 2.500.000 | contrato |
| Auxilio de transporte | $ 249.095 | Decreto 1470 de 2025 |
| **Total devengado** | **$ 2.749.095** | |
| Aporte a salud 4 % + pensión 4 % | $ 200.000 | Ley 100 de 1993, arts. 204 y 271 |
| Retención en la fuente | $ 0 | E.T. arts. 383 y 388 |
| **Neto mensual** | **$ 2.549.095** | |
| Salario mínimo de referencia | $ 1.750.905 | Decreto 1469 de 2025 |
| UVT | $ 52.374 | Resolución DIAN 000238 de 2025 |

Notas de cálculo:

- El **auxilio de transporte** se sigue causando: se debe a quien gana hasta 2 salarios mínimos
  ($ 3.501.810 en 2026). No es base de aportes a seguridad social (Ley 344 de 1996, art. 17), por
  eso los descuentos salen sobre el salario básico.
- La **retención en la fuente** no está fija en cero: `lib/retencion.js` hace la depuración mensual
  del artículo 388 (devengado − aportes obligatorios − 25 % de renta exenta, con los topes de los
  arts. 206 y 336) y aplica la tabla del artículo 383. Con $ 2.500.000 la base gravable queda en
  $ 1.911.821 — 36,5 UVT — muy por debajo de las 95 UVT donde arranca la tabla, así que da cero.
  Si el salario sube, el desprendible calcula la retención sola.
- `Valor mensualidad: 2.500.000` se interpretó como **salario básico**, con el auxilio de transporte
  aparte. Si esos $ 2.500.000 eran el total que recibe al mes, cambia `salario.basicoMensual` a
  `2250905` y el auxilio queda dentro.

## Estructura

```
datos.json              todo lo que hay que llenar
generar.js              punto de entrada
activos/logo.jpg        escudo de la institución
lib/formato.js          moneda, fechas, cifras en letras, concordancia de género
lib/retencion.js        depuración y tabla del art. 383 E.T.
plantillas/             estilos, encabezado y firmas comunes + un archivo por documento
salida/                 documentos generados
```

## Notas

- Los documentos salen sin firmar por diseño: solo tienen validez con la firma de la representante
  legal, y los desprendibles también con la del trabajador.
- El certificado de ingresos y retenciones usa el contenido que exige el artículo 379 del Estatuto
  Tributario, que admite formato propio del agente retenedor cuando trae todos los datos del
  formulario 220 de la DIAN. Los valores de 2025 (meses laborados y salario de ese año) se ajustan
  en la sección `retenciones` de `datos.json`.
- `certificacion-no-retencion-2026.html` es opcional: sirve cuando el trámite pide la situación del
  año en curso y no acepta el certificado del año gravable anterior.
- La liquidación asume mes completo de 30 días. Ingresos o retiros a mitad de mes se prorratean
  a mano.
