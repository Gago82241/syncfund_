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
