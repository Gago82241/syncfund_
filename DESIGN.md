---
name: SyncFund
description: Finanzas personales y fondo común en un solo libro mayor.
colors:
  ink-950: "#0B1A33"
  ink-900: "#13294B"
  ink-700: "#1F3A5F"
  ink-600: "#2C5F8A"
  ink-100: "#E4EAF1"
  on-ink-muted: "#C7D2DF"
  motif-stroke-a: "#2C5F8A"
  motif-stroke-b: "#8FA9C6"
  ledger-50: "#F6F4EF"
  ledger-100: "#EEEAE0"
  paper: "#FFFFFF"
  ink: "#1C1C1A"
  ink-muted: "#5B5A54"
  ink-faint: "#6A6860"
  hairline: "#DEDAD0"
  track: "#D3CDBE"
  field-border: "#8F8B80"
  gain-700: "#1E7259"
  gain-500: "#2F9E7D"
  gain-100: "#E1F3EC"
  loss-800: "#8A3823"
  loss-700: "#A8452D"
  loss-500: "#C65D43"
  loss-100: "#F7E6E0"
  warn-700: "#86620F"
  warn-500: "#C9971F"
  scrim: "rgb(19 41 75 / 0.4)"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2rem, 1.6rem + 1.6vw, 2.75rem)"
    fontWeight: 500
    lineHeight: 1.15
    fontFeature: "tnum"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(1.5rem, 1.3rem + 0.8vw, 2rem)"
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
  small:
    fontFamily: "Figtree, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.9375rem"
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
    typography: "{typography.small}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.25rem"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.ink-700}"
    textColor: "{colors.paper}"
  button-primary-active:
    backgroundColor: "{colors.ink-950}"
    textColor: "{colors.paper}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-900}"
    typography: "{typography.small}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.25rem"
    height: "44px"
  button-ghost-active:
    backgroundColor: "{colors.ink-100}"
    textColor: "{colors.ink-900}"
  button-danger:
    backgroundColor: "{colors.loss-700}"
    textColor: "{colors.paper}"
    typography: "{typography.small}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.25rem"
    height: "44px"
  button-danger-active:
    backgroundColor: "{colors.loss-800}"
    textColor: "{colors.paper}"
  input-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.7rem 0.85rem"
    height: "44px"
  input-field-disabled:
    backgroundColor: "{colors.ledger-100}"
    textColor: "{colors.ink-muted}"
  money-status-gain:
    backgroundColor: "{colors.gain-100}"
    textColor: "{colors.gain-700}"
    typography: "{typography.small}"
    rounded: "{rounded.sm}"
    padding: "0.25rem 0.5rem"
  money-status-loss:
    backgroundColor: "{colors.loss-100}"
    textColor: "{colors.loss-700}"
    typography: "{typography.small}"
    rounded: "{rounded.sm}"
    padding: "0.25rem 0.5rem"
  money-status-even:
    backgroundColor: "{colors.ledger-100}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.small}"
    rounded: "{rounded.sm}"
    padding: "0.25rem 0.5rem"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    rounded: "{rounded.lg}"
    padding: "0.45rem 0.85rem 0.45rem 0.65rem"
  chip-selected:
    backgroundColor: "{colors.ink-100}"
    textColor: "{colors.ink}"
  sheet:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "1.5rem"
  panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    width: "420px"
  toast:
    backgroundColor: "{colors.ink-900}"
    textColor: "{colors.paper}"
    typography: "{typography.small}"
    rounded: "{rounded.sm}"
    height: "44px"
  nav-bar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    height: "56px"
  nav-sidebar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.small}"
    width: "240px"
  nav-link-active:
    backgroundColor: "{colors.ink-100}"
    textColor: "{colors.ink-900}"
  progress-track:
    backgroundColor: "{colors.track}"
    rounded: "{rounded.sm}"
    height: "0.5rem"
---

# Design System: SyncFund

## Overview

**Creative North Star: "El Libro Mayor Vivo"**

