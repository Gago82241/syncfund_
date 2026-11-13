---
name: SyncFund
description: Finanzas personales y fondo común en un solo libro mayor.
colors:
  ink-900: "#13294B"
  ink-700: "#1F3A5F"
  ink-600: "#2C5F8A"
  ink-100: "#E4EAF1"
  ledger-50: "#F6F4EF"
  ledger-100: "#EEEAE0"
  paper: "#FFFFFF"
  ink: "#1C1C1A"
  ink-muted: "#5B5A54"
  ink-faint: "#8C8A82"
  hairline: "#DEDAD0"
  gain-500: "#2F9E7D"
  gain-100: "#E1F3EC"
  loss-500: "#C65D43"
  loss-100: "#F7E6E0"
  loss-700: "#A8452D"
  warn-500: "#C9971F"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "2.75rem"
    fontWeight: 500
    lineHeight: 1.15
    fontFeature: "tnum"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "2rem"
    fontWeight: 500
    lineHeight: 1.15
  title:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.15
  body:
    fontFamily: "Figtree, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Figtree, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "8px"
  lg: "14px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
  2xl: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.ink-900}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.ink-700}"
    textColor: "{colors.paper}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.25rem"
  button-danger:
    backgroundColor: "{colors.loss-700}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.25rem"
  input-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.7rem 0.85rem"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0.45rem 0.85rem 0.45rem 0.65rem"
  chip-selected:
    backgroundColor: "{colors.ink-100}"
    textColor: "{colors.ink}"
  sheet:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "1.5rem"
---

# Design System: SyncFund

## Overview

**Creative North Star: "El Libro Mayor Vivo"**

SyncFund se ve como un libro contable bien llevado que se actualiza solo. La página es papel
cálido, la estructura está escrita en azul tinta y el dinero se lee en filas separadas por
líneas finas, con las cifras alineadas en columna como en un libro mayor real. No es un tablero
de control: no hay cuadrículas de tarjetas de indicadores ni gráficos de adorno. Cada pantalla
tiene una sola cifra protagonista; en el Resumen puede acompañarla una fila breve de
indicadores, y el resto se organiza en renglones.

La identidad son el papel, la tinta, los renglones y las cifras; no el ancho ni la estructura de
la página. La interfaz es sobria y de densidad media, con mucho aire vertical y jerarquía
construida con tipografía más que con cajas. Hoy todo vive en una sola columna de 640px; el
rediseño la reemplazará por una estructura más amplia (menú lateral en escritorio, barra de
navegación inferior en móvil y páginas organizadas en hojas). Fraunces pone la voz de autor en
títulos y cifras; Figtree hace el trabajo silencioso de la interfaz. El color nunca decora: el
azul tinta es estructura y acción, el esmeralda es dinero a favor, la terracota es dinero en
contra o error.

Lo que se rechaza: la estética fintech de neón (gradientes, fondos oscuros brillantes,
glassmorphism, brillos), el dashboard genérico (tarjetas con sombra, gráficos sin dato útil,
números enormes repetidos en cada tarjeta) y el blanco puro como fondo de página.

**Key Characteristics:**
- Papel cálido de fondo; blanco solo en superficies puntuales ("hojas", campos, formularios).
- Filas tipo libro mayor con línea fina; cifras con números tabulares.
- Una sola cifra protagonista por pantalla, en Fraunces.
- Plano por defecto: profundidad con línea, tono y borde, no con sombra.
- Componentes firmes y táctiles, con respuesta clara al toque.

## Colors

Paleta de tinta sobre papel con dos acentos semánticos que solo hablan de dinero.

### Primary
- **Azul Tinta** (ink-900): marca, títulos, navegación, botón principal, fila de totales de la
  tabla de situación. Es el color de la estructura.
- **Azul Tinta Medio** (ink-700): estado hover del botón principal y de la acción "Pagar".
- **Azul Acero** (ink-600): enlaces, foco visible (anillo de 2px), borde de campo enfocado, chip
  seleccionado y acciones de texto secundarias.
