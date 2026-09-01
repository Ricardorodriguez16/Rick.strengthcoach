# Documentación laboral — Unidad Pedagógica Bolivariana

Generador de los tres documentos que suele pedir un banco, una entidad de crédito o un
consulado a un trabajador vinculado a la institución:

1. **Constancia laboral**
2. **Desprendibles de pago de nómina** (últimos 3 meses)
3. **Certificado de ingresos y retenciones** (+ certificación de no retención del año en curso)

Todos se generan desde un único archivo de datos, así que basta con diligenciarlo una vez.

## Uso

```bash
node generar.js          # requiere Node 18+, sin dependencias
```

Los documentos quedan en `salida/` como HTML listo para imprimir en A4. Para obtener el PDF:
abrir el archivo en el navegador → **Imprimir** → **Guardar como PDF** (márgenes por defecto,
sin encabezados ni pies del navegador). El recuadro amarillo de advertencia no se imprime.

## Qué hay que diligenciar

Todo vive en `datos.json`. Los campos que quedan vacíos aparecen como líneas de guiones en el
documento y el generador los lista al terminar:

| Campo | Qué va ahí |
|---|---|
| `empleador.nit` | NIT de la institución con dígito de verificación |
| `empleador.telefono`, `empleador.correo` | datos de contacto para verificación |
| `empleador.firmante` | nombre, cargo y cédula de quien firma (rector/a o representante legal) |
| `empleado.*` | nombre, documento, cargo, tipo de contrato, fecha de ingreso, EPS, fondo de pensiones, cuenta bancaria |
| `periodos` | meses de los desprendibles, en formato `AAAA-MM` |
| `constancia.consecutivo` | número de radicado interno del documento |
| `retenciones` | año gravable, meses laborados y salario de ese año |

## Cifras de referencia (2026)

| Concepto | Valor | Norma |
|---|---|---|
| Salario mínimo mensual | $ 1.750.905 | Decreto 1469 de 2025 |
| Auxilio de transporte | $ 249.095 | Decreto 1470 de 2025 |
| Ingreso mensual total | $ 2.000.000 | |
| Aporte salud 4 % + pensión 4 % | $ 140.072 | Ley 100 de 1993, arts. 204 y 271 |
| **Neto mensual a pagar** | **$ 1.859.928** | |
| UVT | $ 52.374 | Resolución DIAN 000238 de 2025 |
| Tope de retención (95 UVT) | $ 4.975.530 | E.T. art. 383 |

El auxilio de transporte no es base de aportes a seguridad social (Ley 344 de 1996, art. 17), por
eso los descuentos se calculan sobre el salario básico. Con un salario mínimo **no hay retención en
la fuente**: la base gravable depurada queda muy por debajo de las 95 UVT donde arranca la tabla.

Para año gravable 2025 el generador usa $ 1.423.500 de salario y $ 200.000 de auxilio.

## Notas

- Los documentos salen sin firmar por diseño. Solo tienen validez una vez firmados por el
  representante legal de la institución (y por el trabajador, en el caso de los desprendibles).
- El certificado de ingresos y retenciones sigue el contenido exigido por el artículo 379 del
  Estatuto Tributario, que permite el formato propio del agente retenedor cuando incluye todos los
  datos del formulario 220.
- `certificacion-no-retencion-2026.html` es opcional: sirve cuando el trámite pide la situación del
  año en curso y no acepta el certificado del año gravable anterior.
- La liquidación asume mes completo de 30 días. Para ingresos o retiros a mitad de mes hay que
  prorratear a mano.