SyncFund se ve como un libro contable bien llevado que se actualiza solo. La página es papel
cálido, la estructura está escrita en azul tinta y el dinero se lee en renglones separados por
líneas finas, con las cifras alineadas en columna como en un libro mayor real. No es un tablero
de control: no hay cuadrículas de tarjetas de indicadores ni gráficos de adorno. Cada pantalla
abre con un encabezado que lleva un solo título, una sola cifra protagonista con su etiqueta y
la acción principal; el resto se organiza en hojas y renglones.

La identidad son el papel, la tinta, los renglones y las cifras. La interfaz es sobria y de
densidad media, con aire vertical y jerarquía construida con tipografía más que con cajas. Se
diseña primero para el celular (barra inferior con los cuatro destinos, acción principal al
alcance del pulgar, formularios en hojas que suben desde abajo) y en escritorio aprovecha el
ancho con un menú lateral fijo y hojas en dos columnas. Fraunces pone la voz de autor en títulos
y cifras; Figtree hace el trabajo silencioso de la interfaz. El color nunca decora: el azul
tinta es estructura y acción, el esmeralda es dinero a favor, la terracota es dinero en contra
o error, y el ámbar solo avisa que un presupuesto se acerca al límite.

El movimiento es breve y funcional: responde al toque en 150 ms, abre paneles en 200 ms, sale
suave y sin rebotes, y desaparece por completo con "reducir movimiento". Lo que se rechaza: la
estética fintech de neón (gradientes, fondos oscuros brillantes, glassmorphism, brillos), el
dashboard genérico (tarjetas con sombra, gráficos sin dato útil, números enormes repetidos en
cada tarjeta) y el blanco puro como fondo de página.

**Key Characteristics:**
- Papel cálido de fondo; blanco solo en superficies puntuales (hojas, campos, barras de navegación, paneles).
- Renglones de libro mayor con línea fina; cifras con números tabulares, alineadas a la derecha.
- Un solo h1 y una sola cifra protagonista por pantalla, en Fraunces y con etiqueta.
- Plano por defecto: una sola sombra, reservada a lo que flota sobre el contenido.
- Componentes firmes y táctiles: 44 px de área mínima, estado presionado visible, hover solo con cursor.
- Ningún estado se comunica solo con color: siempre hay signo o texto.

## Colors

Paleta de tinta sobre papel con dos acentos semánticos que solo hablan de dinero y un ámbar
reservado al presupuesto.

### Primary
- **Azul Tinta Nocturno** (ink-950): solo el estado presionado del botón principal.
- **Azul Tinta** (ink-900): marca, títulos, cifra protagonista neutra, página activa de la
  navegación, botón principal, avisos (toast) y el filete de totales de la tabla de situación.
  Es el color de la estructura.
- **Azul Tinta Medio** (ink-700): hover del botón principal y del cierre de los avisos.
- **Azul Acero** (ink-600): enlaces, anillo de foco de 2 px, borde de campo enfocado, chip
  seleccionado, relleno de la barra de progreso en estado normal y acciones de texto secundarias.
- **Azul Neblina** (ink-100): estados activos sutiles: chip seleccionado, página activa del menú
  lateral, fondo al presionar renglones y botones fantasma, fila "tú" de la tabla de situación y
  aviso informativo ("Tu sesión venció").
- **Velo Azul Tinta** (scrim): detrás de paneles y hojas inferiores, nunca negro.
- **Tinta Clara sobre Azul** (on-ink-muted) y los trazos del motivo (motif-stroke-a,
  motif-stroke-b): solo en el panel de marca del acceso.

### Secondary
- **Esmeralda Profundo** (gain-700): todo texto de dinero a favor e ingresos: montos, cifra
  protagonista a favor, etiqueta "A tu favor", "Meta cumplida".
- **Esmeralda Apagado** (gain-500): solo bordes y rellenos: borde del campo de monto cuando es
  ingreso y barra de la meta cumplida.