- **Azul Neblina** (ink-100): fondo de estados activos sutiles: chip seleccionado y la fila
  "tú" en la tabla de situación.

### Secondary
- **Esmeralda Apagado** (gain-500): montos a favor e ingresos; borde del monto cuando el
  movimiento es ingreso.
- **Esmeralda Claro** (gain-100): fondo de apoyo para estados a favor.

### Tertiary
- **Terracota Quemado** (loss-500): montos en contra y gastos; borde de campo con error y alerta
  de presupuesto superado.
- **Terracota Oscuro** (loss-700): texto de error y botón de peligro (con texto blanco cumple
  AA, el 500 no).
- **Terracota Claro** (loss-100): fondo del aviso de error de carga y hover de acciones
  destructivas.
- **Ámbar** (warn-500): reservado para alertas de presupuesto; hoy no se usa en ningún
  componente.

### Neutral
- **Papel de Libro Mayor** (ledger-50): fondo de toda la página.
- **Papel Envejecido** (ledger-100): carril de las barras de presupuesto.
- **Papel Blanco** (paper): hojas, campos, formularios, cabecera de la app.
- **Tinta Negra Cálida** (ink): texto principal.
- **Tinta Gris** (ink-muted): texto secundario, etiquetas de campo, encabezados de tabla.
- **Tinta Tenue** (ink-faint): fechas, metadatos, placeholders.
- **Línea de Renglón** (hairline): divisores de filas y bordes de campos y hojas.

### Named Rules
**The Money-Only Color Rule.** El esmeralda y la terracota significan dinero a favor y en
contra (y error, en terracota). Nunca se usan como adorno, ilustración o identidad de sección.

**The Paper Ground Rule.** El fondo de la página es siempre ledger-50. El blanco (paper) solo
aparece en superficies que el usuario lee o llena: hojas, campos, formularios, cabecera.

**The Not-Only-Color Rule.** Ingreso/gasto y deuda nunca se comunican solo con color: van con
signo, etiqueta o texto ("te deben", "debes", "en paz").

**Brecha conocida de contraste (WCAG 2.1 AA, compromiso de PRODUCT.md).** Sobre ledger-50:
gain-500 da 3.0:1, loss-500 3.8:1, ink-faint 3.2:1 y warn-500 2.4:1; ninguno alcanza 4.5:1
para texto normal. loss-700 (5.4:1), ink-muted (6.3:1) e ink-600 (6.1:1) sí cumplen. El
rediseño debe resolver los montos y metadatos en texto pequeño.

## Typography

**Display Font:** Fraunces (con Georgia, serif)
**Body Font:** Figtree (con -apple-system, Segoe UI, sans-serif)

**Character:** Una serif con oficio de imprenta para lo que importa (títulos y cifras) y una
sans limpia y amable para todo lo demás. El contraste entre las dos es el que separa la voz del
libro de la mecánica de la interfaz.

### Hierarchy
- **Display** (500, 2.75rem, 1.15): la cifra protagonista: saldo de la billetera, saldo general
  del resumen y titular del panel de marca en login/registro.
- **Headline** (500, 2rem, 1.15): cifras de segundo nivel en la cabecera de un proyecto (fondo
  y saldo neto).
