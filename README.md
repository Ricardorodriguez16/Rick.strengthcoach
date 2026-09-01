# Documentación contractual — Unidad Pedagógica Bolivariana

Genera los documentos que el **Banco de Bogotá** pide a Ricardo Rafael Rodríguez García, asesor
jurídico de la institución bajo contrato de prestación de servicios. Se diligencia un solo archivo
y salen todos con el escudo, el NIT y la firma de la rectoría.

| Documento | Archivo |
|---|---|
| Certificación contractual | `certificacion-contractual.html` |
| Comprobantes de honorarios (3 meses) | `comprobante-honorarios-2026-06/07/08.html` |
| Certificado de ingresos y retenciones 2025 | `certificado-ingresos-retenciones-2025.html` |
| Certificación de retención del año en curso | `certificacion-retencion-2026.html` |

## Uso

```bash
node generar.js          # Node 18+, sin dependencias
```

Los archivos quedan en `salida/`. Abre `salida/index.html` para el listado. Para el PDF: abrir en el
navegador → **Imprimir** → **Guardar como PDF**, con márgenes por defecto y sin encabezados ni pies
del navegador. El escudo va incrustado en el HTML, así que el archivo se puede enviar por correo sin
adjuntar la imagen aparte.

## Por qué no es una constancia laboral

El vínculo es un contrato civil de prestación de servicios, no un contrato de trabajo. Eso cambia
los tres documentos:

- **No hay constancia laboral ni desprendible de nómina.** En su lugar van una certificación
  contractual y comprobantes de pago de honorarios contra cuenta de cobro.
- **No hay descuentos de salud y pensión a cargo de la institución.** El contratista asume sus
  aportes como independiente. Los documentos lo mencionan una sola vez, en la cláusula que descarta
  la relación laboral, porque el banco necesita saber qué tipo de vínculo es.
- **No hay auxilio de transporte ni prestaciones sociales**, que son propios del contrato de trabajo.
- La retención se certifica bajo el **artículo 381** del Estatuto Tributario (conceptos distintos a
  rentas de una relación laboral), no bajo el 379.

## Cifras

| Concepto | Valor |
|---|---|
| Honorarios mensuales | $ 2.500.000 |
| Inicio del contrato | 10 de febrero de 2025 |
| Retención en la fuente mensual | $ 0 |
| **Neto consignado** | **$ 2.500.000** |
| Pagos del año gravable 2025 (10,7 meses) | $ 26.750.000 |
| UVT 2026 · 2025 | $ 52.374 · $ 49.799 |

### Cómo sale la retención en cero

`lib/retencion.js` no fija el cero a mano. Como Ricardo es una persona natural que presta servicios
sin haber vinculado dos o más trabajadores, sus honorarios se someten a la tabla del **artículo 383**
del Estatuto Tributario, con la depuración del 388:

```
Honorarios                                     $ 2.500.000
− Aportes obligatorios como independiente      $   499.008   IBC $1.750.905 (40 % del contrato,
                                                             con piso de un salario mínimo)
− Renta exenta del 25 % (art. 206 num. 10)     $   500.248
= Base gravable mensual                        $ 1.500.744   → 28,65 UVT
Tabla del art. 383: aplica desde 95 UVT        $ 4.975.530
Retención                                      $         0
```

**Si la institución aplica la tarifa fija de honorarios** del artículo 392 en vez de la tabla del
383 —lo que hacen varias entidades cuando el contratista no ha certificado que no tiene dos o más
trabajadores— cambia en `datos.json`:

```json
"retencion": { "modo": "tarifa", "tarifaHonorarios": 0.10 }
```

Con eso la retención queda en $ 250.000 mensuales y el neto en $ 2.250.000, y los comprobantes y los
certificados se recalculan solos. Vale la pena confirmarlo con la contadora del colegio antes de
llevar los papeles al banco: lo que digan los comprobantes tiene que coincidir con lo que
efectivamente se consignó.

## Qué falta diligenciar

Queda solo `documento.consecutivo`, el radicado interno de la certificación, que hoy sale como
`CPS-2026-000`. El generador avisa al terminar si algún campo obligatorio quedó vacío.

Ya están cargados el NIT (900.385.699-4, con dígito de verificación), el escudo
(`activos/logo.jpg`), la firma de Claudia García como rectora y representante legal
(C.C. 32.857.367), el contacto de la institución (605 376 0051 · upb_86@hotmail.com), los datos del
contrato y la cuenta Bancolombia 76937190839 donde se consignan los honorarios.

## Estructura

```
datos.json              todo lo que hay que llenar
generar.js              punto de entrada
activos/logo.jpg        escudo de la institución
lib/formato.js          moneda, fechas, cifras en letras, concordancia de género
lib/retencion.js        aportes del independiente, depuración y tabla del art. 383 E.T.
plantillas/             estilos, encabezado y firmas comunes + un archivo por documento
salida/                 documentos generados
```

## Notas

- Los documentos salen sin firmar por diseño: solo tienen validez con la firma de la representante
  legal, y los comprobantes también con la del contratista.
- Los pagos de 2025 se calculan desde el 10 de febrero (10,7 meses equivalentes). Si en febrero se
  cobró el mes completo, o hubo meses sin cuenta de cobro, ajusta `retenciones.totalPagos`.
- Los aportes del independiente se calculan sobre el IBC del 40 % del contrato mensualizado con piso
  de un salario mínimo (art. 244 de la Ley 1955 de 2019). No se incluye ARL, que en riesgo I corre
  también por cuenta del contratista.