- **Esmeralda Claro** (gain-100): fondo de la etiqueta de estado a favor.

### Tertiary
- **Terracota Profundo** (loss-800): solo el estado presionado del botón de peligro.
- **Terracota Oscuro** (loss-700): todo texto de dinero en contra, gastos y errores; botón de
  peligro; a quién le debes en la lista de proyectos; aviso "Te pasaste".
- **Terracota Quemado** (loss-500): solo bordes y rellenos: campo con error, campo de monto de
  gasto, barra de presupuesto superado.
- **Terracota Claro** (loss-100): fondo de la etiqueta "Debes" y del aviso de error de carga.
- **Ámbar Oscuro** (warn-700): texto "Cerca del límite" y "Llegaste al límite".
- **Ámbar** (warn-500): solo el relleno de la barra de presupuesto desde el 80 %.

### Neutral
- **Papel de Libro Mayor** (ledger-50): fondo de toda la página, franja de la acción fija en el
  celular y hover de renglones.
- **Papel Envejecido** (ledger-100): esqueletos de carga, campo deshabilitado y etiqueta "Al día".
- **Papel Blanco** (paper): hojas, campos, paneles, barra superior, barra inferior y menú lateral.
- **Tinta Negra Cálida** (ink): texto principal.
- **Tinta Gris** (ink-muted): texto secundario, etiquetas de campo, encabezados de tabla,
  destinos inactivos de la navegación.
- **Tinta Tenue** (ink-faint): fechas, metadatos, placeholders y flechas de renglón.
- **Línea de Renglón** (hairline): divisores de renglones y bordes de hojas, paneles y barras.
- **Carril** (track): carril de las barras de progreso; se ve aunque esté vacío.
- **Borde de Campo** (field-border): borde de campos y del botón "Pagar"; borde punteado del
  saldo pendiente.

### Named Rules
**The Money-Only Color Rule.** El esmeralda y la terracota significan dinero a favor y en
contra (y error, en terracota); el ámbar solo significa presupuesto cerca del límite. Nunca se
usan como adorno, ilustración o identidad de sección.

**The Paper Ground Rule.** El fondo de la página es siempre ledger-50. El blanco (paper) solo
aparece en superficies que el usuario lee, llena o usa para moverse: hojas, campos, paneles y
barras de navegación.

**The Not-Only-Color Rule.** Ingreso/gasto, deuda y presupuesto nunca se comunican solo con
color: van con signo, etiqueta o texto ("A tu favor", "Debes", "Al día", "Cerca del límite",
"Te pasaste").

**The 700-for-Text Rule.** Los tonos 500 (gain-500, loss-500, warn-500) solo van en bordes y
rellenos: sobre papel cálido dan 3.0:1, 3.8:1 y 2.4:1. Todo texto de dinero o aviso usa el 700
correspondiente (gain-700 5.3:1, loss-700 5.4:1, warn-700 5.1:1 sobre ledger-50; al menos
4.6:1 sobre los fondos claros). ink-faint (5.1:1 sobre ledger-50, 4.6:1 sobre ink-100 y
loss-100), ink-muted (6.3:1) e ink-600 (6.1:1) también cumplen 4.5:1. field-border da 3.4:1
sobre blanco, suficiente para el contorno de un control.

## Typography

**Display Font:** Fraunces (con Georgia, serif)
**Body Font:** Figtree (con -apple-system, Segoe UI, sans-serif)

**Character:** Una serif con oficio de imprenta para lo que importa (títulos y cifras) y una
sans limpia y amable para todo lo demás. El contraste entre las dos separa la voz del libro de la
mecánica de la interfaz.

### Hierarchy
- **Display** (500, fluida de 2rem en el celular a 2.75rem en escritorio, 1.15): la cifra
  protagonista del encabezado de página. Por debajo de 360 px se limita a 9vw para que una cifra
  de doce dígitos no se parta; si aun así no cabe, parte en vez de salirse. Cuando la cifra es una
  frase ("Estás al día") baja a Title en Figtree 600, para no leerse como monto.