- **Title** (500, 1.125rem, 1.15): títulos de sección y de formularios ("Situación del
  proyecto", "Nuevo movimiento").
- **Body** (400, 1rem, 1.55): texto e interfaz. Filas de lista y tabla a 0.9375rem.
- **Label** (600, 0.8125rem): etiquetas de campo, encabezados de tabla (estos a 500), notas,
  fechas y metadatos (a 400).

### Named Rules
**The Tabular Figures Rule.** Todo monto lleva números tabulares (`tabular-nums`) y, en tablas,
se alinea a la derecha. Las cifras se leen en columna, como en un libro contable.

**The One Hero Figure Rule.** Una sola cifra en Display por pantalla. Las demás cifras van en
Headline o en el tamaño de la fila.

## Layout

**Estado actual (no es regla de identidad):** una columna de lectura centrada de 640px como
máximo, con 2.5rem arriba y abajo y 1.5rem a los lados, bajo una cabecera horizontal que ocupa
todo el ancho sobre papel blanco, con línea fina inferior y 1.25rem × 2rem de relleno.

**Dirección del rediseño:** la columna única se reemplaza por una estructura más amplia: menú
lateral en escritorio, barra de navegación inferior en móvil y páginas organizadas en hojas.
Lo que se conserva es el papel, la tinta, los renglones y las cifras, no el ancho de la columna. Login y registro usan pantalla dividida (panel de marca en azul tinta
a la izquierda, formulario de 360px a la derecha) que se apila en una columna por debajo de
860px.

El ritmo vertical sale de la escala de espaciado (0.5 / 0.75 / 1 / 1.5 / 2.5 / 4rem). Las listas
son renglones: 0.9–1.1rem de relleno vertical y línea fina entre filas, sin línea en la última.

Puntos de quiebre en uso: 480px (los botones del aviso de error dejan de ocupar todo el
ancho), 640px (la tabla de situación se apila en tarjetas con etiquetas y las acciones de
confirmación se apilan) y 860px (login/registro pasa a una columna). La cabecera de la app
todavía no tiene tratamiento móvil.

Se permite organizar una página en "hojas" (papel blanco sobre el fondo cálido, con línea fina)
y una fila breve de indicadores en el Resumen, siempre con una sola cifra protagonista.

## Elevation & Depth

El sistema es plano. La profundidad se expresa con tres recursos: la línea fina (hairline), el
cambio de tono entre el papel cálido de la página y el blanco de las hojas, y el borde de color
en los estados (foco en azul acero, error en terracota, confirmación destructiva con borde
izquierdo de 3px en terracota oscuro). Hoy no existe ninguna sombra en la interfaz.

### Named Rules
**The Flat-By-Default Rule.** Las superficies son planas. Solo los elementos que flotan sobre el
contenido (modales, menús desplegables, paneles laterales y hojas inferiores en móvil, donde se
abrirán los formularios) pueden llevar una sombra suave, y solo una. El valor se define cuando
exista el primer elemento flotante; ninguna tarjeta ni hoja de página lleva sombra.

## Shapes

Esquinas apenas suavizadas y geometría rectilínea. Tres radios: 4px para botones, campos y
avisos de confirmación; 8px para hojas y avisos de error; 14px para los chips de participantes,
lo único casi redondeado del sistema. Los bordes son de 1px en línea de renglón; el énfasis de
totales usa un filete superior de 2px en azul tinta, como el doble subrayado de un libro
contable. El único motivo gráfico son dos círculos entrelazados de trazo fino (azul acero y
esmeralda) en el panel de marca del login.

## Components

Firmes y táctiles: sobrios en reposo, con respuesta clara al pasar el cursor, al enfocar y al
tocar.

### Buttons
- **Shape:** esquinas apenas suavizadas (4px), ancho completo por defecto; en contextos en
  línea (aviso de error, tabla) se ajustan al contenido.
- **Primary:** azul tinta con texto blanco, Figtree 600 a 0.9375rem, 0.75rem × 1.25rem.
- **Hover / Focus:** el primario pasa a azul tinta medio; el fantasma cambia el borde a azul
  acero; transición de 0.15s en fondo y borde. Foco con anillo de 2px en azul acero separado
  2px.
- **Ghost:** transparente con borde de línea de renglón; sobre fondos de color (aviso de error)
  recibe fondo blanco para seguir leyéndose como botón.
- **Danger:** terracota oscuro con texto blanco; el hover marca el borde en tinta.
- **Disabled:** opacidad 0.6 y cursor no permitido.
- **Pressed:** aún no existe un estado presionado; la dirección "táctil" lo pide.

### Chips
- **Style:** píldora de 14px en papel blanco con borde de línea de renglón, Figtree a
  0.9375rem; el chulo reserva su espacio aunque no se vea, para que el chip no cambie de ancho.
- **State:** seleccionado en azul neblina con borde azul acero y chulo visible. La casilla real
  queda oculta solo a la vista y el foco se dibuja en el chip.

### Cards / Containers
- **Corner Style:** 8px en las hojas (formulario de movimiento).
- **Background:** papel blanco sobre el fondo cálido.
- **Shadow Strategy:** ninguna (ver Elevation & Depth).
- **Border:** 1px en línea de renglón.
- **Internal Padding:** 1.5rem.
- Las tarjetas de resumen (billetera, proyecto) no son cajas: son un bloque con cifra y línea
  inferior.

### Inputs / Fields
- **Style:** papel blanco, borde de línea de renglón, 4px, etiqueta encima en Label gris.
- **Focus:** el borde pasa a azul acero, sin resplandor.
- **Error:** borde y anillo de 1px en terracota; mensaje debajo en terracota oscuro a
  0.8125rem.
- **Monto:** el campo de monto toma el color del tipo de movimiento (esmeralda para ingreso,
  terracota para gasto) en el borde y en el anillo de foco.

### Navigation
- Cabecera blanca con marca "SyncFund" en Fraunces 500 a 1.125rem, enlaces en Figtree a
  0.9375rem en tinta gris que pasan a azul tinta al pasar el cursor, y usuario y "Salir" a la
  derecha. No hay indicador de página activa ni versión móvil.

### Ledger Table (Signature Component)
La "Situación del proyecto" es un libro mayor de integrantes: columnas de aportes, parte de
los gastos y saldo, con números a la derecha; la fila propia en azul neblina; los totales bajo
un filete de 2px en azul tinta con el fondo en Fraunces; la acción "Pagar" en línea, con el
formulario de pago abierto dentro de la propia tabla. Por debajo de 640px cada integrante se
apila como tarjeta con etiquetas a la izquierda y valores a la derecha.

### Transaction Row
Renglón con descripción en Figtree 500 y fecha en tinta tenue a la izquierda, monto a la
derecha con signo y color semántico. Los pagos entre integrantes (abono/cobro) van en tinta
gris y sin signo, con una nota, porque no mueven el fondo.

## Do's and Don'ts

### Do:
- **Do** poner el fondo de página en ledger-50 y reservar paper para hojas, campos, formularios
  y la cabecera.
- **Do** escribir todo monto con `formatCOP` y números tabulares, alineado a la derecha en
  tablas.
- **Do** dejar una sola cifra en Display (2.75rem, Fraunces) por pantalla.
- **Do** separar filas con línea de renglón de 1px y marcar totales con filete de 2px en azul
  tinta.
- **Do** acompañar el color semántico con signo o texto ("te deben", "debes", "en paz").
- **Do** usar loss-700 para cualquier texto de error o botón de peligro.
- **Do** agregar cualquier color, tamaño o espacio nuevo como token en `globals.css` y
  `theme.ts`.
- **Do** organizar páginas en hojas blancas con línea fina y, en el Resumen, una fila breve de
  indicadores.

### Don't:
- **Don't** usar gradientes, fondos oscuros brillantes, glassmorphism, brillos ni sombras de
  resplandor (estética fintech de neón).
- **Don't** armar cuadrículas de tarjetas con sombra, gráficos decorativos sin dato útil ni
  números enormes repetidos en cada tarjeta.
- **Don't** usar esmeralda o terracota como adorno o identidad de sección.
- **Don't** poner blanco puro como fondo de página.
- **Don't** escribir valores hex sueltos en componentes.
- **Don't** poner sombra en tarjetas ni en hojas de página; solo la llevan los elementos
  flotantes (modales, menús, paneles laterales y hojas inferiores en móvil).
