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
