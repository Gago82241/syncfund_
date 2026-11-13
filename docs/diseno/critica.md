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
