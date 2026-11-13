# Crítica de diseño del frontend

Diagnóstico página por página antes del rediseño. Cada sección evalúa la pantalla **tal como
está hoy** y señala qué resolvería la dirección acordada en `DESIGN.md` (menú lateral en
escritorio, barra de navegación inferior en móvil y páginas organizadas en hojas) y qué no.

Método: `/impeccable critique` con dos evaluaciones independientes: una revisión de diseño (A)
y el detector automático de impeccable (B). Las rutas de código son relativas a
`syncfund-frontend/` salvo que se indique otra cosa.

---

## Resumen

- **Archivo:** `src/pages/DashboardPage.tsx` (ruta `/dashboard`), dentro de
  `src/components/layout/AppLayout.tsx`.
- **Fecha:** 2026-11-13 · rama `docs/diagnostico-diseno`.
- **Evidencia:** código fuente, dos capturas de la app en local (escritorio de ~1360px y móvil
  iPhone 16 de 393px en las herramientas de Chrome) y el detector de impeccable.
- **Modo de la pantalla:** Operate (interfaz de una app: el usuario viene a resolver algo).

### Puntaje de heurísticas (Nielsen)

| # | Heurística | Nota | Problema clave |
|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 2 | Carga y error bien resueltos (`role="status"` / `role="alert"`), pero la navegación no marca la página activa (`Link` en vez de `NavLink`) y la cifra no dice cuándo se actualizó. |
| 2 | Coincidencia con el mundo real | 1 | "Tu saldo general" mezcla tu dinero con el fondo común del grupo; falta el vocabulario del producto ("en paz / te deben / debes"). |
| 3 | Control y libertad | 3 | Navegación simple y sin acciones destructivas. |
| 4 | Consistencia y estándares | 2 | Cifra con estilo en línea a 2.5rem, distinto del Display de DESIGN.md (2.75rem); `lang="en"` y título genérico en `index.html`. |
| 5 | Prevención de errores | 2 | En móvil la cabecera desborda y los enlaces quedan apiñados: es fácil tocar el equivocado. |
| 6 | Reconocer antes que recordar | 1 | El Resumen no resume: para saber si debe en un proyecto, el usuario tiene que entrar a cada uno. |
| 7 | Flexibilidad y eficiencia | 1 | Ningún acceso directo a los flujos principales (registrar movimiento, aportar, pagar lo sugerido). |
| 8 | Estética y diseño minimalista | 2 | Sobria pero vacía: en escritorio cerca del 75% de la pantalla queda en blanco. |
| 9 | Recuperación de errores | 3 | `LoadError` con mensaje claro, reintento y distinción de errores que no vale la pena reintentar. |
| 10 | Ayuda y documentación | 1 | Nada explica qué compone la cifra ni qué hacer con $0. |
| **Total** | | **18/40** | **Deficiente**: base técnica correcta; fallan el contenido y la navegación móvil. |

### Veredicto de especificidad

**Revisión de diseño:** hoy la pantalla podría ser de cualquier app. Un saludo y un número
grande sirven igual para un banco o una billetera de propinas. La identidad "El Libro Mayor Vivo"
solo aparece en los tokens base (papel cálido, Fraunces, números tabulares). No hay renglones,
hojas, filete de totales ni la voz "en paz / te deben / debes", y no aparece lo que posiciona al
producto: lo personal y lo compartido, juntos.

**Detector automático:** 0 hallazgos en `DashboardPage.tsx`, `AppLayout.tsx` y
`src/components/ui/` (salida `[]`, código 0), sin comentarios que ignoren reglas. **No es un
aval:** sin navegador solo corrieron las reglas por patrón sobre el código; las que necesitan la
página renderizada (texto diminuto, contraste) no se ejecutaron. Las capturas muestran justo lo
que esas reglas habrían marcado: texto diminuto en móvil por el desborde de la cabecera.
Tampoco hubo superposición visual en el navegador, porque no hay herramienta de automatización
disponible.

### Impresión general

La página hace bien lo poco que hace: nunca muestra una cifra vieja y maneja carga y error con
cuidado. Pero es la pantalla más vista de la app y hoy no responde la pregunta por la que el
usuario abre SyncFund ("¿estoy en paz, me deben o debo?"). Además, la única cifra que muestra no
es solo del usuario. La mayor oportunidad es convertir el Resumen en el libro mayor personal del
usuario: su dinero, su posición en cada proyecto y el siguiente paso.

### Lo que funciona

1. **Disciplina de estados.** Error, carga y dato son excluyentes y tienen el rol accesible
   correcto. El comentario de `DashboardPage.tsx:21` justifica por qué no se muestra ninguna
   cifra hasta tener la del backend, en línea con "Certeza sobre cada peso".
2. **Base tipográfica y de color.** Papel cálido, Fraunces con números tabulares, `formatCOP`
   en `es-CO` y foco visible global (`globals.css`): el punto de partida correcto para la
   identidad.
3. **Dato siempre fresco y protegido.** El saldo se pide al backend en cada visita
   (`useGeneralSummary.ts`) y el backend exige que sea el propio usuario.

### Problemas prioritarios

#### [P0] La navegación móvil se rompe

- **Qué:** la cabecera (`AppLayout.css:1-8`) es una fila flexible sin ajuste ni punto de
  quiebre, con 2.5rem de separación y 2rem de relleno. En 393px las etiquetas se parten en dos
  líneas, "Cerrar sesión" queda cortado al borde y la página desborda en horizontal. Por ese
  desborde el navegador aleja el zoom y todo el contenido se ve diminuto (captura móvil).
- **Por qué importa:** el uso principal es en el celular (PRODUCT.md). Los enlaces no tienen
  relleno y "Cerrar sesión" no tiene ni relleno ni borde, así que los objetivos táctiles quedan
  muy por debajo de 44px (WCAG 2.1 AA).
- **Corrección:** barra inferior con los 4 destinos (icono + etiqueta, mínimo 48px de alto),
  página activa con `NavLink` y `aria-current="page"`, usuario y "Cerrar sesión" en un menú de
  cuenta, `nav` con `aria-label`, y comprobar que no haya desborde a 320px.
- **Comando sugerido:** `/impeccable adapt`, luego `/impeccable layout`.
- **¿Lo resuelve la dirección del rediseño?** **Sí**, si la barra inferior incluye la página
  activa y "Cerrar sesión" va en un menú de cuenta y no como quinto destino.

#### [P1] La cifra protagonista no es "tuya"

- **Qué:** `User.getGeneralSummary()` (`demo/src/main/java/com/syncfund/domain/model/User.java:73-82`)
  suma el saldo de la billetera más el saldo **completo** de cada proyecto, es decir, el fondo
  entero con los aportes de los compañeros. La pantalla lo presenta como "tu saldo general"
  (`DashboardPage.tsx:17-18`) y no desglosa qué es billetera y qué es fondo. Ejemplo: quien
  aportó $50.000 a un fondo de $300.000 ve $250.000 que no son suyos.
- **Por qué importa:** contradice los principios 1 y 2 de PRODUCT.md en la pantalla más vista.
  El usuario puede creer que tiene más dinero del que tiene, y es un punto débil al sustentar.