- **Headline** (500, fluida de 1.5rem a 2rem, 1.15): el h1 de cada página y el título de los
  formularios de acceso; siempre un paso por debajo de la cifra.
- **Title** (500, 1.125rem, 1.15): títulos de hojas, paneles y estados vacíos; marca "SyncFund".
- **Body** (400, 1rem, 1.55): texto de lectura. Los campos nunca bajan de 16 px, para que el
  iPhone no haga zoom.
- **Small** (0.9375rem): interfaz: botones (600), renglones, etiquetas de estado, destinos del
  menú lateral, descripciones.
- **Label** (600, 0.8125rem): etiquetas de campo, encabezados de tabla (a 500), destinos de la
  barra inferior (a 500), fechas y metadatos (a 400).

### Named Rules
**The Tabular Figures Rule.** Todo monto lleva números tabulares (`tabular-nums`), se escribe
con `formatCOP` y se alinea a la derecha. Las cifras se leen en columna, como en un libro
contable.

**The One Hero Figure Rule.** Una sola cifra en Display por pantalla, en el encabezado y con
etiqueta que diga qué es ("Disponible", "A tu favor"). Las demás cifras van en el tamaño del
renglón.

## Layout

La app con sesión se escribe para el celular primero y cambia a escritorio en un solo punto:
1024 px.

**Celular y tableta (menos de 1024 px).** Una barra superior delgada en papel blanco con la marca
a la izquierda y el menú de cuenta a la derecha, y una barra inferior fija de 56 px con los cuatro
destinos (Resumen, Billetera, Proyectos, Categorías) en ícono y etiqueta. La página activa va en
azul tinta, peso 600 y una raya de 2 px arriba. Las barras respetan el área segura del iPhone
(arriba, abajo y a los lados en horizontal). Una página puede fijar su acción principal en una
franja de papel cálido justo encima de la barra inferior (`fixedActionOnMobile`); el contenido y
los avisos dejan libre ese alto. Desde 640 px ese botón deja de ocupar todo el ancho.

**Escritorio (1024 px o más).** Menú lateral fijo de 240 px a la izquierda, a toda la altura,
con la marca, los destinos (fondo azul neblina en el activo) y la cuenta al pie (nombre, correo y
"Cerrar sesión"). La acción principal vuelve al encabezado, a la derecha del título y la cifra.

**Contenido.** Hasta 1200 px de ancho y centrado; una lista de renglones no pasa de 768 px para
que nombre y estado queden cerca. Relleno de 1.5rem × 1rem en el celular y de 2.5rem (4rem abajo)
en escritorio. El primer elemento accesible es el enlace "Saltar al contenido", oculto hasta
recibir foco.

**Encabezado de página.** Título (único h1), cifra protagonista con su etiqueta, un dato
secundario y la acción principal; cierra con línea de renglón y 2.5rem de separación.

**Hojas y columnas.** Las secciones son hojas de papel blanco con línea fina. El contenedor de la
página es contenedor de consultas: cuando le quedan 52rem (unos 830 px) las hojas pasan a dos
columnas iguales o principal + lateral (2:1), con o sin menú lateral.

**Acceso.** Login y registro usan pantalla dividida: panel de marca en azul tinta a la izquierda y
formulario de 360 px a la derecha, ambos arrancando a la misma altura. Hasta 860 px el panel se
reduce a una franja con el nombre y una línea; en teléfonos bajos (620 px de alto o menos), solo
el nombre.

El ritmo vertical sale de la escala de espaciado (0.5 / 0.75 / 1 / 1.5 / 2.5 / 4rem). Los
renglones llevan 0.75–0.9rem de relleno vertical y línea fina entre filas, sin línea en la
última. Puntos de quiebre en uso: 360 px (pestañas más juntas), 480 px (botones de avisos y
estados vacíos dejan el ancho completo), 640 px (hojas a 1.5rem de relleno; la tabla de situación
se apila por debajo), 860 px (acceso a una columna) y 1024 px (escritorio).

