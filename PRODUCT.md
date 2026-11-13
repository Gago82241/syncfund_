# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Estudiantes universitarios y adultos jóvenes en Colombia que comparten gastos con otras
personas (arriendo, mercado, viajes, salidas) y que, al mismo tiempo, llevan sus propias
finanzas. Usan la app para saber cuánto tienen, cuánto aportaron a un grupo y si deben o les
deben, sin hacer la cuenta a mano. La usan tanto en el celular (al registrar un gasto en el
momento) como en el computador.

Audiencia secundaria: el docente que evalúa el proyecto académico (Construcción de Software,
Politécnico Colombiano Jaime Isaza Cadavid) y el equipo del proyecto (cuatro integrantes),
que debe poder sustentar cada decisión.

## Product Purpose
Unificar en un solo sistema las finanzas personales y los gastos en grupo. Cada usuario
registra sus ingresos y gastos en su billetera personal y participa en proyectos compartidos
donde el sistema reparte los gastos entre los integrantes y calcula el saldo neto de cada uno.
El éxito es que el usuario sepa en todo momento, con certeza, si está "en paz", si le deben o
si debe, y pueda quedar al día con un solo pago.

## Positioning
SyncFund no es solo "dividir la cuenta": une la billetera personal y el fondo común en una
misma app, y las dos cosas pesan igual.
- **Fondo común:** cada integrante aporta desde su billetera personal (gasto en su billetera,
  ingreso en el fondo), el fondo paga los gastos compartidos y nunca queda en negativo; las
  deudas se saldan de billetera a billetera sin mover el fondo. La suma de los saldos netos es
  igual al fondo.
- **Finanzas personales:** movimientos, meta de ahorro mensual con cuota calculada, un
  "colchón" que impide que el saldo quede en negativo y categorías con límite de presupuesto
  mensual y alerta.

## Operating Context
- Proyectos compartidos típicos: un apartamento entre compañeros, un viaje, una actividad de
  grupo. Un administrador crea el proyecto y agrega integrantes por correo.
- Flujos principales: registrar un movimiento personal; aportar al fondo; registrar un gasto
  compartido eligiendo quién participa; consultar la tabla de situación del proyecto (aportes,
  parte de los gastos y saldo de cada uno); pagarle a quien tiene saldo a favor con el monto
  sugerido; eliminar integrantes o salir de un proyecto (solo si están al día).
- Los datos se actualizan por consulta periódica (polling), no en tiempo real.

## Capabilities and Constraints
- Idioma: español. Moneda: pesos colombianos (COP, formato `es-CO`).
- Stack del frontend: React 19 + TypeScript, Vite, React Router, Axios, CSS propio (sin
  Tailwind ni librería de componentes). No se agregan dependencias sin aprobación del equipo.
- El rediseño es solo frontend; el backend, el dominio UML y el esquema de base de datos no
  cambian.
- Terminología del producto: billetera personal, colchón, meta de ahorro, proyecto
  compartido, fondo, aporte, gasto compartido, integrante, administrador, saldo neto,
  "en paz / te deben / debes", pago entre integrantes.
- Reglas de negocio visibles en la interfaz: un gasto compartido que supera el fondo se
  rechaza; el administrador no puede salir ni ser eliminado; solo sale quien está al día.
- Pendiente (no decidido): invitación de integrantes con aceptación; ciclo de vida completo
  del proyecto (Activo → En liquidación → Cerrado); notificaciones en tiempo real.

## Brand Commitments
- Nombre: SyncFund.
- Identidad vigente "Libro mayor, no dashboard": sobria, confiable, propia de una app
  financiera. Se conserva salvo que el equipo decida otra cosa (ver `CLAUDE.md`).
- Los valores de diseño viven solo como tokens en `syncfund-frontend/src/styles/globals.css`
  y `syncfund-frontend/src/styles/theme.ts`.
- Mensajes al usuario en español, claros y sin detalles técnicos.

## Evidence on Hand
- Referencia de la interfaz actual: la app corriendo en local desde la rama `develop`.
- La versión en producción (https://syncfund.vercel.app) está desactualizada y su backend
  está apagado: no sirve como referencia visual ni funcional.
- Documentación de diseño: README y diagramas UML en `docs/diagramas/`, modelo
  entidad-relación en `docs/base-de-datos/mer.png`.
- No hay usuarios reales, testimonios, métricas de uso ni casos de estudio: no inventarlos.

## Product Principles
1. **Certeza sobre cada peso.** Ninguna cifra se muestra si no viene del backend; un saldo
   viejo o estimado se leería como real.
2. **Lo personal y lo compartido, juntos.** Toda pantalla deja claro de qué billetera o de qué
   fondo sale y entra el dinero.
3. **Quedar al día sin hacer cuentas.** El sistema calcula y sugiere; el usuario confirma.
4. **Reglas visibles antes del error.** Las restricciones (fondo insuficiente, salir solo al
   día) se explican antes de que el usuario choque con ellas.
5. **Sustentable.** Cada decisión de interfaz debe poder explicarse ante el equipo y el
   docente.

## Accessibility & Inclusion
WCAG 2.1 AA: contraste suficiente, navegación completa con teclado, objetivos táctiles de
tamaño adecuado en móvil y etiquetas para lectores de pantalla. Los estados de ingreso/gasto
y deuda no dependen solo del color.