- **Corrección (solo frontend, sin tocar el dominio):** que la cifra protagonista sea lo que
  es del usuario (billetera, o billetera más sus saldos netos por proyecto) y debajo un desglose
  en renglones ("Billetera personal $X"; por proyecto, "Fondo $Y · tú: te deben / debes / en paz
  $Z"). Si se conserva `getGeneralSummary`, cambiar la etiqueta para que diga que incluye los
  fondos completos. Cambiar el cálculo del dominio es tema del equipo (regla 1 de CLAUDE.md).
- **Comando sugerido:** `/impeccable clarify`, luego `/impeccable shape`.
- **¿Lo resuelve la dirección del rediseño?** **No.** Es un problema de contenido y
  significado; las hojas solo dan dónde poner el desglose.

#### [P1] El Resumen no resume

- **Qué:** solo hay un saludo y un número (`DashboardPage.tsx:16-37`), aunque ya existen
  datos y componentes para más: saldo neto por proyecto y pagos sugeridos
  (`ProjectBalancesResponse` en `src/types/api.ts`), lista de proyectos (`useSharedProjects`,
  `ProjectCard`), meta de ahorro y colchón (`WalletSummaryCard`) y categorías con límite.
- **Por qué importa:** el éxito del producto es saber en todo momento si estás en paz, te deben
  o debes (PRODUCT.md), y hoy eso exige visitar cada proyecto.
- **Corrección:** cifra protagonista con su etiqueta; la fila breve de indicadores que permite
  DESIGN.md (máximo 3: "Billetera", "Te deben", "Debes"); una hoja "Tus proyectos" en renglones,
  con el estado en texto y signo y un "Pagar $X" hacia el pago sugerido; una hoja "Presupuesto
  del mes" con las categorías cerca del límite; y una acción principal "Registrar movimiento".
- **Comando sugerido:** `/impeccable layout`, luego `/impeccable bolder`.
- **¿Lo resuelve la dirección del rediseño?** **En parte.** Las hojas y el ancho mayor dan el
  lienzo, pero el contenido hay que decidirlo y cargarlo. Más ancho sin contenido solo agranda
  el vacío.

#### [P1] La cifra no tiene estados de borde

- **Qué:**
  - Usuario nuevo: ve "$ 0" sin ningún siguiente paso.
  - Saldo negativo: sale "-$ X" en tinta neutra, sin texto, contra la regla Not-Only-Color.
  - Cifras enormes: 2.5rem fijos, sin escala fluida ni corte (`DashboardPage.tsx:33`);
    "$ 1.234.567.890" no cabe en el ancho útil de 393px.
  - Nombre: el saludo usa `user.name.split(' ')[0]` (`:16`), que queda vacío si el nombre
    empieza con un espacio, y el nombre en la cabecera no se trunca.
- **Por qué importa:** el primer día y los saldos negativos son los momentos que definen la
  confianza.
- **Corrección:**
  - Estado vacío con dos acciones: "Registra tu primer ingreso" y "Crea o únete a un proyecto".
  - Negativos con signo, color loss-700 (por contraste) y etiqueta.
  - Tamaño fluido con `clamp()` desde tokens y corte de línea seguro.
  - Nombre recortado y truncado con elipsis en la cabecera.
- **Comando sugerido:** `/impeccable harden`, luego `/impeccable onboard`.
- **¿Lo resuelve la dirección del rediseño?** **No.**

#### [P2] Accesibilidad estructural y tokens

- **Qué:**
  - `index.html` declara `lang="en"` y el título es `syncfund-frontend`, igual en todas las
    páginas.
  - La página empieza en `h2`, sin `h1`.
  - No hay enlace para saltar al contenido.
  - El tamaño y el color de la cifra y del subtítulo van en estilos en línea, con un 2.5rem que
    no es token (`DashboardPage.tsx:17,33`).
- **Por qué importa:**
  - Es requisito de WCAG 2.1 AA: 3.1.1 (idioma de la página), 2.4.2 (título de la página) y
    1.3.1 (información y relaciones).
  - También lo exige la regla de tokens de CLAUDE.md.
  - Con `lang="en"`, un lector de pantalla pronuncia el español con reglas del inglés.
- **Corrección:**
  - `lang="es-CO"`.
  - Título por ruta ("Resumen · SyncFund").
  - Un `h1` en la página.
  - Token de tamaño Display (fijo y fluido) en `globals.css` y `theme.ts`, y una clase para la
    cifra protagonista en lugar de estilos en línea.
- **Comando sugerido:** `/impeccable audit`, luego `/impeccable typeset`.
- **¿Lo resuelve la dirección del rediseño?** **En parte.** El menú lateral y la barra inferior
  son el momento de agregar regiones, enlace de salto y página activa; idioma, título y
  encabezados son independientes.

### Qué resuelve la dirección del rediseño

| Problema | Menú lateral · barra inferior · hojas |
|---|---|
| [P0] Navegación móvil rota | Sí (con página activa y menú de cuenta) |
| [P1] La cifra no es "tuya" | No |
| [P1] El Resumen no resume | En parte (da el lienzo, no el contenido) |
| [P1] Estados de borde de la cifra | No |
| [P2] Accesibilidad estructural y tokens | En parte |

### Señales de alerta por persona

- **Usuario distraído en el celular** (registra un gasto en la fila del almuerzo):
  - Llega a una cabecera rota con etiquetas de unos 10px por el zoom alejado.
  - No encuentra "Cerrar sesión" ni una acción para registrar.
  - Tiene que hacer zoom o desplazarse de lado.
- **Primera vez, recién registrado:**
  - Ve "Hola, X" y "$ 0".
  - No tiene pista de qué es una billetera, un proyecto o el colchón.
  - Encuentra cuatro enlaces al mismo nivel y ningún primer paso.
- **Usuario de lector de pantalla o teclado:**
  - Oye el español con pronunciación inglesa.
  - No encuentra un `h1`.
  - La navegación no anuncia la página actual.
  - Recorre 7 paradas de la cabecera antes del contenido.
  - Oye "-$ 240.000" sin saber si es deuda.
  - A favor: el foco visible sí funciona.
- **Estudiante que comparte arriendo** (persona de PRODUCT.md):
  - Abre la app para saber si le debe a su compañera.
  - Ve un total inflado con el fondo del apartamento, y ningún "debes $18.000 a Laura".
  - Tiene que entrar al proyecto, leer la tabla de situación y volver.
  - Puede gastarse el dinero del arriendo creyendo que es suyo.

### Observaciones menores

- "Cerrar sesión" va en azul acero (como enlace) y la navegación en gris: la acción menos
  frecuente es la que más resalta (`AppLayout.css`).
- El nombre de usuario en la cabecera es texto plano; si habrá perfil, debería abrir un menú de
  cuenta.
- La marca "SyncFund" y "Resumen" llevan al mismo destino.
- El hover de la navegación no tiene transición ni subrayado, y no existe estado presionado
  (DESIGN.md lo deja pendiente).
- La cifra no tiene etiqueta pegada encima, a diferencia de `WalletSummaryCard`: hay
  inconsistencia entre pantallas.
- PRODUCT.md dice que los datos se actualizan por consulta periódica, pero el Resumen no
  consulta de nuevo ni dice cuándo se actualizó.
- Relacionado, fuera de esta página: `PersonalWalletPage.tsx` usa una cuadrícula fija de dos
  columnas sin punto de quiebre.

### Preguntas para el equipo

1. Si el usuario solo viera una cosa al abrir la app, ¿debería ser "cuánto tengo" o "¿estoy en
   paz?"? ¿Y si la protagonista fuera un estado ("Estás en paz en 2 proyectos, debes $18.000 en
   1") en vez de un monto?
2. ¿Es defendible ante el docente llamar "tu saldo" a un número que incluye dinero de los
   compañeros? ¿Se cambia la etiqueta o se cambia la cifra?
3. ¿El Resumen es solo para leer o es el punto de partida de las acciones (registrar, aportar,
   pagar lo sugerido)? En el celular, ¿la barra inferior lleva un botón central "Registrar"?
4. ¿Qué ve alguien con $0 y sin proyectos: una pantalla vacía y honesta, o un primer paso guiado
   que no invente cifras?

### Decisiones propuestas

> **Propuesta pendiente de confirmar en la reunión del equipo.** Responde las preguntas 1 y 2
> y el problema [P1] "La cifra protagonista no es tuya". Nada de esto está implementado.

**Cifra protagonista: billetera + saldos netos.**
- La cifra principal del Resumen es lo que de verdad es del usuario: saldo de la billetera
  personal más su saldo neto en cada proyecto compartido.
- Va con su desglose en renglones: billetera personal y cada proyecto.
- Se calcula en el frontend con datos que ya existen (`ProjectBalancesResponse`), sin cambiar
  el dominio ni `User.getGeneralSummary()`.

**Enfoque: "¿Cuánto tengo?" como protagonista.** Según su situación en los proyectos, debajo de
la cifra aparece:

| Situación del usuario | Qué se muestra |
|---|---|
| Debe dinero en algún proyecto | Justo debajo de la cifra, un aviso destacado: a quién le debe, cuánto y un acceso directo a "Pagar". |
| Le deben dinero | Se indica en la hoja de proyectos, no en el aviso. |
| Está en paz en todos | Una línea discreta: "Estás al día en todos tus proyectos". |

---

## Billetera personal

- **Archivo:** `src/pages/PersonalWalletPage.tsx` (ruta `/wallet`), con `WalletSummaryCard`,
  `TransactionForm`, `SavingsGoalForm`, `CushionForm` y `TransactionList`.
- **Fecha:** 2026-11-13 · rama `docs/diagnostico-diseno`.
- **Evidencia:** código fuente, capturas de página completa en
  `docs/diseno/capturas-antes/` (`localhost_5173_wallet.png` y
  `localhost_5173_wallet(iPhone 16).png`) y el detector de impeccable.
- **Modo de la pantalla:** Operate.

### Puntaje de heurísticas (Nielsen)

| # | Heurística | Nota | Problema clave |
|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 2 | Guardar un movimiento, la meta o el colchón no da ninguna confirmación: solo cambian las cifras en silencio. |
| 2 | Coincidencia con el mundo real | 3 | Lenguaje local (COP, "colchón"), pero "Apartar / Liberar" no dice de dónde a dónde va la plata. |
| 3 | Control y libertad | 1 | No se puede editar ni eliminar un movimiento; cambiar entre Gasto e Ingreso borra lo escrito (`TransactionForm.tsx:54-61`). |
| 4 | Consistencia y estándares | 2 | El monto vacío en modo Gasto tiene el mismo borde terracota que un campo con error; estilos en línea en la página y en `CushionForm`. |
| 5 | Prevención de errores | 2 | Montos `type="number"` "sin puntos", sin formato de miles ni vista previa: 50000 y 500000 se confunden. Apartar y Liberar no muestran el disponible. |
| 6 | Reconocer antes que recordar | 2 | Meta y colchón no muestran saldo actual ni máximo; las filas no muestran la categoría. |
| 7 | Flexibilidad y eficiencia | 2 | Sin `inputMode`, filtros ni agrupación por mes; el formulario ocupa siempre la primera pantalla. |
| 8 | Estética y diseño minimalista | 2 | Tres formularios compiten con el libro; en móvil el historial empieza cerca de los 1000px. |
| 9 | Recuperación de errores | 3 | `LoadError`, `FormError` y el reintento de categorías bien resueltos; mensajes del backend claros. |
| 10 | Ayuda y documentación | 1 | Nada explica qué es el colchón ni la meta; el estado vacío no orienta. |
| **Total** | | **20/40** | **Aceptable con fallas importantes** (límite inferior). |

### Veredicto de especificidad

**Revisión de diseño:** tiene rasgos propios (cifra en Fraunces, filas de libro mayor con línea
fina, números tabulares, signo "+ / −" explícito), pero la composición es la de un CRUD genérico:
cifra, formulario grande en caja, dos mini-formularios y lista plana. Nada de la pantalla expresa
"certeza sobre cada peso": la cifra principal no dice qué representa, la meta es un número sin
progreso y el colchón mueve plata sin dejar rastro en el libro.

**Detector automático:** 0 hallazgos en la página y sus 5 componentes (salida `[]`, código 0).
Como en el Resumen, solo corrieron las reglas por patrón sobre el código; contraste y texto
diminuto no se evaluaron y no hubo superposición en el navegador.

### Impresión general

La billetera es la pantalla de uso diario (registrar un gasto en el momento) y hoy está
organizada al revés: primero formularios, después el libro. Los estados de carga y error son
honestos, pero la pantalla no explica su propia cifra. La mayor oportunidad es que el saldo, la
meta y el colchón se lean como un solo estado de cuenta ("disponible", "apartado", "llevas $X
de tu meta") y que registrar un movimiento sea una acción que se abre, no un bloque fijo.

### Lo que funciona

1. **Estados honestos.** Con error no se muestran datos viejos, y billetera y movimientos se
   cargan juntos para que un fallo no parezca "sin movimientos" (`PersonalWalletPage.tsx:20-30`,
   `usePersonalWallet.ts:18-24`). El fallo de categorías es un aviso suave con "Reintentar".
2. **Filas de libro mayor.** Línea fina, números tabulares y signo explícito (signo menos real,
   no guion), sin depender solo del color; los pagos entre integrantes van en neutro y sin signo.
3. **Formularios accesibles en lo básico.** Etiquetas asociadas, `aria-invalid`,
   `aria-describedby`, foco al primer error (`useFormErrors`) y `role="alert"` en `FormError`.

### Problemas prioritarios

#### [P1] La meta y el colchón desbordan la pantalla en móvil

- **Qué:** `PersonalWalletPage.tsx:40-47` define en línea `gridTemplateColumns: '1fr 1fr'` sin
  punto de quiebre. En la captura del iPhone ese bloque llega a unos 445px mientras el resto del
  contenido termina en unos 358px; el botón "Liberar" también sobresale y cada campo queda en
  unos 190px.
- **Por qué importa:** es una segunda fuente de desborde horizontal, independiente de la
  cabecera: arreglar `AppLayout` no la elimina.
- **Corrección:** pasar a una clase CSS con una columna por defecto y dos desde unos 640px; o
  mejor, que meta y colchón sean acciones que se abren en panel u hoja (ver preguntas).
- **Comando sugerido:** `/impeccable adapt`, luego `/impeccable layout`.
- **¿Lo resuelve la dirección del rediseño?** **En parte.** Si meta y colchón pasan a paneles u
  hojas inferiores, sí; si se quedan en la página, la cuadrícula sigue rota.

#### [P1] El colchón mueve plata sin dejar rastro y la cifra principal no dice qué es

- **Qué:** "Apartar" resta del saldo y suma al colchón
  (`demo/src/main/java/com/syncfund/domain/model/PersonalWallet.java:59-71`), pero no crea
  ninguna fila en Movimientos. La cifra principal (`WalletSummaryCard.tsx:9-10`) solo lleva como
  etiqueta el nombre de la billetera ("Ahorros personales"), no "Disponible". En la captura el
  saldo es $123.000 y el historial visible no suma esa cifra.
- **Por qué importa:** rompe "certeza sobre cada peso": quien aparta $50.000 ve bajar su saldo y
  no encuentra la razón en el libro.
- **Corrección:** etiquetar la cifra como "Disponible", con "Total = disponible + colchón"
  debajo; en el formulario del colchón, mostrar los límites con el `hint` que ya soporta `Input`
  ("Disponible para apartar: $X · Apartado: $Y"). Que los movimientos del colchón aparezcan en el
  libro requiere decisión del equipo, porque hoy no son transacciones (regla 1 de CLAUDE.md).
- **Comando sugerido:** `/impeccable clarify`.
- **¿Lo resuelve la dirección del rediseño?** **No.** Es información y dominio, no estructura.

#### [P1] La meta de ahorro es un número muerto

- **Qué:** `WalletSummaryCard.tsx:13-16` muestra "Meta de ahorro mensual $ 0" sin compararla con
  nada: ni progreso del mes ni invitación a definirla.
- **Por qué importa:** para el estudiante, la meta es el gancho emocional de la pantalla y hoy no
  le dice si va bien o mal. Con meta en $0, el usuario nuevo ve "$ 0" dos veces.
- **Corrección:** mostrar el progreso del mes ("Llevas $X de $Y este mes") con una barra plana;
  sin meta, una invitación a definirla. Decidir si el cálculo va en el frontend o en el backend
  (regla 2 de CLAUDE.md: la lógica de negocio vive en los services).
- **Comando sugerido:** `/impeccable onboard`, luego `/impeccable clarify`.
- **¿Lo resuelve la dirección del rediseño?** **No.**

#### [P1] Las filas del libro se rompen con datos reales

- **Qué:** `.tx-list__row` (`TransactionList.css:7-13`) no tiene `gap`, ni `min-width: 0` en la
  descripción, ni `white-space: nowrap` en el monto.
  - En la captura móvil, el "+" queda en una línea y "$ 10.000" en la siguiente (filas "Pago de
    PruebaC – «Prueba eliminar»" y "…«Viaje a CANCUN»").
  - "Pago de Prueba B – «Prueba fondo»+ $ 23.500" queda pegado al monto.
  - No hay paginación ni agrupación por mes, el año se repite en cada fecha y no se muestra la
    categoría, aunque el formulario la pide.
- **Por qué importa:** el monto es lo que el usuario vino a verificar; un signo separado de su
  cifra crea ambigüedad justo donde no puede haberla. El mismo componente se usa en el Detalle
  del proyecto.
- **Corrección:** `gap` en la fila, `min-width: 0` y `overflow-wrap: anywhere` en la
  descripción, `white-space: nowrap` y `flex-shrink: 0` en el monto; agrupar por mes, mostrar la
  categoría como dato secundario y paginar o "Ver más" pasadas unas 30 filas.
- **Comando sugerido:** `/impeccable harden`, luego `/impeccable layout`.
- **¿Lo resuelve la dirección del rediseño?** **En parte.** La hoja le da marco, pero no corrige
  el CSS de la fila.

#### [P2] El formulario de movimiento da señales confusas y no confirma nada

- **Qué:**
  - En modo Gasto, el monto vacío ya tiene borde terracota (`TransactionForm.css:37-38`): en las
    dos capturas parece un campo con error antes de escribir.
  - El selector Gasto/Ingreso son dos botones sin `aria-pressed` (`TransactionForm.tsx:95-108`):
    un lector de pantalla no sabe cuál está activo.
  - Cambiar de tipo borra monto y descripción (`TransactionForm.tsx:57-58`).
  - Al guardar no hay mensaje de éxito ni anuncio `role="status"`.
  - El monto no lleva `inputMode="numeric"` y la instrucción "(sin puntos)" vive en el
    placeholder, que desaparece al escribir.
  - En el colchón, Apartar y Liberar comparten estado de carga: ambos dicen "Procesando..."
    (`CushionForm.tsx:54-58`).
- **Por qué importa:** registrar un gasto es la tarea más frecuente. El borde rojo da falsa
  alarma y la falta de confirmación lleva a registrar dos veces.
- **Corrección:** marcar el tipo en el selector, no con el borde; `aria-pressed`; conservar lo
  escrito al cambiar de tipo; aviso de éxito con `role="status"` ("Gasto de $2.000
  registrado"); vista previa formateada bajo el campo ("= $ 50.000"); `inputMode="numeric"`;
  estado de carga por botón.
- **Comando sugerido:** `/impeccable clarify`, luego `/impeccable harden`.
- **¿Lo resuelve la dirección del rediseño?** **En parte.** El panel u hoja inferior da un
  momento claro de "guardar y cerrar", pero el selector, el borde y la vista previa siguen
  pendientes.

### Qué resuelve la dirección del rediseño

| Problema | Menú lateral · barra inferior · hojas |
|---|---|
| [P1] Meta y colchón desbordan en móvil | En parte (sí, si pasan a paneles u hojas inferiores) |
| [P1] Colchón sin rastro y cifra sin etiqueta | No |
| [P1] Meta sin progreso | No |
| [P1] Filas del libro se rompen | En parte (da el marco, no el CSS) |
| [P2] Formulario confuso y sin confirmación | En parte |

### Problemas ya documentados que también aparecen aquí

- **Navegación móvil rota** ([P0] del Resumen): se ve en la captura del iPhone, con la cabecera
  cortada y el zoom alejado.
- **Accesibilidad estructural** ([P2] del Resumen): la página empieza en `h2`
  (`PersonalWalletPage.tsx:18`), `lang="en"`, título genérico y sin enlace para saltar.
- **Brechas de contraste** (DESIGN.md): `gain-500` en los ingresos, `loss-500` en gastos y en el
  borde del monto, `ink-faint` en fechas, estado vacío y placeholders.

### Señales de alerta por persona

- **Usuario distraído en el celular:**
  - Tiene que bajar más de una pantalla de formulario para ver su historial.
  - El bloque de meta y colchón desborda.
  - Apartar y Liberar son contiguos, del mismo estilo y sin confirmación: un toque errado mueve
    plata.
- **Primera vez:**
  - Ve "$ 0 / $ 0", tres formularios sin explicación y "Todavía no hay movimientos
    registrados." sin un siguiente paso.
  - No sabe qué es el colchón ni para qué sirve la meta.
- **Usuario de lector de pantalla o teclado:**
  - El selector de tipo no anuncia su estado y guardar no se anuncia.
  - Tras guardar, el foco queda en el botón sin contexto.
  - El signo "+" o "−" separado por un espacio puede leerse mal; conviene un texto oculto
    "Ingreso de" / "Gasto de".
- **Estudiante que comparte arriendo** (persona de PRODUCT.md):
  - Los aportes y pagos de proyectos aparecen mezclados con sus gastos propios ("Aporte a «Viaje
    a CANCUN»" − $90.000) sin marca de proyecto, contra el principio 2 de PRODUCT.md.
  - No puede responder "¿cuánto gasté este mes?".

### Observaciones menores

- "Ahorros personales" bajo el título parece un subtítulo, no la etiqueta de la cifra.
- En la meta, la etiqueta "Monto (COP)" repite lo que ya dice el título.
- `SavingsGoalForm` inicializa con `useState(String(currentGoal))` (`SavingsGoalForm.tsx:17`): si
  la meta cambia por fuera, el campo no se actualiza; y el 0 precargado obliga a borrarlo.
- Las fechas repiten el año en cada fila ("11 de nov de 2026"), innecesario en el año en curso.
- `Button` dice "Procesando..." con tres puntos y `LoadingState` usa "…".

### Preguntas para el equipo

1. ¿La meta y el colchón son acciones (paneles laterales u hojas inferiores invocadas desde el
   resumen) o bloques fijos de la página? Esto decide gran parte de la composición.
2. ¿Los movimientos del colchón deben aparecer en el libro? Hoy no generan transacción;
   cambiarlo puede tocar el dominio y el esquema.
3. ¿La cifra principal debe ser "Disponible" o "Total (disponible + colchón)"?
4. ¿El progreso mensual de la meta se calcula en el frontend o debe venir del backend para no
   duplicar lógica de negocio?

---

## Proyectos compartidos

- **Archivo:** `src/pages/SharedProjectsPage.tsx` (ruta `/projects`, la lista), con
  `ProjectCard` y `CreateProjectForm`.
- **Fecha:** 2026-11-13 · rama `docs/diagnostico-diseno`.
- **Evidencia:** código fuente, capturas de página completa en
  `docs/diseno/capturas-antes/` (`localhost_5173_projects.png` y
  `localhost_5173_projects(iPhone 16).png`) y el detector de impeccable.
- **Modo de la pantalla:** Operate.

### Puntaje de heurísticas (Nielsen)

| # | Heurística | Nota | Problema clave |
|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 2 | Crear un proyecto no confirma nada: los campos se vacían y el proyecto aparece en una posición que no se controla. Carga y error, bien. |
| 2 | Coincidencia con el mundo real | 2 | El monto sin etiqueta se lee como "mi plata" o "lo que debo"; en realidad es el fondo común (en el Detalle sí se llama "Fondo del proyecto"). |
| 3 | Control y libertad | 3 | Crear no tiene confirmación y no se puede deshacer, pero el costo es bajo. |
| 4 | Consistencia y estándares | 2 | El mismo dato se llama "fondo" en el Detalle y no tiene nombre aquí; dos `h3` hermanos con tamaños distintos; estilos en línea. |
| 5 | Prevención de errores | 3 | Valida el nombre obligatorio; no hay límite de longitud en ninguna capa y es fácil crear proyectos con el mismo nombre. |
| 6 | Reconocer antes que recordar | 2 | La fila no dice si el usuario administra el proyecto ni cuál es su situación: hay que entrar a cada uno. |
| 7 | Flexibilidad y eficiencia | 2 | Sin orden, búsqueda ni agrupación; el usuario frecuente pasa por el formulario cada vez. |
| 8 | Estética y diseño minimalista | 3 | Limpia y sobria; el problema es de prioridad: el formulario domina. |
| 9 | Recuperación de errores | 3 | `LoadError` con reintento y `role="alert"`; los errores del formulario pasan por `useFormErrors`. |
| 10 | Ayuda y documentación | 1 | El estado vacío es una línea gris que no explica qué es un proyecto ni el fondo. |
| **Total** | | **23/40** | **Aceptable con fallas notorias**: funciona, pero no comunica lo que importa. |

### Veredicto de especificidad

**Revisión de diseño:** buena base tipográfica (Fraunces en el título, filas con línea fina,
números tabulares), pero la estructura es la de un CRUD genérico: formulario arriba, lista abajo
(`SharedProjectsPage.tsx:33-39`). La fila no dice de quién es el dinero, qué rol tiene el usuario
ni cómo está en el proyecto. Si "$ 90.000" se cambiara por "12 tareas", la pantalla serviría para
un gestor de tareas.

**Detector automático:** 0 hallazgos en la página, `ProjectCard` y `CreateProjectForm` (salida
`[]`, código 0). Mismas limitaciones que en el Resumen: solo reglas por patrón sobre el código.

### Impresión general

Correcta, sobria y de bajo valor. El estudiante entra a esta lista para saber en cuál de sus
grupos debe, le deben o está en paz, y la fila le da otra cifra: el fondo común, sin etiqueta.
Además, el formulario para crear, que se usa pocas veces, ocupa el lugar más visible. La mayor
oportunidad es que cada fila sea un renglón de su situación personal y que crear sea una acción
que se abre.

### Lo que funciona

1. **Estados de datos bien pensados.** `projects === null` separa "no cargó" de "lista vacía"
   (`useSharedProjects.ts:8-12`) y con error no se muestra la lista anterior.
2. **Filas con forma de libro mayor.** Línea fina en lugar de tarjetas con sombra, números
   tabulares y COP en `es-CO`. Cada fila es un solo enlace (`ProjectCard.tsx:8`): toda el área
   es tocable, mide unos 80px de alto y tiene foco visible.
3. **Formulario accesible.** Etiquetas asociadas, `aria-invalid` y `aria-describedby`; ejemplos
   locales en los campos ("Viaje a Cartagena").

### Problemas prioritarios

#### [P1] La cifra de cada fila es ambigua y no es la que el usuario necesita

- **Qué:** cada fila muestra `formatCOP(project.currentBalance)` sin etiqueta
  (`ProjectCard.tsx:13`). Es el fondo común, no la situación del usuario. La respuesta de la
  lista (`SharedProjectResponse`, `types/api.ts`) ni siquiera trae el saldo neto del usuario; ese
  dato solo existe en `GET /api/projects/{id}/balances`, proyecto por proyecto.
- **Por qué importa:** contradice "certeza sobre cada peso" y "lo personal y lo compartido,
  juntos" (PRODUCT.md). Quien ve "$ 90.000" puede creer que tiene o que debe 90 mil, y saber si
  debe obliga a abrir cada proyecto.
- **Corrección:**
  - Inmediata (solo frontend): etiquetar "Fondo $ 90.000".
  - Objetivo: una segunda línea con la situación personal ("Estás en paz" / "Te deben $12.000" /
    "Debes $8.000"), siempre con texto además del color. Requiere que la respuesta de la lista
    traiga el saldo neto del usuario (un campo en el DTO de respuesta, permitido por la regla 1 de
    CLAUDE.md) o pedir los saldos por proyecto.
- **Comando sugerido:** `/impeccable clarify`, luego `/impeccable shape`.
- **¿Lo resuelve la dirección del rediseño?** **No.** Cambia el contenedor, no el dato.

#### [P1] El formulario para crear desplaza a la lista, que es la tarea principal

- **Qué:** el formulario va primero y siempre abierto (`SharedProjectsPage.tsx:34-36`). En la
  captura móvil ocupa casi toda la primera pantalla y la lista empieza en la mitad inferior; sin
  el zoom que provoca la cabecera rota, quedaría debajo del pliegue.
- **Por qué importa:** un proyecto se crea pocas veces y se consulta a diario; el usuario que
  vuelve paga ese costo cada vez.
- **Corrección:** la lista primero y un botón "Nuevo proyecto" que abra el formulario en panel
  lateral (escritorio) u hoja inferior (móvil). Con la lista vacía, crear pasa a ser lo principal.
- **Comando sugerido:** `/impeccable layout`, luego `/impeccable distill`.
- **¿Lo resuelve la dirección del rediseño?** **Sí.** DESIGN.md ya define abrir los formularios
  en panel u hoja; basta con aplicarlo aquí.

#### [P2] Estado vacío y primer uso pobres

- **Qué:** con la lista vacía solo aparece una línea en `ink-faint` con estilo en línea
  (`SharedProjectsPage.tsx:26`), sin explicación ni acción.
- **Por qué importa:** el usuario nuevo no sabe qué es un proyecto, que el administrador agrega
  integrantes por correo ni que aportar descuenta de su billetera. Tampoco sabe que, si lo van a
  agregar, no necesita crear uno.
- **Corrección:** estado vacío en una hoja, con una frase sobre el modelo del fondo ("Un proyecto
  junta los aportes de cada integrante en un fondo común que paga los gastos del grupo") y dos
  caminos: "Crear proyecto" y "Si alguien te agrega por correo, aparecerá aquí". Texto en
  `ink-muted` o más oscuro.
- **Comando sugerido:** `/impeccable onboard`, luego `/impeccable clarify`.
- **¿Lo resuelve la dirección del rediseño?** **En parte.** La hoja da el contenedor; el texto
  hay que escribirlo.

#### [P2] La fila no resiste casos límite y comunica poco

- **Qué:**
  - `.project-card` es una fila flexible sin `gap` ni `min-width: 0`, y el nombre no tiene corte
    de línea seguro (`ProjectCard.css:1-19`): un nombre largo se pega o se monta sobre el monto.
  - El plural está fijo: un proyecto recién creado dice "1 integrantes" (`ProjectCard.tsx:11`).
  - No se indica el rol (administrador) ni hay señal de que la fila es un enlace (sin flecha ni
    cambio al pasar el cursor).
  - Un lector de pantalla oye "Viaje 3 integrantes $ 90.000", sin saber que la cifra es el
    fondo.
  - Sin orden definido: con 15 proyectos o más la lista pierde jerarquía.
- **Por qué importa:** la fila es la unidad de esta pantalla; si falla con datos reales, como el
  "Viaje a CANCUN" en mayúsculas de la captura, se pierde la sensación de libro bien llevado.
- **Corrección:** `gap`, `min-width: 0` y `overflow-wrap: anywhere` en el nombre; plural
  correcto; "Administras" en los metadatos; flecha sutil y fondo `ledger-100` al pasar el cursor o
  tocar; texto accesible "Fondo: $ 90.000"; orden fijo (deudas pendientes primero o actividad
  reciente); límite de longitud del nombre en el DTO y en el campo.
- **Comando sugerido:** `/impeccable harden`, luego `/impeccable polish`.
- **¿Lo resuelve la dirección del rediseño?** **No.**

#### [P3] Crear un proyecto no confirma ni da continuidad

- **Qué:** al terminar, el formulario se vacía y la lista se recarga
  (`CreateProjectForm.tsx:28-30`). No hay mensaje ni lleva al proyecto nuevo, aunque el paso
  siguiente lógico es agregar integrantes. Es el mismo patrón de "guardar sin confirmación" de la
  Billetera.
- **Por qué importa:** el usuario no sabe si funcionó y el flujo "crear → agregar integrantes →
  aportar" se corta.
- **Corrección:** al crear, cerrar el panel e ir a `/projects/{id}`, o resaltar la fila nueva con
  "Proyecto creado. Ahora agrega a los integrantes".
- **Comando sugerido:** `/impeccable clarify` (y `/impeccable animate` para la entrada de la fila).
- **¿Lo resuelve la dirección del rediseño?** **En parte.** El panel da un momento de cierre;
  falta decidir qué pasa después.

### Qué resuelve la dirección del rediseño

| Problema | Menú lateral · barra inferior · hojas |
|---|---|
| [P1] Cifra ambigua en cada fila | No |
| [P1] Formulario desplaza a la lista | Sí (formulario en panel u hoja inferior) |
| [P2] Estado vacío pobre | En parte (da la hoja, no el texto) |
| [P2] Fila frágil y poco informativa | No |
| [P3] Crear sin confirmación | En parte |

### Problemas ya documentados que también aparecen aquí

- **Navegación móvil rota** ([P0] del Resumen): en la captura del iPhone el contenido ocupa solo
  la parte izquierda de una página alejada.
- **Accesibilidad estructural** ([P2] del Resumen): empieza en `h2`
  (`SharedProjectsPage.tsx:33`), `lang="en"`, título genérico, sin enlace para saltar.
- **Brechas de contraste** (DESIGN.md): `ink-faint` en "3 integrantes" y en el estado vacío.
- **Guardar sin confirmación** ([P2] de la Billetera): se repite al crear un proyecto.

### Señales de alerta por persona

- **Usuario distraído en el celular:** lee "$ 90.000" sin etiqueta y cree que es su saldo o su
  deuda; para llegar a la lista pasa por el formulario.
- **Primera vez:** ve un formulario sin contexto y una línea gris; no sabe qué es un fondo, que
  aportar descuenta de su billetera ni que puede esperar a que lo agreguen.
- **Usuario de lector de pantalla o teclado:** cada enlace anuncia "Nombre N integrantes $ X" sin
  decir que X es el fondo; los dos `h3` tienen el mismo nivel y pesos distintos. A favor: un solo
  enlace por fila, en orden lógico y con foco visible.
- **Estudiante con varios grupos** (apartamento, viaje, parche; persona de PRODUCT.md): quiere
  saber en cuál debe antes de cobrarle a alguien; hoy abre proyecto por proyecto, sin orden, rol
  ni estado que lo guíe.

### Observaciones menores

- La descripción que se pide al crear ("Descripción (opcional)") nunca se muestra en la lista.
- El monto va en Figtree a 1.125rem; podría tener más intención sin competir con la cifra
  protagonista del Detalle.
- El botón "Crear proyecto" a todo el ancho refuerza que el formulario domine la página.
- Estilos en línea en `SharedProjectsPage.tsx:26,34,38` y en `CreateProjectForm.tsx`.

### Preguntas para el equipo

1. ¿Puede la lista de proyectos traer el saldo neto del usuario en cada uno (un campo en el DTO
   de respuesta, calculado con `DebtCalculator`)? ¿O se piden los saldos por proyecto, sabiendo
   que en móvil son N peticiones?
2. ¿Qué cifra lleva cada fila: el fondo, la situación del usuario o las dos? Si en móvil solo cabe
   una, ¿cuál responde mejor a "certeza sobre cada peso"?
3. Al crear un proyecto, ¿se lleva al usuario directo al Detalle para agregar integrantes, o se
   queda en la lista con una confirmación?
4. ¿En qué orden van los proyectos: deudas pendientes primero, actividad reciente o alfabético?
   ¿Se muestra en la fila que el usuario es administrador?

---

## Detalle del proyecto

- **Archivo:** `src/pages/SharedProjectDetailPage.tsx` (ruta `/projects/:id`), con
  `ProjectSummaryCard`, `ProjectStatusTable`, `SettleDebtForm`, `MembersList`,
  `RemoveMemberConfirm`, `AddMemberForm`, `ExpenseForm`, `ParticipantChips`, `ContributionForm` y
  `TransactionList`.
- **Fecha:** 2026-11-13 · rama `docs/diagnostico-diseno`.
- **Evidencia:** código fuente, capturas de página completa del proyecto 40 en
  `docs/diseno/capturas-antes/` (`localhost_5173_projects_40.png` y
  `localhost_5173_projects_40(iPhone 16).png`) y el detector de impeccable.
- **Modo de la pantalla:** Operate. Es la pantalla más compleja de la app.

### Puntaje de heurísticas (Nielsen)

| # | Heurística | Nota | Problema clave |
|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 2 | Pagar, aportar o registrar un gasto no da confirmación: el formulario se limpia o se cierra y la tabla se recarga en silencio. |
| 2 | Coincidencia con el mundo real | 3 | Buen lenguaje ("Te deben", "Al día", "Pago entre integrantes"), pero el historial repite "Aporte al fondo" sin decir quién aportó. |
| 3 | Control y libertad | 2 | "Pagar" mueve dinero real de billetera a billetera sin paso de revisión ni forma de deshacer. Eliminar o salir sí tiene confirmación. |
| 4 | Consistencia y estándares | 2 | La tarjeta de resumen usa `=== 0` y la tabla, medio centavo; "En paz y salvo" convive con "Al día"; dos cifras protagonistas. |
| 5 | Prevención de errores | 2 | Montos `type="number"` con "(sin puntos)" en el placeholder; "Eliminar" aparece junto a integrantes que deben. |
| 6 | Reconocer antes que recordar | 3 | Buenas ayudas con el disponible y vista previa de la división; el historial no dice quién participó en cada gasto. |
| 7 | Flexibilidad y eficiencia | 2 | Sin acción rápida para registrar un gasto: en el celular hay que bajar más allá de la tabla. Historial sin filtro ni agrupación. |
| 8 | Estética y diseño minimalista | 2 | Cuatro formularios abiertos a la vez, dos cifras en Display y todas las secciones con el mismo peso. |
| 9 | Recuperación de errores | 3 | Mensajes claros en español; pero si la recarga falla tras una acción exitosa, la página entera se reemplaza por el error. |
| 10 | Ayuda y documentación | 3 | Buenas ayudas en contexto; la regla "solo se elimina a quien está al día" aparece después de pulsar el botón. |
| **Total** | | **24/40** | **Aceptable**: honesta con las cifras, con problemas reales de jerarquía, confirmación y uso en el celular. |

### Veredicto de especificidad

**Revisión de diseño:** en el contenido es la pantalla más propia de SyncFund. La tabla
"Situación del proyecto" es un libro mayor de verdad: cifras tabulares, filete de 2px antes de
"Fondo disponible" y la nota "Igual a la suma de los saldos de todos los integrantes". Los saldos
llevan texto además de color ("A favor / Debe / Al día"), los pagos entre integrantes van neutros
y el gasto muestra la división ("≈ $X cada uno"). En la composición es genérica: todo apilado en
una columna con el mismo peso, como un panel de administración, no como "mi situación en este
grupo".

**Detector automático:** 0 hallazgos en la página y sus 9 componentes (salida `[]`, código 0).
Mismas limitaciones que en el Resumen.

### Impresión general

La lógica del dinero está muy bien contada; la página, no. El usuario viene a una de cuatro
cosas (ver si debe, registrar un gasto, aportar, pagar) y encuentra dos cifras grandes, una tabla,
cuatro formularios abiertos e integrantes con el mismo peso, en una página de unos 2.000px en
escritorio y de unos 7.400px en el celular. La mayor oportunidad es ordenarla por tareas: "tu
situación" como cifra protagonista, la acción que corresponde justo debajo y los formularios en
paneles.

### Lo que funciona

1. **El modelo de dinero está bien representado.** La tabla cuadra con el fondo; las notas
   "Recibió / Pagó $X" explican cada saldo; los abonos van neutros y los cobros se filtran para no
   duplicarse (`useSharedProjectDetail.ts:24-27`). Es "certeza sobre cada peso" en la práctica.
2. **Accesibilidad de base pensada.** Chips que son casillas reales con `role="group"`
   (`ParticipantChips.tsx`); tabla con `th scope` que en el celular se convierte en tarjetas con
   etiquetas (`ProjectStatusTable.css:147-216`); la confirmación de eliminar pone el foco en
   "Cancelar"; protección contra doble clic al pagar y eliminar.
3. **El sistema calcula y el usuario confirma.** El monto del pago viene sugerido y se valida
   contra lo que debe, el saldo a favor del otro y su billetera (`SettleDebtForm.tsx:51-55`); el
   gasto se valida contra el fondo antes de llegar al 422 del backend.

### Problemas prioritarios

#### [P1] Las cuadrículas de dos columnas no se apilan en el celular

- **Qué:** `SharedProjectDetailPage.tsx:63` y `:79` usan `gridTemplateColumns: '1fr 1fr'` en
  línea, sin punto de quiebre. En la captura del iPhone:
  - "Registrar gasto" y "Aportar" quedan lado a lado en columnas de unos 160px.
  - Los nombres de "Integrantes" se parten letra por letra ("Pru / eb / a A / (tú / )"), por el
    `overflow-wrap: anywhere` de `MembersList.css:26`.
  - El placeholder del correo se corta ("Correo con el que se reg").
  - Los chips y el botón "Registrar gasto" quedan comprimidos.
- **Por qué importa:** registrar un gasto en el momento es el uso principal en el celular, y un
  nombre ilegible en la lista donde se elimina gente es un riesgo real de equivocarse de persona.
  Es el mismo patrón que la meta y el colchón de la Billetera, y no depende de la cabecera.
- **Corrección:** clases CSS con una columna por defecto y dos desde unos 720px; quitar los
  estilos en línea y usar tokens de espaciado.
- **Comando sugerido:** `/impeccable adapt`, luego `/impeccable layout`.
- **¿Lo resuelve la dirección del rediseño?** **En parte.** Los formularios en hojas inferiores
  eliminan la cuadrícula de gasto y aporte; la de Integrantes y Agregar sigue necesitando apilarse.

#### [P1] La página no está ordenada por tareas

- **Qué:**
  - Orden actual: dos cifras grandes, tabla, gasto + aporte, integrantes + agregar, historial
    (`SharedProjectDetailPage.tsx:44-97`).
  - Dos cifras en Display del mismo tamaño ("$2.000" de fondo y "$2.000" de te deben,
    `ProjectSummaryCard.css:14-19`), contra la regla de una sola cifra protagonista.
  - "Pagar" solo existe como botón dentro de una fila de la tabla: quien debe no ve una
    invitación a pagar junto a su "Debes $X".
  - "Agregar integrante", tarea ocasional del administrador, pesa lo mismo que registrar un gasto.
- **Por qué importa:** el usuario tiene que revisar cuatro formularios y más de cuatro puntos de
  acción antes de entender su situación, y "quedar al día con un solo pago" (el objetivo del
  producto) no tiene un camino visible.
- **Corrección:** una cifra protagonista "Tu situación" ("Debes $X a B" / "Te deben $X") con el
  fondo como cifra secundaria; justo debajo la acción que corresponde ("Pagar $X a B" si debe) y
  "Registrar gasto" y "Aportar" como botones que abren paneles; luego la tabla y el historial;
  "Integrantes" al final o en una hoja propia, con "Agregar" solo para el administrador. Es el
  mismo criterio que el equipo propuso para el Resumen.
- **Comando sugerido:** `/impeccable layout`, luego `/impeccable distill`.
- **¿Lo resuelve la dirección del rediseño?** **En gran parte.** Los paneles y hojas inferiores
  sacan los formularios de la página; la jerarquía "tu situación + acción" y la cifra única hay
  que diseñarlas a propósito.

#### [P1] Los montos aceptan errores que cuestan dinero

- **Qué:** aporte, gasto y pago usan `type="number"` con "(sin puntos)" en el placeholder
  (`ContributionForm.tsx:61-64`, `ExpenseForm.tsx:100-103`, `SettleDebtForm.tsx:77-80`). Quien
  escribe "50.000" puede terminar con $50 o con un error de "obligatorio" que confunde. El aporte
  no muestra el monto formateado antes de confirmar. Es el mismo patrón de la Billetera, aquí con
  más riesgo.
- **Por qué importa:** aportar $50 cuando se querían $50.000 descuenta dinero de la billetera
  personal; es el peor error posible para "certeza sobre cada peso". Además, la rueda del ratón
  cambia el valor.
- **Corrección:** `type="text"` con `inputMode="numeric"`, aceptar puntos de miles y
  normalizarlos; mostrar en vivo "Vas a aportar $ 50.000 de tu billetera"; el formato en la ayuda
  del campo, no en el placeholder. Conviene resolverlo una vez en un componente de monto
  compartido por toda la app.
- **Comando sugerido:** `/impeccable harden`.
- **¿Lo resuelve la dirección del rediseño?** **No.**

#### [P1] Pagar una deuda no tiene revisión ni momento de cierre

- **Qué:** `SettleDebtForm` envía el pago directamente (`SettleDebtForm.tsx:61`); al terminar, la
  fila del formulario desaparece y la tabla se recarga sin mensaje ni indicador
  (`ProjectStatusTable.tsx:116-119`). El lector de pantalla no anuncia nada y el foco se pierde
  porque el formulario se desmonta. Si después falla la recarga, la página se reemplaza por el
  error (`SharedProjectDetailPage.tsx:31-42`) y el usuario no sabe si su pago quedó.
- **Por qué importa:** pagar es el punto emocional más alto: plata real que sale de su billetera
  hacia la de otra persona. Se pierde el alivio de "quedaste en paz".
- **Corrección:** en el formulario, un resumen explícito ("De tu billetera ($123.000) a la
  billetera de B · el fondo no cambia"); al terminar, un aviso con `role="status"` ("Le pagaste
  $23.500 a B. Quedaste al día."), resaltar la fila y devolver el foco al título de la sección; si
  la recarga falla después de una acción exitosa, conservar el mensaje de éxito y avisar que los
  datos podrían no estar al día.
- **Comando sugerido:** `/impeccable clarify`, luego `/impeccable delight`.
- **¿Lo resuelve la dirección del rediseño?** **En parte.** El panel da un contenedor con estado
  "listo", pero el éxito y el foco no están definidos en DESIGN.md.

#### [P2] Las reglas aparecen después del error y los umbrales no coinciden

- **Qué:**
  - `MembersList.tsx:30` muestra "Eliminar" junto a cualquier integrante que no sea el
    administrador, aunque la página ya tiene los saldos y sabe quién debe. La regla "solo al día"
    aparece en la confirmación (`RemoveMemberConfirm.tsx:50-53`) y luego llega el 422. "Salir del
    proyecto" tiene el mismo problema.
  - `ProjectSummaryCard.tsx:12-13` decide el estado con `> 0` y `=== 0`, mientras la tabla usa
    medio centavo (`ProjectStatusTable.tsx:15-25`). Un saldo de -0,003 (posible al dividir entre
    3) se muestra como "Debes $ 0" en la tarjeta y "Al día" en la tabla.
- **Por qué importa:** va contra el principio 4 de PRODUCT.md ("reglas visibles antes del
  error"). Eliminar a alguien es socialmente delicado, y que falle después de confirmar se siente
  como un error de la app. Dos estados distintos para el mismo saldo dañan la confianza.
- **Corrección:** pasar los saldos a `MembersList` y, si la persona debe, mostrar "Debe $X ·
  podrá salir cuando esté al día" en lugar del botón; usar el mismo umbral de medio centavo en
  la tarjeta, extraído a una utilidad compartida.
- **Comando sugerido:** `/impeccable clarify`, luego `/impeccable harden`.
- **¿Lo resuelve la dirección del rediseño?** **No.**

### Qué resuelve la dirección del rediseño

| Problema | Menú lateral · barra inferior · hojas |
|---|---|
| [P1] Cuadrículas que no se apilan | En parte (gasto y aporte sí; integrantes no) |
| [P1] Página no ordenada por tareas | En gran parte (falta diseñar "tu situación + acción") |
| [P1] Montos que aceptan errores | No |
| [P1] Pago sin revisión ni cierre | En parte |
| [P2] Reglas tardías y umbrales distintos | No |

### Problemas ya documentados que también aparecen aquí

- **Navegación móvil rota** ([P0] del Resumen): en la captura del iPhone la página se aleja y hay
  desborde horizontal.
- **Accesibilidad estructural** ([P2] del Resumen): empieza en `h2` con el nombre del proyecto
  (`SharedProjectDetailPage.tsx:44`), `lang="en"`, título genérico, sin enlace para saltar.
- **Brechas de contraste** (DESIGN.md): `gain-500` en "A favor" y "Te deben", `loss-500` en los
  gastos del historial, `ink-faint` en "Administrador", "Recibió / Pagó", fechas y notas.
- **Filas del historial frágiles** ([P1] de la Billetera): es el mismo `TransactionList`.
- **Guardar sin confirmación** ([P2] de la Billetera): aquí en gasto y aporte; el pago tiene su
  propio problema arriba.

### Señales de alerta por persona

- **Usuario distraído en el celular:**
  - Tiene que bajar más allá de la tabla para registrar un gasto.
  - Objetivos táctiles chicos: "Eliminar" mide unos 30px de alto (`MembersList.css`), "Quitar a
    todos" unos 24px (`ParticipantChips.css`).
  - Puede escribir "50.000" en un campo numérico y no recibe confirmación al guardar.
- **Primera vez:**
  - Un proyecto recién creado muestra una tabla con una fila en $0, cuatro formularios y
    "Todavía no hay movimientos registrados", sin guía.
  - Nada le dice "primero aporta, luego registra gastos", ni explica "su parte de los gastos".
- **Usuario de lector de pantalla o teclado:**
  - Ningún anuncio de éxito; el foco se pierde al cerrarse el pago o la confirmación.
  - La vista previa de la división sí tiene `aria-live`, pero los totales de la tabla no se
    anuncian al cambiar.
  - En el celular, el pie de la tabla genera una etiqueta "Fondo" redundante junto a "Fondo
    disponible".
- **Estudiante que comparte arriendo** (persona de PRODUCT.md):
  - En el historial, "Aporte al fondo" aparece tres veces sin decir quién aportó, y los gastos no
    dicen entre quiénes se dividieron.
  - Ese dato ya llega en `involvedIdsList`, así que se puede mostrar "Aporte de B" o "Entre 3 ·
    $X c/u" sin tocar el backend. Quien comparte arriendo con alguien que no paga necesita esa
    trazabilidad para sostener la conversación incómoda.

### Observaciones menores

- En el celular, la fila "Saldo" de la tabla reparte tres elementos con `space-between` y el
  saldo queda flotando en el centro (`ProjectStatusTable.css:178-182`).
- "Para quedar al día" usa viñetas genéricas y no pone un botón de pago junto a la sugerencia
  propia.
- "Aportar" y "Agregar" en variante fantasma pesan casi lo mismo que un campo vacío;
  "Registrar gasto" es el único botón principal, lo cual está bien.
- El hover del botón de peligro solo cambia el borde a tinta (`Button.css:37-39`) y casi no se
  nota.
- Tamaños de `h3` en línea inconsistentes: 1rem en los formularios y 1.125rem en las secciones.
- La tabla de escritorio con 8 integrantes o más y montos de 9 cifras no está probada.
- El historial no tiene hora ni se agrupa por día ni se pagina.

### Preguntas para el equipo

1. ¿Cuál es la tarea número uno de esta pantalla en el celular: registrar un gasto, o revisar y
   pagar lo que debo? Eso define qué acción va justo debajo de la cifra principal.
2. ¿La cifra protagonista debe ser "Tu situación" (debes o te deben) y el fondo pasar a cifra
   secundaria, como pide la regla de una sola cifra y como se propuso para el Resumen?
3. ¿"Integrantes" y "Agregar integrante" pueden ir a una hoja aparte ("Ajustes del proyecto"),
   separados del flujo de dinero, teniendo en cuenta el flujo de invitación con aceptación que
   está pendiente?
4. ¿Se acepta que el historial muestre quién aportó y entre quiénes se dividió cada gasto a partir
   de `involvedIdsList` (solo frontend), y que el pago tenga un paso de revisión y un aviso de
   éxito?

---

## Categorías

- **Archivo:** `src/pages/CategoriesPage.tsx` (ruta `/categories`), con `CategoryForm` y
  `CategoryList`.
- **Fecha:** 2026-11-13 · rama `docs/diagnostico-diseno`.
- **Evidencia:** código fuente, capturas de página completa en
  `docs/diseno/capturas-antes/` (`localhost_5173_categories.png` y
  `localhost_5173_categories(iPhone 16).png`) y el detector de impeccable.
- **Modo de la pantalla:** Operate.

### Puntaje de heurísticas (Nielsen)

| # | Heurística | Nota | Problema clave |
|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 2 | "Este mes" no dice qué mes, y el mes se calcula en UTC. Crear una categoría no confirma nada. |
| 2 | Coincidencia con el mundo real | 2 | El campo "sin puntos" choca con cómo se escriben cifras en Colombia (300.000); "$0 / $2.000.000" no dice "te quedan $X". |
| 3 | Control y libertad | 1 | No se puede editar ni eliminar una categoría: un límite mal escrito queda para siempre. |
| 4 | Consistencia y estándares | 3 | Usa bien `Input`, `Button`, `LoadError` y `LoadingState`; la barra pasa de azul a terracota sin el estado intermedio en ámbar que el sistema reserva. |
| 5 | Prevención de errores | 2 | Acepta un límite de 0 sin explicar qué significa; la instrucción del formato vive en el placeholder. |
| 6 | Reconocer antes que recordar | 2 | No muestra porcentaje ni lo que queda disponible. |
| 7 | Flexibilidad y eficiencia | 1 | Sin orden por "más cerca del límite", sin filtro y sin acceso a los movimientos de la categoría. |
| 8 | Estética y diseño minimalista | 3 | Sobria y limpia, pero crear pesa más que consultar. |
| 9 | Recuperación de errores | 2 | `LoadError` bien resuelto; "Presupuesto excedido este mes" no dice por cuánto ni qué hacer. |
| 10 | Ayuda y documentación | 2 | El subtítulo aclara que solo cuenta la billetera personal; no explica qué pasa al superar el límite. |
| **Total** | | **20/40** | **Aceptable con fallas importantes** (límite inferior). |

### Veredicto de especificidad

**Revisión de diseño:** genérica, con las bases del sistema (Fraunces en el título, papel cálido,
números tabulares, fila con línea fina). La página es "formulario arriba, lista abajo", sin cifra
protagonista (cuánto se ha gastado este mes frente al presupuesto total) y sin el nombre del mes.
La barra de presupuesto, que debería ser la firma de la pantalla, es su pieza más débil, y el
ámbar `warn-500` reservado para las alertas de presupuesto no se usa.

**Detector automático:** 0 hallazgos en la página, `CategoryForm` y `CategoryList` (salida `[]`,
código 0). Mismas limitaciones que en el Resumen: el contraste de la barra no se pudo evaluar
automáticamente.

### Impresión general

La pantalla responde a medias "¿cómo voy este mes?": muestra gastado y límite, pero obliga a
restar, no avisa antes de pasarse y, la noche del último día del mes, muestra $0 en todo. Además
no deja corregir un límite mal escrito. La mayor oportunidad es convertir la barra en un
indicador claro de tres estados (con texto) bajo una cifra del mes, con las categorías más
comprometidas primero.

### Lo que funciona

1. **Estados de carga bien pensados.** `categories === null` distingue "cargando" de "vacío" y
   con error no se muestra una lista vieja (`CategoriesPage.tsx:14-26`).
2. **Formulario accesible en lo básico.** Etiquetas asociadas, `aria-invalid`,
   `aria-describedby`, errores en `loss-700` (cumple AA) y validación previa en español
   (`CategoryForm.tsx:18-24`).
3. **Honestidad sobre qué se mide.** `formatCOP` y números tabulares en las cifras, filas con
   línea fina y un subtítulo que aclara "en tu billetera personal".

### Problemas prioritarios

#### [P1] La barra de presupuesto no se ve, depende solo del color y no tiene semántica

- **Qué:**
  - El carril `ledger-100` sobre el fondo `ledger-50` da cerca de 1,1:1: en las capturas, una
    categoría en $0 parece una línea en blanco.
  - El relleno mide 6px (`CategoryList.css:35-39`) y es un `div` sin `role="progressbar"` ni
    valores accesibles (`CategoryList.tsx:22-30`).
  - Solo hay dos estados, azul o terracota: no hay aviso de "cerca del límite".
  - La barra se corta en 100% (`CategoryList.tsx:13`): "excedido por $1.000" se ve igual que
    "excedido por $1.000.000".
  - La alerta va en `loss-500` a 12px (`CategoryList.css:47-52`), 3,8:1: no cumple AA para texto
    pequeño.
- **Por qué importa:** es la única visualización de la página y la razón de que existan los
  límites. Incumple WCAG 1.4.11 (contraste de elementos no textuales) y 1.3.1, y un lector de
  pantalla oye "Compras de Bitcoin $0 / $2.000.000" sin porcentaje ni estado.
- **Corrección:**
  - Carril con borde `hairline` o un tono que llegue a 3:1, y altura de 8 a 10px.
  - `role="progressbar"` con valores y un texto accesible ("$1.250.000 de $2.000.000, 62%").
  - Tres estados con texto, no solo color: "Te quedan $X" en tinta; "Cerca del límite" desde un
    umbral (por ejemplo, 80%) en ámbar, con un tono oscuro nuevo para texto que cumpla AA; y
    "Excedido por $X" en `loss-700`.
- **Comando sugerido:** `/impeccable colorize`, luego `/impeccable harden`.
- **¿Lo resuelve la dirección del rediseño?** **No.**

#### [P1] El mes se calcula en UTC y nunca se nombra

- **Qué:** `new Date().toISOString().slice(0, 7)` (`useCategories.ts:16`) usa UTC. En Colombia
  (UTC−5), desde las 7:00 p. m. del último día del mes la página consulta el mes siguiente y
  muestra $0 en todas las categorías. La interfaz solo dice "Gasto de este mes"
  (`CategoriesPage.tsx:33`), sin decir cuál.
- **Por qué importa:** es un error de certeza en una app cuyo principio es "certeza sobre cada
  peso". El estudiante que revisa su presupuesto la noche del 30 ve que "no ha gastado nada", y
  sin el nombre del mes no puede notar el error.
- **Corrección:** calcular el mes con la fecha local y escribirlo en la cabecera ("Noviembre
  2026"); más adelante, permitir consultar meses anteriores.
- **Comando sugerido:** `/impeccable harden`, luego `/impeccable clarify`.
- **¿Lo resuelve la dirección del rediseño?** **No.**

#### [P1] No se pueden corregir ni eliminar categorías

- **Qué:** la interfaz solo permite crear y `categoryService.ts` solo tiene crear y consultar; las
  filas no son interactivas.
- **Por qué importa:** un límite mal escrito no se puede arreglar, y con un campo "sin puntos" es
  fácil escribir 300 en vez de 300.000. También impide ajustar el presupuesto cada mes.
- **Corrección:** abrir la edición de nombre y límite desde la fila, en panel u hoja inferior. Si
  el diseño UML y el backend no lo contemplan, proponerlo al equipo (regla 1 de CLAUDE.md).
  Mientras tanto, confirmar el límite antes de crear ("Límite: $300 al mes. ¿Correcto?").
- **Comando sugerido:** `/impeccable shape`.
- **¿Lo resuelve la dirección del rediseño?** **En parte.** El panel u hoja da el lugar para
  editar; falta la capacidad en el backend.

#### [P2] Sin cifra protagonista ni orden en la lista

- **Qué:** no hay un total del mes ni una cifra destacada, contra la regla de una sola cifra
  protagonista, y la lista sigue el orden del backend, sin criterio visible. El formulario
  siempre abierto encima de la lista es el mismo problema de Proyectos compartidos (ver allí).
- **Por qué importa:** la respuesta a "¿cómo voy este mes?" no está a la vista; con 15 categorías
  o más, el usuario tiene que recorrerlas todas para encontrar las que se pasaron.
- **Corrección:** cabecera de la hoja con la cifra en Fraunces ("Gastado en noviembre: $X de $Y
  presupuestado") y la lista ordenada por porcentaje de uso (primero las excedidas y las cercanas
  al límite).
- **Comando sugerido:** `/impeccable layout`, luego `/impeccable distill`.
- **¿Lo resuelve la dirección del rediseño?** **En parte.** El formulario en panel sí; la cifra
  del mes y el orden, no.

#### [P2] Casos límite sin definir

- **Qué:**
  - Se acepta un límite de 0 y entonces el porcentaje es 0 (`CategoryList.tsx:13`): si el backend
    marca la categoría como excedida, aparece "Presupuesto excedido" con la barra vacía.
  - La cabecera de la fila usa `space-between` sin `gap` ni `min-width: 0`
    (`CategoryList.css:16-20`): un nombre largo se pega a la cifra o la parte en dos líneas.
  - El estado vacío usa `ink-faint` y no orienta ("Crea tu primera categoría para ponerle tope
    a…").
  - El campo del límite tiene el mismo problema de montos del Detalle del proyecto (ver allí).
- **Por qué importa:** la configuración falla en silencio y, sin edición, el error es
  permanente.
- **Corrección:** definir qué significa un límite de 0 ("sin límite" o "nada permitido") y
  mostrarlo así; `gap` y `white-space: nowrap` en las cifras; estado vacío con guía en
  `ink-muted`; confirmación de éxito con `role="status"`.
- **Comando sugerido:** `/impeccable harden`, luego `/impeccable clarify`.
- **¿Lo resuelve la dirección del rediseño?** **No.**

### Qué resuelve la dirección del rediseño

| Problema | Menú lateral · barra inferior · hojas |
|---|---|
| [P1] Barra invisible y sin semántica | No |
| [P1] Mes en UTC y sin nombre | No |
| [P1] Sin edición ni eliminación | En parte (da el lugar, falta el backend) |
| [P2] Sin cifra protagonista ni orden | En parte (el formulario sí; la cifra y el orden no) |
| [P2] Casos límite sin definir | No |

### Problemas ya documentados que también aparecen aquí

- **Navegación móvil rota** ([P0] del Resumen): desborde horizontal y página alejada en la
  captura del iPhone.
- **Accesibilidad estructural** ([P2] del Resumen): empieza en `h2` (`CategoriesPage.tsx:31`),
  `lang="en"`, título genérico, sin enlace para saltar.
- **Brechas de contraste** (DESIGN.md): `ink-faint` en el límite "/ $2.000.000", el estado vacío
  y los placeholders; `loss-500` en la alerta; `warn-500` sin usar.
- **Formulario que desplaza a la lista** ([P1] de Proyectos compartidos).
- **Montos que aceptan errores** ([P1] del Detalle del proyecto).
- **Guardar sin confirmación** ([P2] de la Billetera).

### Señales de alerta por persona

- **Usuario distraído en el celular:** tiene que pasar todo el formulario para ver su situación;
  no ve un total ni el mes, y la barra no se distingue.
- **Primera vez:** no sabe qué es el "límite mensual" ni qué pasa al superarlo; si se equivoca en
  el límite, no puede corregirlo; el estado vacío no le dice qué hacer.
- **Usuario de lector de pantalla o teclado:** la barra no tiene semántica ni porcentaje; la
  alerta de exceso no es una región que se anuncie; crear una categoría no anuncia el éxito.
- **Estudiante** (persona de PRODUCT.md): quiere saber "¿cuánto me queda para salidas hasta fin
  de mes?"; la página le da "gastado / límite" y le toca restar, no hay aviso antes de pasarse y
  la noche del 30 ve $0 en todo.

### Observaciones menores

- Cada carga hace 2N+2 peticiones (billetera, categorías y dos por categoría,
  `useCategories.ts:12-30`), y si una falla, falla toda la página. Con muchas categorías y datos
  móviles es lento; lo ideal sería una respuesta que traiga todo junto.
- El exceso se consulta al backend por categoría, pero el porcentaje se calcula en el cliente:
  las dos fuentes pueden discrepar (el caso del límite 0).
- Estilos en línea con espaciados sueltos (`CategoriesPage.tsx:32,36`, `CategoryForm.tsx:40-41`).
- La transición de ancho de la barra no se anula con `prefers-reduced-motion` en
  `CategoryList.css` (la regla global de `globals.css` sí la reduce, así que el efecto real es
  menor).

### Preguntas para el equipo

1. ¿El diseño UML de Category permite editar o eliminar (nombre y límite mensual)? Si no, ¿se
   propone, dado que hoy un error de digitación es permanente?
2. ¿Qué significa un límite de 0: "sin presupuesto" o "no gastar nada"? ¿Qué debe responder el
   backend en ese caso?
3. ¿Se usa el ámbar para un estado "cerca del límite" (por ejemplo, desde el 80%)? ¿Se crea un
   tono oscuro de ámbar para texto que cumpla AA?
4. ¿Se puede agregar una respuesta que traiga todas las categorías con su gasto del mes en una
   sola llamada (un DTO de transporte, permitido por la regla 1), para evitar las 2N+2
   peticiones?

---

## Login

- **Archivo:** `src/pages/LoginPage.tsx` (ruta `/login`), dentro de
  `src/components/layout/AuthLayout.tsx`, con `Input`, `Button`, `FormError` y `FieldError`.
- **Fecha:** 2026-11-13 · rama `docs/diagnostico-diseno`.
- **Evidencia:** código fuente, capturas de página completa en
  `docs/diseno/capturas-antes/` (`localhost_5173_login.png` y
  `localhost_5173_login(iPhone 16).png`) y el detector de impeccable.
- **Modo de la pantalla:** Operate (entrar rápido), con un papel ligero de Persuade para quien
  llega por primera vez.
- **Límite de la evidencia:** la captura de escritorio mide unos 663px de ancho, menos que el
  punto de quiebre de 860px, así que muestra el diseño apilado y no la pantalla dividida. La
  versión dividida se evaluó solo por código.
- **Alcance compartido:** los problemas marcados **[AuthLayout]** o **[Input]** afectan también
  al Registro (y los de `Input`, a todos los formularios de la app).

### Puntaje de heurísticas (Nielsen)

| # | Heurística | Nota | Problema clave |
|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 2 | "Procesando..." genérico y botón a media opacidad; sin `aria-busy` y los campos siguen editables. |
| 2 | Coincidencia con el mundo real | 3 | Español claro, pero "Credenciales inválidas" es jerga y "sincronizados al instante" exagera. |
| 3 | Control y libertad | 2 | No se puede mostrar la contraseña ni recuperarla; quien ya inició sesión ve el formulario igual. |
| 4 | Consistencia y estándares | 3 | El `h1` es el eslogan (dentro de un `aside`) y "Inicia sesión" es `h2`; estilos en línea y hex sueltos. |
| 5 | Prevención de errores | 2 | Sin `autoComplete`, sin mostrar contraseña y con bordes de campo casi invisibles. |
| 6 | Reconocer antes que recordar | 3 | Etiquetas visibles y persistentes; los gestores de contraseñas quedan a la suerte del navegador. |
| 7 | Flexibilidad y eficiencia | 2 | En el celular, quien vuelve recorre el panel de marca cada vez. |
| 8 | Estética y diseño minimalista | 3 | Sobrio y limpio; en el celular, el 41% del alto es material de marca. |
| 9 | Recuperación de errores | 2 | Buen foco al primer error y `role="alert"`; "Credenciales inválidas" no orienta y no hay salida si se olvidó la contraseña. |
| 10 | Ayuda y documentación | 1 | No hay "¿Olvidaste tu contraseña?" ni un texto de contacto. |
| **Total** | | **23/40** | **Aceptable, necesita trabajo.** |

### Veredicto de especificidad

**Revisión de diseño:** propio en el panel de marca, genérico en el formulario. El titular "Dos
cuentas, un solo saldo real.", Fraunces sobre azul tinta y los dos círculos como metáfora de las
dos cuentas tienen voz de autor. El formulario es una plantilla de autenticación estándar, y en
el celular todo se reduce al patrón "banner + formulario" de cualquier landing, con el motivo
tapando el texto.

**Detector automático:** 0 hallazgos en la página, `AuthLayout` y los componentes de formulario
(salida `[]`, código 0). El propio detector advirtió que con `.tsx` solo usa reglas por patrón:
los bordes casi invisibles de los campos no los podía detectar.

**Cuánto aplica la dirección del rediseño:** casi nada. El menú lateral y la barra inferior no
aplican a las pantallas de acceso, que no deben tener navegación. Las hojas aplican a medias (el
formulario podría ir en una hoja blanca). Sí aplican las reglas de tokens, las correcciones de
contraste y los cambios al componente `Input`.

### Impresión general

Un login correcto, con un buen momento de marca que en el celular se vuelve un obstáculo: el
estudiante que vuelve a registrar un gasto tiene que pasar el eslogan para llegar a "Entrar", y
luego escribe la contraseña a ciegas en campos que casi no se ven. La mayor oportunidad es
compactar la marca en el celular y hacer que el ingreso sea rápido y seguro (autocompletado,
mostrar contraseña, foco visible).

### Lo que funciona

1. **Campos accesibles bien armados.** `label` real, `aria-invalid` y `aria-describedby`
   (`Input.tsx:25-31`), foco al primer error (`useFormErrors.ts:16-19`), `role="alert"` y
   mensajes en español iguales a los del backend.
2. **Medidas correctas para el celular.** Campos a 1rem (iOS no hace zoom), teclado de correo con
   `type="email"`, campos y botón de unos 44px y botón a todo el ancho.
3. **Un momento de marca con intención** y una sola acción principal: dos campos, carga cognitiva
   mínima.

### Problemas prioritarios

#### [P1] [AuthLayout] En el celular, el panel de marca empuja el formulario y el motivo tapa el texto

- **Qué:** por debajo de 860px el panel conserva el titular a 2rem, el párrafo completo y
  `min-height: 240px` (`AuthLayout.css:60-70`); en el iPhone 16 ocupa unos 351px de 852.
  - "Entrar" queda hacia los 700–742px, en el borde del área visible con las barras de Safari, y
    queda oculto con el teclado abierto.
  - El SVG (`AuthLayout.css:39-45`, 220px fijos) se monta sobre el párrafo: el círculo esmeralda
    corta "mismo" e "instante", el azul corta "proyectos en un".
- **Por qué importa:** el uso principal es volver desde el celular a registrar un gasto. Leer el
  eslogan en cada visita es fricción pura; la persuasión solo cuenta en la primera visita.
- **Corrección:** por debajo de 860px, una franja compacta de 120–160px (marca y titular a unos
  1.5rem), el párrafo oculto o debajo del formulario, el motivo más chico y sin cruzar el texto,
  y `min-height: 100dvh` en vez de `100vh`. Objetivo: "Entrar" visible sin desplazar en un
  teléfono de 667px de alto.
- **Comando sugerido:** `/impeccable layout`, luego `/impeccable adapt`.
- **¿Lo resuelve la dirección del rediseño?** **No.** La dirección es para la app autenticada y
  DESIGN.md solo dice que el panel "se apila".

#### [P1] El ingreso no apoya a los gestores de contraseñas ni al teclado táctil

- **Qué:** los campos no tienen `autoComplete="email"` ni `autoComplete="current-password"`
  (`LoginPage.tsx:47-71`; no hay ningún `autoComplete` en todo `src`), y no hay botón para
  mostrar u ocultar la contraseña.
- **Por qué importa:** escribir la contraseña a ciegas en un teclado táctil es la causa más común
  de "Credenciales inválidas"; sin los atributos, el autollenado y el guardado dependen de cada
  navegador.
- **Corrección:** agregar los atributos (`Input` ya los reenvía) y un botón "Mostrar / Ocultar"
  dentro del campo, de unos 44px, con `aria-pressed` y texto visible, como opción de `Input` o
  un `PasswordInput` propio del frontend (lo usaría también el Registro).
- **Comando sugerido:** `/impeccable harden`.
- **¿Lo resuelve la dirección del rediseño?** **No.**

#### [P1] [Input] Bordes de campo casi invisibles y foco débil

- **Qué:**
  - El borde `hairline` (#DEDAD0) sobre blanco da 1,4:1 (`Input.css:18`); WCAG 1.4.11 pide 3:1
    para identificar el control. En las dos capturas los campos casi se funden con el fondo.
  - `.sf-field__input:focus { outline: none }` (`Input.css:24-27`) anula el anillo de foco global
    (`globals.css:80-83`); el único indicador es el cambio de 1px del borde a azul acero.
  - Con error, el estado enfocado es igual al no enfocado (`Input.css:34-38`): cuando el foco
    salta al primer error, el usuario de teclado no ve dónde quedó.
- **Por qué importa:** WCAG 2.1 AA es compromiso del producto, y este componente lo usan todos los
  formularios de la app (billetera, proyectos, categorías, registro).
- **Corrección:** un token nuevo `--field-border` de al menos 3:1 sobre blanco en `globals.css` y
  `theme.ts` (`ink-faint` da 3,5:1 sobre blanco); anillo de foco visible con `:focus-visible`,
  también en estado de error.
- **Comando sugerido:** `/impeccable harden`, luego `/impeccable audit` sobre los demás
  formularios.
- **¿Lo resuelve la dirección del rediseño?** **En parte.** El rediseño tocará los componentes,
  pero no menciona este problema; si no se pide de forma explícita, se arrastra.

#### [P2] Los estados de envío y error no orientan

- **Qué:**
  - Al enviar, el botón cambia a "Procesando..." y queda desactivado (`Button.tsx:14,17`): pierde
    el foco y el lector de pantalla no anuncia nada; el formulario no tiene `aria-busy`.
  - El backend responde 422 "Credenciales inválidas" y se muestra tal cual, sin decir qué hacer.
  - Sin conexión: "No se pudo conectar con el servidor." (`LoginPage.tsx:34`), distinto del texto
    del resto de la app ("No pudimos conectar con SyncFund…", `apiError.ts:52`).
- **Por qué importa:** es el momento de más ansiedad ("¿perdí acceso a mi plata?"), y con un
  backend que puede tardar en arrancar, una espera sin explicación parece un cuelgue.
- **Corrección:** "Entrando…" con `aria-busy` en el formulario; mostrar el 422 como "Correo o
  contraseña incorrectos. Revisa los dos e inténtalo de nuevo." (conserva la decisión de no
  distinguir los dos casos); unificar el texto de conexión; mientras no exista recuperación de
  contraseña, decir con honestidad qué hacer si se olvidó.
- **Comando sugerido:** `/impeccable clarify`.
- **¿Lo resuelve la dirección del rediseño?** **No.**

#### [P2] [AuthLayout] El texto promete más de lo real y el motivo choca con DESIGN.md

- **Qué:**
  - "sincronizados al instante" (`AuthLayout.tsx:19`) contradice PRODUCT.md (los datos se
    actualizan por consulta periódica, no en tiempo real) y el principio "certeza sobre cada
    peso".
  - El círculo esmeralda del motivo es `gain-500` como adorno; la Money-Only Color Rule de
    DESIGN.md lo prohíbe, mientras la sección Shapes del mismo documento lo describe como el
    único motivo gráfico. DESIGN.md se contradice.
  - Los hex sueltos (`#C7D2DF` en `AuthLayout.css:35` y los trazos del SVG) ya estaban
    identificados al documentar el sistema.
- **Por qué importa:** es la primera promesa que lee quien llega; si después ve saldos que tardan
  en actualizarse, la promesa se rompe. Y la contradicción del documento hará que el rediseño
  aplique la regla de forma inconsistente.
- **Corrección:** cambiar el texto (por ejemplo, "…en un mismo lugar, con el saldo de cada uno
  siempre a la vista"); decidir en equipo si el motivo es una excepción documentada a la regla o
  si el esmeralda pasa a un tono de tinta; en los dos casos, trazos con variables y un token para
  el texto secundario sobre azul tinta.
- **Comando sugerido:** `/impeccable clarify`, luego `/impeccable polish`.
- **¿Lo resuelve la dirección del rediseño?** **No.**

### Qué resuelve la dirección del rediseño

| Problema | Menú lateral · barra inferior · hojas |
|---|---|
| [P1] Panel de marca empuja el formulario en el celular | No (la dirección no aplica a las pantallas de acceso) |
| [P1] Sin autocompletado ni mostrar contraseña | No |
| [P1] Bordes invisibles y foco débil en `Input` | En parte (si se exige al rehacer los componentes) |
| [P2] Estados de envío y error | No |
| [P2] Texto de marca y contradicción de DESIGN.md | No |

### Problemas ya documentados que también aparecen aquí

- **Accesibilidad estructural** ([P2] del Resumen): `lang="en"`, título "syncfund-frontend" en vez
  de "Iniciar sesión · SyncFund", sin enlace para saltar (aquí pesa menos, pero el panel de marca
  va primero).
- **Brechas de contraste** (DESIGN.md): `ink-faint` en el placeholder "nombre@correo.com".
- **Hex sueltos en `AuthLayout`**: identificados al documentar el sistema visual.
- La navegación móvil rota del Resumen **no** aplica: las pantallas de acceso no tienen cabecera.

### Señales de alerta por persona

- **Usuario distraído en el celular:** en la mayoría de teléfonos tiene que desplazarse para
  llegar a "Entrar"; con el teclado abierto no ve el botón; escribe la contraseña sin poder verla
  y "Credenciales inválidas" no le dice qué revisar.
- **Primera vez:** el titular comunica bien la propuesta; "Regístrate" es un enlace pequeño al
  final.
- **Usuario de lector de pantalla o teclado:** el primer `h1` que oye es el eslogan dentro de un
  `aside`; al enviar, el foco se pierde porque el botón se desactiva; en estado de error, el foco
  no se ve. El orden de tabulación sí es correcto (Correo → Contraseña → Entrar → Regístrate).
- **Usuario de gestor de contraseñas:** sin atributos de autocompletado, llenar y guardar depende
  del navegador.

### Observaciones menores

- Estilos en línea en `LoginPage.tsx:43` y `:75`; conviene una clase con tokens compartida con
  el Registro.
- El enlace "Regístrate" mide unos 20px de alto: cumple AA, pero conviene ampliar el área táctil.
- Quien ya inició sesión y entra a `/login` ve el formulario, y `/` siempre lleva a `/login`
  (`AppRouter.tsx:15`): debería ir a `/dashboard` si hay sesión.
- El placeholder del correo sobra: basta la etiqueta.
- Falta una captura de escritorio real (1280px o más) para evaluar la pantalla dividida.

### Preguntas para el equipo

1. ¿Habrá recuperación de contraseña? Si no, ¿qué se le dice a quien la olvidó?
2. En el celular, ¿se acepta reducir el panel de marca a una franja compacta, o incluso mostrarlo
   solo en el Registro y dejar el login enfocado en entrar rápido?
3. ¿El círculo esmeralda del motivo es una excepción deliberada a la Money-Only Color Rule, o pasa
   a un tono de tinta? DESIGN.md hoy dice las dos cosas y hay que corregirlo.
4. ¿Se aprueba crear un `PasswordInput` (mostrar u ocultar) y un token `--field-border` de al
   menos 3:1? Los dos afectan también al Registro y a los demás formularios.

---

## Registro

- **Archivo:** `src/pages/RegisterPage.tsx` (ruta `/register`), dentro de `AuthLayout`, con los
  mismos componentes de formulario que el Login.
- **Fecha:** 2026-11-13 · rama `docs/diagnostico-diseno`.
- **Evidencia:** código fuente (incluida la validación del backend en
  `demo/src/main/java/com/syncfund/application/dto/request/RegisterUserRequest.java`), capturas
  de página completa en `docs/diseno/capturas-antes/` (`localhost_5173_register.png` y
  `localhost_5173_register(iPhone 16).png`) y el detector de impeccable.
- **Modo de la pantalla:** Operate (crear la cuenta), con papel de primera impresión.
- **Alcance:** lo que es de `AuthLayout` o de los componentes de formulario ya se analizó en el
  Login; aquí solo se referencia.

### Puntaje de heurísticas (Nielsen)

| # | Heurística | Nota | Problema clave |
|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 3 | Carga en el botón y errores por campo con foco al primero; tras crear la cuenta, salta a `/dashboard` sin ninguna confirmación. |
| 2 | Coincidencia con el mundo real | 3 | Español claro y tuteo; "billetera personal" aparece sin explicar. |
| 3 | Control y libertad | 3 | Enlace al login presente; no se puede mostrar la contraseña para revisarla. |
| 4 | Consistencia y estándares | 2 | Sin `autoComplete`; la regla de contraseña vive solo en el placeholder; estilos en línea. |
| 5 | Prevención de errores | 2 | Sin mostrar contraseña ni confirmación; la regla desaparece al escribir; sin límites de longitud coherentes con la base de datos. |
| 6 | Reconocer antes que recordar | 2 | "Mínimo 6 caracteres" deja de verse con la primera letra (`RegisterPage.tsx:80`). |
| 7 | Flexibilidad y eficiencia | 1 | Sin `autoComplete="new-password"`, los gestores no proponen ni guardan una contraseña de forma fiable; nombre y correo se escriben a mano. |
| 8 | Estética y diseño minimalista | 3 | Limpio y sobrio, acorde con el libro mayor. |
| 9 | Recuperación de errores | 2 | El correo duplicado (422) aparece como error general, lejos del campo Correo, y no ofrece iniciar sesión. |
| 10 | Ayuda y documentación | 2 | Nada sobre qué pasa después ni sobre el tratamiento de datos. |
| **Total** | | **23/40** | **Aceptable, funcional con fricción** (parte baja del rango típico). |

### Veredicto de especificidad

**Revisión de diseño:** genérica. Lo único propio de SyncFund es una frase: "Te creamos tu
billetera personal automáticamente." (`RegisterPage.tsx:47-49`). El resto es el formulario
estándar de nombre, correo, contraseña, botón y enlace al login, sobre el mismo `AuthLayout`. Es
coherente con el sistema visual, pero no cuenta nada del producto (billetera y proyectos
compartidos) ni prepara el primer paso.

**Detector automático:** 0 hallazgos en la página, `AuthLayout` y los componentes de formulario
(salida `[]`, código 0). Mismas limitaciones que en el Resumen.

**Cuánto aplica la dirección del rediseño:** como en el Login, casi nada; lo que sí aplica es la
parte que afecta al Resumen, donde debería caer el primer paso de una cuenta nueva.

### Impresión general

El registro hace lo esencial bien: valida igual que el backend, inicia sesión al terminar y crea
la billetera sola. Falla en los dos extremos del recorrido: al crear la contraseña (sin apoyo del
gestor, con la regla escondida) y justo después de crear la cuenta, cuando el usuario aterriza en
un Resumen vacío sin bienvenida ni siguiente paso. La mayor oportunidad es aprovechar ese momento
de máxima intención para guiar el primer movimiento o el primer proyecto.

### Lo que funciona

1. **La validación del frontend replica la del backend.** Mismos mensajes en español: obligatorio,
   formato de correo y mínimo 6 caracteres (`utils/validation.ts:20-28` frente a
   `RegisterUserRequest.java:11-19`); los 400 del backend se asignan a cada campo.
2. **Errores accesibles.** Validación propia con `noValidate`, foco al primer campo con error,
   `aria-invalid` y `aria-describedby`; el error de un campo se borra al escribir.
3. **El registro deja la sesión iniciada.** No hay que volver a escribir las credenciales, y el
   subtítulo anticipa el beneficio (la billetera se crea sola).

### Problemas prioritarios

#### [P1] La contraseña nueva no tiene apoyo y su regla se esconde

- **Qué:** ningún campo declara `autoComplete` (`name`, `email`, `new-password`), la regla
  "Mínimo 6 caracteres" está solo en el placeholder (`RegisterPage.tsx:80`) y no hay mostrar
  contraseña ni confirmación. La falta general de autocompletado y de "mostrar contraseña" es la
  misma del Login (ver allí); lo propio del registro es `new-password` y la regla.
- **Por qué importa:** sin `new-password`, iOS y Android no sugieren una contraseña fuerte ni
  ofrecen guardarla, y como no hay recuperación de contraseña, una clave débil u olvidada deja al
  usuario fuera. La regla desaparece al teclear y un lector de pantalla no la anuncia, porque no
  está en `aria-describedby`.
- **Corrección:** `autoComplete="name"`, `autoComplete="email"` (con `inputMode="email"`,
  `autoCapitalize="none"` y `spellCheck={false}`) y `autoComplete="new-password"`; mover la regla a
  la ayuda del campo (`hint`, que `Input` ya enlaza en `aria-describedby`); preferir "Mostrar"
  dentro del campo antes que un segundo campo de confirmación, que alarga el formulario en el
  celular.
- **Comando sugerido:** `/impeccable harden`, luego `/impeccable clarify`.
- **¿Lo resuelve la dirección del rediseño?** **No.**

#### [P1] Sin límites de longitud en ninguna capa

- **Qué:** la base de datos limita el nombre a 100 caracteres y el correo a 150
  (`User.java:32-35`), pero `RegisterUserRequest` no tiene `@Size(max = …)` y la contraseña no
  tiene máximo, aunque BCrypt solo usa 72 bytes. El frontend tampoco pone `maxLength`.
- **Por qué importa:** un nombre o correo largo, o una frase-contraseña pegada desde un gestor,
  probablemente termina en un 500 genérico en lugar de un 400 por campo. Rompe la regla del
  proyecto de validar con DTO y mostrar un mensaje claro: es un hueco del contrato, no estético.
- **Corrección:** `@Size(max = 100)` en el nombre, `@Size(max = 150)` en el correo y
  `@Size(max = 72)` en la contraseña, con mensajes en español (cambio en un DTO de transporte,
  permitido por la regla 1 de CLAUDE.md; no cambia el esquema), y los mismos límites con
  `maxLength` y validadores en el frontend.
- **Comando sugerido:** `/impeccable harden`.
- **¿Lo resuelve la dirección del rediseño?** **No.**

#### [P1] "Correo ya registrado" aparece lejos del campo y sin salida

- **Qué:** el backend responde 422 solo con `message`, sin `errors.email`
  (`UserAppService.java:53-54`), así que el mensaje va al error general, encima del botón y lejos
  del campo Correo. El foco no se mueve y no se ofrece "¿Quieres iniciar sesión?".
- **Por qué importa:** es un caso muy probable entre estudiantes que se registran dos veces o no
  recuerdan si ya tienen cuenta. Revelar que el correo existe es un riesgo ya aceptado (README),
  así que usarlo para guiar no lo empeora.
- **Corrección:** detectar ese 422 en `RegisterPage` y mostrar el error bajo el campo Correo con
  un enlace "Inicia sesión con este correo" que precargue `/login`. También podría devolverlo el
  backend como `errors.email`, pero eso cambia el contrato del 422 y es tema del equipo.
- **Comando sugerido:** `/impeccable clarify`.
- **¿Lo resuelve la dirección del rediseño?** **No.**

#### [P2] Tras crear la cuenta no hay bienvenida ni primer paso

- **Qué:** `navigate('/dashboard')` sin `replace` y sin ningún estado de "cuenta creada"
  (`RegisterPage.tsx:36`); el usuario cae en un Resumen con la billetera en $0. Además, `/register`
  no redirige a quien ya inició sesión (`AppRouter.tsx:17`): con "Atrás" vuelve al formulario
  estando dentro.
- **Por qué importa:** es el momento de mayor intención del usuario nuevo, y su primer contacto
  con la app es una pantalla vacía. Coincide con el estado de $0 sin siguiente paso señalado en el
  Resumen.
- **Corrección:** `navigate('/dashboard', { replace: true })` con una señal de bienvenida; un
  bloque de primeros pasos en el Resumen para cuentas nuevas (registrar el primer ingreso, fijar
  la meta, crear o unirse a un proyecto); proteger `/register` y `/login` cuando ya hay sesión.
- **Comando sugerido:** `/impeccable onboard`.
- **¿Lo resuelve la dirección del rediseño?** **En parte.** El rediseño del Resumen da el lugar
  del primer paso; el disparador y el `replace` son propios del registro.

#### [P3] El subtítulo dice poco y usa estilos en línea

- **Qué:** "Te creamos tu billetera personal automáticamente." no dice qué es la billetera ni que
  hay proyectos compartidos; margen y color van en línea (`RegisterPage.tsx:47`, `:93`), y el
  margen de 2rem empuja el formulario más abajo en el celular.
- **Por qué importa:** es el único texto propio de la página y el que le da especificidad.
- **Corrección:** reescribir la frase orientada al beneficio y moverla a una clase con tokens de
  espaciado.
- **Comando sugerido:** `/impeccable clarify`, luego `/impeccable polish`.
- **¿Lo resuelve la dirección del rediseño?** **No.**

### Qué resuelve la dirección del rediseño

| Problema | Menú lateral · barra inferior · hojas |
|---|---|
| [P1] Contraseña nueva sin apoyo | No |
| [P1] Sin límites de longitud | No |
| [P1] Correo duplicado sin salida | No |
| [P2] Sin bienvenida ni primer paso | En parte (el Resumen rediseñado da el lugar) |
| [P3] Subtítulo y estilos en línea | No |

### Problemas ya documentados que también aparecen aquí

- **Del Login (compartidos por `AuthLayout` y los componentes de formulario):**
  - El panel de marca empuja el formulario en el celular: aquí el `h2` aparece a mitad de pantalla
    y "Crear cuenta" queda cerca del borde del primer pliegue; con el teclado abierto, el botón
    queda oculto.
  - Bordes de campo casi invisibles y foco débil en `Input`.
  - Sin autocompletado ni "mostrar contraseña".
  - Estados de envío ("Procesando...") y el texto "sincronizados al instante" del panel.
  - Hex sueltos en `AuthLayout`.
- **Del Resumen:** `lang="en"`, título genérico, sin enlace para saltar; `ink-faint` en los
  placeholders.

### Señales de alerta por persona

- **Usuario distraído en el celular:** la regla de contraseña desaparece al teclear; sin "Mostrar",
  un error de tipeo lo deja fuera de su cuenta; escribe el correo a mano.
- **Primera vez:** no sabe qué es "billetera personal" ni qué viene después; aterriza en un Resumen
  vacío sin guía; no hay aviso de tratamiento de datos.
- **Usuario de lector de pantalla o teclado:** los errores por campo están bien; la regla de
  contraseña no está en la descripción accesible; el error de correo duplicado no mueve el foco ni
  queda asociado al campo.
- **Usuario de gestor de contraseñas:** sin `new-password` no genera clave ni ofrece guardarla de
  forma fiable, y puede confundir el formulario con uno de login; una clave generada de más de 72
  bytes puede dar un 500 o quedar truncada.

### Observaciones menores

- Nombre y correo se envían sin recortar espacios (`RegisterPage.tsx:34`): un espacio al final del
  correo podría fallar en el backend o crear una variante del mismo correo.
- La etiqueta "Correo" podría ser "Correo electrónico" para mayor claridad en lectores de pantalla.
- `minLength={6}` en el campo es redundante con `noValidate`, aunque inofensivo.
- El enlace "Inicia sesión" es pequeño en el celular; mismo caso que "Regístrate" en el Login.
- No hay texto de términos ni de tratamiento de datos.

### Preguntas para el equipo

1. ¿Se aprueba agregar `@Size(max = …)` en `RegisterUserRequest`? Es un DTO de transporte y no
   cambia el esquema.
2. Para el correo duplicado, ¿el backend devuelve `errors.email` en el 422 (cambio de contrato) o
   se resuelve solo en el frontend?
3. ¿"Mostrar contraseña" o un campo "Confirmar contraseña"? En el celular se recomienda lo primero.
4. ¿El registro debe llevar a un primer paso guiado (primer movimiento, meta o unirse a un
   proyecto)? ¿Hace falta un aviso de tratamiento de datos (Ley 1581 de 2012), aunque sea un
   proyecto académico?