### Named Rules
**The Thumb Reach Rule.** En el celular la acción principal de la página queda fija sobre la
barra inferior, al alcance del pulgar; en escritorio vuelve al encabezado.

## Elevation & Depth

El sistema es plano. La profundidad se expresa con la línea de renglón, el cambio de tono entre el
papel cálido de la página y el blanco de las hojas, y el borde de color en los estados (foco en
azul acero, error en terracota). Existe una sola sombra, y solo la llevan los elementos que flotan
sobre el contenido: el panel lateral y la hoja inferior, el menú de cuenta y los avisos. Detrás
del panel, la página se cubre con un velo de azul tinta al 40 %, nunca negro.

### Shadow Vocabulary
- **Flotante** (`box-shadow: 0 12px 32px -8px rgb(19 41 75 / 0.28), 0 2px 6px rgb(19 41 75 / 0.12)`):
  sombra teñida de azul tinta para paneles, hojas inferiores, menú de cuenta y avisos.

### Named Rules
**The Flat-By-Default Rule.** Las superficies son planas. Solo lo que flota sobre el contenido
(paneles, hojas inferiores, menús y avisos) lleva la sombra flotante, y solo esa. Ninguna hoja de
página, tarjeta ni renglón lleva sombra.

## Shapes

Esquinas apenas suavizadas y geometría rectilínea. Tres radios: 4px para botones, campos,
etiquetas de estado, avisos y renglones al presionar; 8px para hojas, menús, avisos de error y la
parte superior de la hoja inferior (el panel de escritorio va a escuadra); 14px para los chips de
participantes, lo único casi redondeado del sistema. Los bordes son de 1px en línea de renglón;
los totales y la pestaña activa usan un filete de 2px en azul tinta, como el doble subrayado de un
libro contable. Un dato pendiente se marca con borde punteado.

Los íconos son SVG propios en una retícula de 24 × 24, con trazo de 1.5 en el color del texto y
1.25rem por defecto, sin librería. El único motivo gráfico son dos círculos entrelazados de trazo
fino: en tonos de tinta en el panel de marca del acceso (solo en escritorio) y como ícono de
Proyectos. Nunca en esmeralda.

## Components

Firmes y táctiles: sobrios en reposo, con respuesta clara al tocar, al enfocar y, solo con
cursor, al pasar por encima.

**Movimiento.** Dos duraciones y una curva: 150 ms para la respuesta al toque y al cursor, 200 ms
para abrir paneles y hojas, ambas con salida suave (`cubic-bezier(0.22, 1, 0.36, 1)`) y sin rebote.
Al cerrar, los paneles y avisos salen en 150 ms. Solo se anima opacidad, desplazamiento, color y
borde. Lo que aparece en su lugar (un error de formulario, la confirmación de un pago, el aviso de
demora) entra con un desplazamiento de 4 px y fundido; los saldos que llegan tarde en la lista de
Proyectos solo se funden. Esas son las únicas dos entradas. Con "reducir movimiento" todo queda en
su estado final al instante, los paneles solo se funden y el pulso de los esqueletos se apaga. El
hover se declara solo dentro de `(hover: hover)`, para que no quede pegado tras tocar.

### Buttons
- **Shape:** esquinas apenas suavizadas (4px), 44 px de alto como mínimo, ancho completo por
  defecto; en paneles, avisos y estados vacíos se ajustan al contenido desde 480 px o en escritorio.
- **Primary:** azul tinta con texto blanco, Figtree 600 en Small, 0.75rem × 1.25rem.
- **Hover / Focus:** el primario pasa a azul tinta medio; el fantasma cambia el borde a azul acero;
  el de peligro marca el borde en tinta. Foco con anillo de 2px en azul acero separado 2px.
- **Pressed:** baja 1 px como una tecla y se oscurece: el primario a azul tinta nocturno, el
  fantasma a azul neblina con borde azul acero y el de peligro a terracota profundo.
- **Ghost:** transparente con borde de línea de renglón; sobre fondos de color (aviso de error)
  recibe fondo blanco.
- **Danger:** terracota oscuro con texto blanco.
- **Disabled / Loading:** opacidad 0.6 y cursor no permitido; al cargar cambia el texto
  ("Procesando...") y marca `aria-busy`.

### Chips
- **Style:** píldora de 14px en papel blanco con borde de línea de renglón, Small; el chulo
  reserva su espacio aunque no se vea, para que el chip no cambie de ancho.
- **State:** seleccionado en azul neblina con borde azul acero y chulo visible. La casilla real
  queda oculta solo a la vista y el foco se dibuja en el chip.

### Cards / Containers
- **Hoja (Sheet):** papel blanco, 8px, borde de línea de renglón, relleno de 1rem (1.5rem desde
  640 px), título en Title con línea inferior y una acción de texto opcional a la derecha.
- **Shadow Strategy:** ninguna (ver Elevation & Depth).
- **Panel:** `<dialog>` modal. En el celular es una hoja que sube desde abajo hasta el 90 % de la
  pantalla, con esquinas superiores de 8px; desde 1024 px es un panel lateral derecho de 420 px a
  toda la altura que entra desde la derecha. Encabezado con título, descripción y "Cerrar" (ícono +
  texto), cuerpo desplazable y pie fijo con las acciones (apiladas en el celular, a la derecha en
  escritorio) que respeta el área segura. El foco queda atrapado dentro y vuelve al botón que lo
  abrió; Esc, "Cerrar" o tocar el velo lo cierran. Mientras está abierto, la página no se desplaza.
- **Estado vacío:** ícono en azul acero, título en Fraunces, una línea en tinta gris y la acción.
- **Esqueleto:** bloques en papel envejecido con la forma del contenido real (renglón, cifra,
  bloque) y un pulso lento de opacidad.
- **Error de carga:** aviso en terracota claro, 8px, mensaje en terracota oscuro y botón para
  reintentar.

### Inputs / Fields
- **Style:** papel blanco, borde de 1px en borde de campo (3.4:1), 4px, 44 px de alto, letra de al
  menos 16 px; etiqueta encima en Label gris y ayuda debajo.
- **Focus:** el borde pasa a azul acero con un anillo de 1px del mismo color, sin resplandor.
- **Error / Disabled:** borde y anillo en terracota quemado, mensaje debajo en terracota oscuro;
  deshabilitado en papel envejecido.
- **Monto (MoneyInput):** signo pesos fijo dentro del campo, cifra en 500; el borde y el anillo
  toman el tono del movimiento (esmeralda apagado para ingreso, terracota quemado para gasto) y
  debajo se confirma cómo se leyó el monto ("Vas a aportar $50.000").
- **Contraseña (PasswordInput):** botón de texto "Mostrar" dentro del campo, en azul acero, con
  44 px de área.

### Navigation
- Barra inferior en el celular y menú lateral en escritorio (ver Layout), un solo `<nav>`. Destinos
  en tinta gris que pasan a azul tinta con cursor; al tocar, fondo azul neblina.
- **Menú de cuenta (celular):** botón con ícono y nombre cortado con elipsis; abre un menú flotante
  de 8px con la sombra flotante, nombre, correo y "Cerrar sesión".
- **Pestañas:** texto en tinta gris sobre la línea de renglón; la activa en azul tinta con filete
  de 2px. Sin cajas ni fondos.

### Money Status
Etiqueta de estado con su monto, siempre en texto: "A tu favor" (esmeralda profundo sobre
esmeralda claro), "Debes" (terracota oscuro sobre terracota claro) y "Al día" (tinta gris sobre
papel envejecido, sin monto). Para otro integrante dice "A favor" / "Debe". Menos de medio
centavo cuenta como "Al día".

### Progress Bar
Nombre y "$x de $y" arriba, carril de 0.5rem y debajo el porcentaje y el aviso en texto. En
presupuestos: azul acero normal; "Cerca del límite" desde el 80 % y "Llegaste al límite" en el
100 % justo, en ámbar; "Te pasaste por $x" al superarlo, en terracota. En metas, "Meta cumplida"
en esmeralda. La barra se llena hasta el 100 %; el texto dice el porcentaje real.

### Toast
Aviso invertido: texto blanco sobre azul tinta (14.5:1), 4px, sombra flotante y cierre de 44 px.
En el celular va abajo a todo el ancho, por encima de la barra inferior y de la acción fija; en
escritorio, abajo a la derecha con 22rem de ancho.

### Ledger Table (Signature Component)
La "Situación del proyecto" es un libro mayor de integrantes: columnas de aportes, parte de los
gastos y saldo, con números a la derecha; la fila propia en azul neblina; los totales bajo un
filete de 2px en azul tinta con el fondo en Fraunces; la acción "Pagar" en línea como botón
secundario de borde de campo. Por debajo de 640 px cada integrante se apila con etiquetas a la
izquierda y valores a la derecha.

### Ledger Rows
- **Historial:** descripción en Figtree 500 y fecha con categoría en tinta tenue a la izquierda;
  monto a la derecha con signo y color semántico, nunca partido. Si no cabe, el monto baja a su
  propia línea, a la derecha. Los pagos entre integrantes (abono/cobro) van en tinta gris y sin
  signo, con una nota, porque no mueven el fondo. "Ver más" al pie como acción de texto.
- **Proyectos (ProjectStatusList):** renglón entero tocable de 44 px: nombre (hasta dos líneas) y
  metadatos a la izquierda; etiqueta de estado y flecha a la derecha. A quién le debes va debajo en
  terracota oscuro; un saldo que no se pudo leer se marca con borde punteado y texto.

## Do's and Don'ts

### Do:
- **Do** poner el fondo de página en ledger-50 y reservar paper para hojas, campos, paneles y
  barras de navegación.
- **Do** escribir todo monto con `formatCOP` y números tabulares, alineado a la derecha.
- **Do** abrir cada página con `PageHeader`: un solo h1 y una sola cifra en Display con etiqueta.
- **Do** usar el vocabulario del libro: "Disponible", "A tu favor", "Debes", "Al día", "Cerca del
  límite", "Te pasaste", "incluye colchón".
- **Do** acompañar el color semántico con signo o texto.
- **Do** usar los 700 (gain-700, loss-700, warn-700) para texto y los 500 solo en bordes y rellenos.
- **Do** dar 44 px de área táctil a todo control y un estado presionado visible.
- **Do** declarar el hover dentro de `@media (hover: hover)`.
- **Do** abrir los formularios en `Panel` y fijar la acción principal sobre la barra inferior en el
  celular cuando la página la tiene.
- **Do** separar renglones con línea de 1px y marcar totales con filete de 2px en azul tinta.
- **Do** agregar cualquier color, tamaño, espacio o duración nueva como token en `globals.css` y
  `theme.ts`.

### Don't:
- **Don't** usar gradientes, fondos oscuros brillantes, glassmorphism, brillos ni sombras de
  resplandor (estética fintech de neón).
- **Don't** armar cuadrículas de tarjetas con sombra, gráficos decorativos sin dato útil ni
  números enormes repetidos en cada tarjeta.
- **Don't** usar esmeralda, terracota o ámbar como adorno o identidad de sección.
- **Don't** decir "Te deben": el saldo a favor incluye tu parte del fondo y no es deuda de nadie.
- **Don't** poner texto en gain-500, loss-500 o warn-500.
- **Don't** poner blanco puro como fondo de página.
- **Don't** escribir valores hex sueltos en componentes.
- **Don't** poner sombra en hojas, tarjetas ni renglones; solo la llevan paneles, hojas inferiores,
  menús y avisos.
- **Don't** agregar entradas animadas fuera de las dos del sistema ni animaciones con rebote.
