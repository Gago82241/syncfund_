# Crítica de diseño del frontend

Diagnóstico página por página del rediseño, en tres momentos: antes de empezar (2026-11-13), al
terminar la rama de cada pantalla ("— después del rediseño") y al cerrar el rediseño ("Crítica
final", al final del documento). El diagnóstico inicial evalúa cada pantalla **tal como estaba**
y señala qué resolvería la dirección acordada en `DESIGN.md` (menú lateral en escritorio, barra
de navegación inferior en móvil y páginas organizadas en hojas) y qué no.

Método: `/impeccable critique` con dos evaluaciones independientes: una revisión de diseño (A)
y el detector automático de impeccable (B). Las rutas de código son relativas a
`syncfund-frontend/` salvo que se indique otra cosa.

## Puntajes: antes, después de cada rama y al final

| Pantalla | Inicial | Después de su rama | Final | Cambio total |
|---|---|---|---|---|
| Resumen | 18/40 | 28/40 (`style/resumen`) | 29/40 | +11 |
| Billetera personal | 20/40 | 28/40 (`style/billetera`) | 28/40 | +8 |
| Proyectos compartidos | 23/40 | 29/40 (`style/proyectos`) | 30/40 | +7 |
| Detalle del proyecto | 24/40 | 29/40 (`style/detalle-proyecto`) | 29/40 | +5 |
| Categorías | 20/40 | 28/40 (`style/categorias`) | 29/40 | +9 |
| Login | 23/40 | 29/40 (`style/login-registro`) | 30/40 | +7 |
| Registro | 23/40 | 32/40 (`style/login-registro`) | 32/40 | +9 |
| **Promedio** | **21.6/40** | **29.0/40** | **29.6/40** | **+8.0** |

La meta del plan era 28/40 o más en cada pantalla. El paso de "después de su rama" a "final"
recoge la rama de pulido (`style/pulido-final`, PR #35). Las capturas del antes y del después
están en `capturas-antes/` y `capturas-despues/`.

---

## Resumen ejecutivo para la reunión

Síntesis de las 7 críticas de abajo (2026-11-13). El detalle y la evidencia de cada punto están
en la sección de cada página.

### 1. Puntajes

| Pantalla | Puntaje | P0 | P1 | P2 | P3 |
|---|---|---|---|---|---|
| Resumen | 18/40 | 1 | 3 | 1 | 0 |
| Billetera personal | 20/40 | 0 | 4 | 1 | 0 |
| Categorías | 20/40 | 0 | 3 | 2 | 0 |
| Proyectos compartidos | 23/40 | 0 | 2 | 2 | 1 |
| Login | 23/40 | 0 | 3 | 2 | 0 |
| Registro | 23/40 | 0 | 3 | 1 | 1 |
| Detalle del proyecto | 24/40 | 0 | 4 | 1 | 0 |

Ninguna pantalla llega a 25/40. La base técnica es buena en todas: estados de carga y error
honestos, validación igual a la del backend y formularios con etiquetas accesibles.

### 2. Problemas que se repiten

| Prioridad | Problema | Páginas afectadas |
|---|---|---|
| P0 | Navegación móvil rota: la cabecera desborda, el navegador aleja el zoom y no se marca la página activa | Resumen, Billetera, Proyectos, Detalle, Categorías |
| P1 | Cifras sin etiqueta o que no son del usuario ("tu saldo" con fondos ajenos, fondo sin nombre, dos cifras protagonistas) | Resumen, Billetera, Proyectos, Detalle |
| P1 | Montos `type="number"` "sin puntos": "50.000" puede quedar en $50 | Billetera, Detalle, Categorías |
| P1 | Cuadrículas fijas de dos columnas que desbordan en el celular | Billetera, Detalle |
| P1 | Formularios siempre abiertos antes de la información que se consulta a diario | Billetera, Proyectos, Detalle, Categorías |
| P1 | Campos casi invisibles (borde 1,4:1) y foco que no se ve en `Input` | Todas las que tienen formularios |
| P1 | Filas que se rompen con datos reales (signo separado del monto, nombres largos) | Billetera, Detalle, Proyectos, Categorías |
| P2 | Guardar sin confirmación ni anuncio para lector de pantalla | Billetera, Proyectos, Detalle, Categorías |
| P2 | Estados vacíos y primer uso sin guía | Resumen, Billetera, Proyectos, Detalle, Categorías, Registro |
| P2 | Accesibilidad estructural: `lang="en"`, título genérico, sin `h1`, sin enlace para saltar | Todas |
| P2 | Contraste insuficiente de `gain-500`, `loss-500` e `ink-faint` en texto | Todas |

### 3. Qué resuelve la nueva estructura (menú lateral, barra inferior, hojas)

- **Lo resuelve:** la navegación móvil (con página activa y "Cerrar sesión" en un menú de
  cuenta), los formularios que desplazan a las listas (pasan a paneles u hojas inferiores) y la
  cuadrícula de gasto y aporte del Detalle.
- **Lo resuelve en parte:** la jerarquía por tareas del Detalle y del Resumen (da el lugar, pero
  "tu situación + acción" hay que diseñarlo), los estados vacíos (da la hoja, no el texto), las
  confirmaciones (da un momento de cierre, falta definir el éxito y el foco) y la accesibilidad
  (regiones, enlace para saltar y `aria-current`, pero no idioma, título ni encabezados).
- **No lo resuelve:** el significado de las cifras, los campos de monto, las filas frágiles, el
  contraste, la barra de presupuesto, los errores de la sección 4 y casi nada de Login y
  Registro, que no tienen navegación.

### 4. Errores reales que no son de diseño

Se pueden corregir antes del rediseño o en paralelo.

**Solo frontend:**
- **Categorías calcula el mes en UTC** (`useCategories.ts:16`): desde las 7:00 p. m. del último día
  del mes muestra $0 en todas las categorías.
- **Umbral de "en paz" distinto** en el Detalle: la tarjeta usa `=== 0` y la tabla, medio centavo;
  un saldo de -0,003 sale como "Debes $ 0" y como "Al día" a la vez.
- **El formulario de la meta no se actualiza** si la meta cambia. (Que cambiar entre Gasto e
  Ingreso reinicie monto y descripción fue una decisión del equipo, no un error: queda como
  pregunta en la sección 5.)
- **Si la recarga falla tras pagar o aportar**, la página entera se reemplaza por el error y el
  usuario no sabe si la operación quedó.
- Plural fijo ("1 integrantes"); nombre y correo del registro sin recortar espacios; `/login` y
  `/register` no redirigen a quien ya inició sesión y `/` siempre lleva a `/login`.
- `lang="en"` y título fijo en `index.html`.

**Requieren backend o decisión del equipo:**
- **Sin límites de longitud** en el registro: las columnas son de 100 y 150 caracteres, pero el
  DTO no tiene `@Size(max)` y la contraseña no tiene máximo (BCrypt usa 72 bytes): probable error
  500. El nombre del proyecto tampoco tiene límite.
- **El colchón mueve saldo sin crear movimiento**: el saldo baja y el libro no lo explica.
- **`getGeneralSummary()` suma los fondos completos** de los proyectos y la pantalla lo llama
  "tu saldo general".
- **Correo duplicado**: el 422 no trae `errors.email` y el mensaje sale lejos del campo.
- **Categorías hace 2N+2 peticiones** por carga y falla entera si una falla.

### 5. Decisiones que debe tomar el equipo

**Cifras y significado** (lo más importante):
1. **Propuesta pendiente de confirmar:** la cifra del Resumen es billetera + saldos netos por
   proyecto, con desglose, calculada en el frontend sin cambiar el dominio.
2. **Propuesta pendiente de confirmar:** el Resumen responde "¿cuánto tengo?"; si el usuario debe,
   un aviso destacado justo debajo con a quién, cuánto y "Pagar"; si le deben, en la hoja de
   proyectos; si está en paz, "Estás al día en todos tus proyectos".
3. En el Detalle, ¿la cifra protagonista es "tu situación" y el fondo pasa a secundaria?
4. En la lista de proyectos, ¿qué cifra lleva cada fila? ¿La respuesta de la lista trae el saldo
   neto del usuario (campo nuevo en el DTO) o se pide proyecto por proyecto?
5. En la Billetera, ¿la cifra es "Disponible" o "Total"? ¿Los movimientos del colchón deben
   aparecer en el libro (toca el dominio)?

**Estructura y flujo:**
6. ¿Cuál es la tarea número uno del Detalle en el celular? ¿La barra inferior lleva un botón
   central "Registrar"?
7. ¿Meta, colchón, "Integrantes" y "Agregar integrante" pasan a paneles u hojas aparte (por
   ejemplo, "Ajustes del proyecto")?
8. ¿Qué pasa después de crear un proyecto (ir al Detalle) y después de registrarse (primer paso
   guiado)? ¿Qué ve alguien con $0 y sin proyectos?
9. ¿En qué orden van proyectos y categorías (deudas o excesos primero)? ¿Se muestra el rol de
   administrador?
10. ¿El historial muestra quién aportó y entre quiénes se dividió cada gasto, y el pago tiene un
    paso de revisión?

**Cambios de backend o contrato** (regla 1 de CLAUDE.md):
11. ¿Se aprueba `@Size(max)` en `RegisterUserRequest` y en el nombre del proyecto?
12. ¿El diseño UML permite editar y eliminar categorías? Hoy un límite mal escrito es permanente.
13. Correo duplicado: ¿`errors.email` en el 422 o se resuelve solo en el frontend?
14. ¿Una respuesta agregada de categorías con su gasto del mes? ¿El progreso de la meta se calcula
    en el frontend o en el backend?

**Sistema visual:**
15. ¿El círculo esmeralda del login es una excepción a la Money-Only Color Rule o pasa a tinta?
    DESIGN.md hoy se contradice.
16. ¿Se aprueban un estado "cerca del límite" en ámbar con un tono oscuro para texto, un token
    `--field-border` de al menos 3:1 y un `PasswordInput`? ¿Qué significa un límite de 0?

**Acceso:**
17. ¿Habrá recuperación de contraseña? ¿"Mostrar contraseña" o "Confirmar contraseña"?
18. En el celular, ¿el panel de marca se reduce a una franja o se muestra solo en el Registro?

**Formularios:**
19. Al cambiar entre Gasto e Ingreso, el formulario reinicia monto y descripción (decisión del
    equipo en una rama anterior). La crítica de la Billetera propone conservarlos para no
    obligar a escribir de nuevo. ¿Se mantiene la decisión o se revisa en el rediseño?
    - **Resuelta (decisión del equipo, 2026-11-18):** se mantiene; cambiar de tipo sigue
      reiniciando los campos.
19. ¿Hace falta un aviso de tratamiento de datos (Ley 1581 de 2012)?

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

## Resumen — después del rediseño

- **Archivos:** `src/pages/DashboardPage.tsx` y `src/features/dashboard/` (cálculo en `summary.ts`,
  carga en `hooks/useDashboard.ts`).
- **Fecha:** 2026-11-13 · rama `style/resumen` (commit `f62a903`).
- **Método:** dos evaluaciones aisladas. A: revisión de diseño con el código y capturas de Chrome
  sin interfaz contra una API simulada (320, 375 y 1280 px; escenarios con deuda, al día, usuario
  nuevo, error, error solo del presupuesto, carga y datos extremos). B: detector de impeccable sobre
  el código y sobre la página renderizada (`detect --cdp`).
- **Modo de la pantalla:** Operate.
- **Resultado:** **28/40, Bueno** (antes 18/40, +10). Cumple la meta de 28 del plan, sin margen.

### Puntaje de heurísticas (Nielsen)

| # | Heurística | Antes | Ahora | Problema clave que queda |
|---|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 2 | 3 | Carga con la forma del contenido, página activa y aviso "Movimiento registrado". No dice cuándo se actualizó la cifra ni vuelve a consultar sola. |
| 2 | Coincidencia con el mundo real | 1 | 3 | Vocabulario del producto. "Estás al día" aparece aunque te deban, y "Tienes en total" no aclara que "Te deben" no es dinero disponible. |
| 3 | Control y libertad | 3 | 3 | El panel se cierra con Esc, "Cerrar" o el velo, y devuelve el foco. Al reabrirlo se pierde lo escrito. |
| 4 | Consistencia y estándares | 2 | 3 | "Pagar" se ve como botón de acción pero solo navega al Detalle. El h1 mide lo mismo que los títulos de las hojas. |
| 5 | Prevención de errores | 2 | 3 | Nunca hay cifra parcial. El formulario del panel aún usa el campo de monto antiguo (se cambia en `style/billetera`). |
| 6 | Reconocer antes que recordar | 1 | 3 | Deudas y estado por proyecto a la vista. Al tocar "Pagar" hay que volver a buscar a la persona en la tabla del Detalle. |
| 7 | Flexibilidad y eficiencia | 1 | 2 | "Registrar movimiento" a un toque. "Pagar" llega a medio camino. |
| 8 | Estética y diseño minimalista | 2 | 3 | Sobria y ordenada. En el celular el monto de la deuda se repite tres veces y "Tus proyectos" queda bajo el pliegue. |
| 9 | Recuperación de errores | 3 | 3 | Errores separados para la cifra y el presupuesto, con Reintentar, y aviso de que el cambio sí quedó si falla la recarga. |
| 10 | Ayuda y documentación | 1 | 2 | La cuenta explica de dónde sale la cifra. Nada explica qué es el colchón ni que "Te deben" no se puede gastar todavía. |
| **Total** | | **18/40** | **28/40** | **Bueno**: base sólida; falta cerrar el flujo de pago. |

### Veredicto de especificidad

**Revisión de diseño:** es de SyncFund por lo que dice y todavía genérica por cómo se dispone. La
cuenta "Billetera + Te deben − Debes" con signos, "incluye colchón", el aviso "Debes $ 60.000 a
Camilo · Viaje a Cartagena" y los estados "Te deben / Debes / Al día" no los puede usar otra app sin
cambios: es justo lo personal y lo compartido, juntos. En escritorio, en cambio, el esqueleto (cifra
grande, indicadores, aviso y dos hojas blancas con "Ver todos") se parece a la plantilla de un
dashboard. El rasgo más de libro mayor, la suma, va debajo del total, cuando en un libro el total
va al pie, bajo el filete.

**Detector automático:**
- Código: **0 hallazgos** (`detect --json` sobre la página, `features/dashboard`,
  `components/ui`, `components/layout` y `TransactionForm`).
- Página renderizada (375 y 1280 px; escenarios con deuda, usuario nuevo y datos extremos):
  - Sin hallazgos de contraste ni de texto diminuto, y sin desplazamiento horizontal.
  - `cream-palette`: es el fondo ledger-50, la identidad aprobada. Falso positivo.
  - `flat-type-hierarchy`: el h1 y los h2 miden 18 px. Coincide con lo que vio la revisión de diseño.
    La cifra (hasta 33,6 px) es la que manda, pero no es un encabezado.
  - `straggler`: solo con un nombre extremo en el aviso de deuda ("Gómez-Restrepo" solo en la
    última línea). Real y de baja prioridad: `text-wrap: pretty`.
- No se usó el overlay en vivo; la evidencia del navegador sale de `detect --cdp`.

### Impresión general

El Resumen ya responde "¿cuánto tengo?" con una cifra que es solo del usuario y que se puede
comprobar a ojo, y no deja pasar ninguna deuda. Lo que falta está en el borde de la pantalla:
"Pagar" promete un pago y entrega una navegación. La mayor oportunidad es que ese botón lleve al
pago ya listo, en la rama del Detalle del proyecto.

### Lo que funciona

1. **La cifra es del usuario y se explica sola.**
   - Cada parte se redondea antes de sumar, así que la cuenta visible siempre cuadra con el total.
   - El lector de pantalla oye "más Te deben, menos Debes".
   - Es lo más fácil de sustentar ante el docente.
2. **Disciplina de estados.**
   - La cifra es todo o nada: si falla una petición no queda un total parcial ni el anterior.
   - El presupuesto falla aparte.
   - Las respuestas viejas se descartan.
   - "Usuario nuevo" se distingue de "gastó todo lo que tenía".
3. **Robusta en el celular.**
   - Sin desborde a 320 px, incluso con $ 221.234.506.799 y nombres larguísimos.
   - La acción fija queda al alcance del pulgar sin tapar el último renglón.
   - El panel sube como hoja inferior con el foco en el monto.

### Problemas prioritarios

#### [P1] "Pagar" promete un pago y entrega una navegación

- **Qué:** en `DebtNotice.tsx`, "Pagar" es un enlace al Detalle con estilo de botón principal y
  `aria-label` "Pagar $ 60.000 a Camilo en Viaje a Cartagena". En el Detalle no hay nada abierto
  y hay que volver a encontrar el "Pagar" de la tabla de situación.
- **Por qué importa:** es el flujo de "quedar al día con un solo pago" (PRODUCT.md). Quien usa
  lector de pantalla puede creer que ya pagó.
- **Corrección:** en `style/detalle-proyecto`, que el Detalle acepte una intención de pago
  (p. ej. `?pagar={toUserId}`) y abra el panel de pago ya lleno. Mientras tanto, cambiar el
  `aria-label` a "Ir a Viaje a Cartagena para pagarle $ 60.000 a Camilo".
- **Comando sugerido:** `/impeccable clarify`, luego `/impeccable shape`.

#### [P2] Dos acciones principales del mismo peso

- **Qué:** "Pagar" y "Registrar movimiento" son botones azul tinta iguales. Con varias deudas, en
  el celular se apilan varios bloques de ancho completo encima de la acción fija.
- **Por qué importa:** rompe "una acción principal por pantalla" y le quita espacio a lo demás.
- **Corrección:** "Pagar" en versión secundaria (contorno) y compacto a la derecha del renglón
  también en el celular.
- **Comando sugerido:** `/impeccable layout`, luego `/impeccable polish`.

#### [P2] "Estás al día" y "Tienes en total" dicen un poco más de lo cierto

- **Qué:** "Estás al día en todos tus proyectos" sale cuando no debes, aunque te deban
  $ 150.000. "Tienes en total" incluye "Te deben" sin aclarar que todavía no se puede gastar.
- **Por qué importa:** principio 1, "cada cifra dice qué es". Quien comparte arriendo puede
  gastar de más.
- **Corrección:** "No debes nada en tus proyectos" cuando hay saldos a favor y "Estás al día"
  solo si todo está en cero. Una nota corta bajo "Te deben" ("lo recibes cuando te paguen"), sin
  cambiar la cifra aprobada.
- **Comando sugerido:** `/impeccable clarify`.

#### [P2] En el celular la deuda se repite y los proyectos quedan bajo el pliegue

- **Qué:** a 375 px el primer pantallazo es cifra, cuenta y aviso. "$ 60.000" aparece en la
  cuenta, en el aviso y en la fila del proyecto. "Tus proyectos" empieza detrás de la acción fija.
- **Por qué importa:** "una sola cifra protagonista" y lo que distingue a SyncFund (la posición
  en cada proyecto) solo se ve al desplazarse.
- **Corrección:** cuenta más compacta en el celular, o renglón "− Debes" que se despliegue con
  "a Camilo · Pagar" en lugar de un aviso aparte.
- **Comando sugerido:** `/impeccable layout`, luego `/impeccable adapt`.

#### [P3] Composición de dashboard en escritorio y título plano

- **Qué:** el h1 "Resumen" mide lo mismo que los títulos de las hojas (también lo marca el
  detector). En escritorio queda un hueco entre la cuenta y el botón. El usuario nuevo ve media
  pantalla vacía.
- **Corrección:** total al pie de la cuenta con filete doble de libro mayor; escala de títulos con
  un paso claro entre h1 y h2; en el usuario nuevo, una vista muda de cómo se verá la cuenta, sin
  cifras inventadas.
- **Comando sugerido:** `/impeccable typeset`, luego `/impeccable onboard`.

### Señales de alerta por persona

- **Usuario distraído en el celular:**
  - "Registrar movimiento" queda al pulgar.
  - "Pagar", de ancho completo justo encima, se toca sin querer al desplazar.
  - El borde terracota del monto en modo Gasto parece un error (formulario antiguo, ya programado).
- **Usuario de lector de pantalla o teclado:**
  - A favor:
    - Enlace de salto.
    - Un solo h1.
    - La cuenta se lee con "más" y "menos".
    - Las barras tienen `aria-valuetext`.
    - El panel atrapa y devuelve el foco (verificado).
  - En contra:
    - El `aria-label` de "Pagar" anuncia un pago que no ocurre.
    - El nuevo total no se anuncia tras guardar (solo el aviso).
- **Primera vez:**
  - El estado vacío se entiende en segundos.
  - "Crea un proyecto" lleva a la lista, no crea nada.
  - Nada explica qué es el colchón.
- **Estudiante que comparte arriendo:**
  - Ve al abrir "Debes $ 60.000 a Camilo · Viaje a Cartagena": el fallo central de la crítica
    anterior está resuelto.
  - Le falta que "Pagar" lo deje en el pago.
  - Si le deben, "Estás al día" y un total que incluye esa plata pueden hacerlo gastar de más.

### Observaciones menores

- En el celular, la cuenta y el encabezado cierran con dos líneas finas casi seguidas.
- "− Debes $ 0" podría ir atenuado cuando no debes nada.
- ProgressBar muestra "10000000 % usado" con gastos absurdos; por encima de 999 % convendría
  "más de 999 %" (`style/categorias`).
- El nombre del proyecto en el aviso va en gris pequeño, y en las filas va destacado.
- Con error de la cifra, la página no ofrece ninguna acción aparte de Reintentar.
- El aviso y la línea "al día" usan margen negativo para acercarse a la cifra; un `gap` del
  contenedor sería más limpio.

### Preguntas para el equipo

1. Si la cuenta ya responde "¿cuánto tengo?", ¿hace falta un aviso aparte, o el renglón
   "− Debes" podría desplegarse con "a Camilo · Pagar"?
2. ¿La protagonista debería ser "Puedes gastar" (billetera disponible) y "Tienes en total" el
   renglón de cierre?
3. Si el Resumen es un libro mayor, ¿no debería leerse de arriba abajo y terminar en el total bajo
   un filete doble?

### Ajustes hechos después de la crítica

El equipo decidió corregir en esta misma rama lo que hacía falta para que la pantalla no prometa más
de lo que hace. El puntaje de arriba es el de antes de estos ajustes.

- **[P1], ajuste mínimo:**
  - El botón del aviso dice "Ir a pagar" y su `aria-label` "Ir a {proyecto} para pagarle a {nombre}".
  - Pasa a botón secundario (contorno sobre papel), para no competir con "Registrar movimiento".
- **[P2] "Estás al día":** con saldos a favor dice "No debes nada en tus proyectos"; "Estás al día
  en todos tus proyectos" queda solo cuando todo está en cero.

### Pendiente para `style/detalle-proyecto`

- [x] **Solución completa del [P1]:** que el Detalle del proyecto reciba la intención de pago desde
  el Resumen (por ejemplo `/projects/{id}?pagar={toUserId}` o el `state` de la navegación) y abra
  el panel de pago ya lleno con a quién y cuánto, para que "Ir a pagar" termine en el pago y no en
  la tabla. Cuando esté, el botón del Resumen puede volver a decir "Pagar".
  - Hecho en `style/detalle-proyecto`: el aviso enlaza a `/projects/{id}?pagar={toUserId}` y dice
    "Pagar"; el Detalle valida que sea una deuda real del usuario (si no, la ignora), abre el panel
    de pago con el monto sugerido y quita el parámetro de la URL.

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

## Billetera personal — después del rediseño

- **Archivos:** `src/pages/PersonalWalletPage.tsx` y `src/features/personal-wallet/` (cálculos en
  `walletFigures.ts`; hojas `WalletLedger`, `SavingsGoalSheet` y `CushionSheet`; paneles
  `TransactionForm`, `SavingsGoalForm` y `CushionForm`), más `TransactionList`.
- **Fecha:** 2026-11-16 · rama `style/billetera` (commit `e852c6c`).
- **Método:** dos evaluaciones aisladas en subagentes separados.
  - A: revisión de diseño con el código y 16 capturas de Chrome sin interfaz contra una API simulada
    (320, 375 y 1280 px). Escenarios: normal, usuario nuevo, sin meta, ahorro negativo, meta
    cumplida, datos extremos, error, carga, error de categorías y cuota, los tres paneles y el aviso
    de éxito.
  - B: detector de impeccable sobre el código y sobre la página renderizada (`detect --cdp`, a 1280
    y 375 px).
- **Modo de la pantalla:** Operate.
- **Resultado:** **28/40, Bueno** (antes 20/40, +8). Cumple la meta de 28 del plan, sin margen.

### Puntaje de heurísticas (Nielsen)

| # | Heurística | Antes | Ahora | Problema clave que queda |
|---|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 2 | 3 | Avisos con monto ("Gasto de $ 2.000 registrado", "Apartaste… tu disponible quedó en…") y carga con forma. Si falla la cuota, la línea desaparece sin aviso; el movimiento nuevo no se marca en la lista. |
| 2 | Coincidencia con el mundo real | 3 | 3 | Disponible, Colchón y Total claros. "Para lograrla: $ 500.000 por quincena" no dice si es ahorrar o gastar, y el ahorro del mes resta los aportes que el Resumen cuenta "A tu favor". |
| 3 | Control y libertad | 1 | 2 | Paneles que se cierran con Esc, "Cerrar" o el velo, y devuelven el foco. Sigue sin poder editarse ni borrarse un movimiento (backend), y cambiar de tipo borra lo escrito (decisión del equipo). |
| 4 | Consistencia y estándares | 2 | 3 | Mismos componentes y el mismo total que el Resumen. "−$ 65.000" sin espacio frente a "− $ 25.000" en las filas; la acción de la hoja de la meta es botón o enlace según el estado. |
| 5 | Prevención de errores | 2 | 3 | `MoneyInput` con vista previa, límite avisado en vivo (gasto y colchón) y Liberar deshabilitado sin colchón. La cuota no se ajusta al progreso. |
| 6 | Reconocer antes que recordar | 2 | 3 | Categoría en la fila, límites antes de escribir y meta precargada. Pagos y aportes no enlazan a su proyecto. |
| 7 | Flexibilidad y eficiencia | 2 | 2 | Acción fija al pulgar y "Ver más". Sin agrupación por mes, filtros ni otros meses; el año se repite en cada fecha. |
| 8 | Estética y diseño minimalista | 2 | 3 | Una sola cifra protagonista y formularios en paneles. "Disponible" aparece dos veces seguidas y el colchón se explica en cuatro lugares. |
| 9 | Recuperación de errores | 3 | 3 | Error con Reintentar, nota de categorías con Reintentar y errores de formulario claros. La falla de la cuota es silenciosa. |
| 10 | Ayuda y documentación | 1 | 3 | Se explica qué es el colchón y cómo se calcula el ahorro; estados vacíos con siguiente paso. Falta explicar la cuota. |
| **Total** | | **20/40** | **28/40** | **Bueno**: la pantalla ya responde "¿cuánto puedo gastar?"; falta afinar la meta y aligerar el celular. |

### Veredicto de especificidad

**Revisión de diseño:** la voz de libro mayor está en las cuentas, no en el encuadre. Hay tres
elementos que solo se pueden usar en SyncFund:
- La suma "Disponible + Colchón = Total en tu billetera" con filete de 2 px, que cuadra con el
  Resumen.
- La cuenta del mes como asiento: Ingresos − Gastos − Aportes a proyectos ± Pagos entre integrantes
  = Ahorro del mes. Separa lo personal de lo compartido.
- La vista previa del colchón ("Tu disponible quedará en $ 73.000 y tu colchón en $ 100.000").

Lo genérico es la composición de escritorio (cifra a la izquierda, botón suelto a la derecha y tres
hojas blancas) y la nota del colchón en un recuadro fijo al inicio del libro.

**Detector automático:**
- Código: **0 hallazgos** (`detect --json` sobre la página, `features/personal-wallet` y
  `features/transactions`; código de salida 0).
- Página renderizada (`detect --cdp`, igual a 1280 y a 375 px): **3 avisos**.
  - `cream-palette` (el fondo `ledger-50`): falso positivo. Es la identidad de DESIGN.md, ya
    aceptada.
  - `flat-type-hierarchy` (h1 y h2 de 18 px): ya conocido. Es el pendiente del `h1` de `PageHeader`
    para `style/pulido-final`.
  - `nested-cards` en `.wallet__cushion-note`: un recuadro con borde dentro de una hoja. Coincide
    con el P2 de la revisión de diseño (explicaciones repetidas).
- Sin problemas de contraste ni de texto diminuto. Sin desplazamiento horizontal a 320, 375 ni
  1280 px. No se inyectó la superposición visual (sin navegador visible en la sesión).

### Impresión general

La Billetera pasó de un CRUD con tres formularios fijos a un estado de cuenta que se explica solo.
La cifra dice qué es, la suma cuadra con el Resumen y la meta tiene progreso con su cuenta a la
vista. Lo que más rinde ahora es quitar repeticiones (colchón explicado cuatro veces, "Disponible"
dos veces) y hacer que la meta se vea sin bajar 20 filas en el celular.

### Lo que funciona

1. **"Certeza sobre cada peso" hecha interfaz.** La suma cuadra con el Resumen, la cuenta del mes
   se ve completa, con error no se muestra ninguna cifra y los cálculos son funciones puras
   (`walletFigures.ts`) que se pueden verificar a mano.
2. **Formularios seguros.** El gasto mayor que el disponible se avisa mientras se escribe, el
   colchón muestra límites y resultado antes de confirmar, la meta llega precargada y se quita con
   0; selector con `aria-pressed`, radios reales y foco inicial en el monto.
3. **Robusta y accesible en lo estructural.** Sin desborde con montos de 15 cifras y 45 filas
   (el monto baja de línea), barra con `aria-valuetext`, texto oculto "más / igual a / Gasto de"
   para el lector de pantalla y estados propios de carga, error, vacío y categorías fallidas.

### Problemas prioritarios

#### [P2] La cuota "Para lograrla" no tiene en cuenta el progreso

- **Qué:**
  - Siempre muestra meta/2 por quincena y meta/30 por día (cálculo del backend).
  - Con $ 525.000 de $ 1.000.000 el 16 de noviembre sigue diciendo "$ 500.000 por quincena".
  - Con la meta cumplida dice "Para lograrla".
- **Por qué importa:** es la única cifra que parece un consejo, y para el mes en curso no es
  cierta.
- **Corrección:** ocultarla con la meta cumplida y nombrarla como ritmo fijo ("Ritmo de la meta:
  …"). La otra opción es "Te faltan $ 475.000 este mes", una resta de cifras que ya están en
  pantalla.
- **Comando sugerido:** `/impeccable clarify`.

#### [P2] Explicaciones y cifras repetidas

- **Qué:**
  - El colchón se explica en la nota de Movimientos, en su hoja, en la nota de la meta y en el
    panel.
  - "Disponible" sale como etiqueta de la cifra y como primer renglón de la suma.
  - Con colchón en $ 0, la suma no aporta nada.
  - El detector marca la nota como recuadro dentro de una hoja (`nested-cards`).
- **Por qué importa:** la nota fija empuja el libro hacia abajo en la tarea diaria.
- **Corrección:**
  - Llevar la nota a una línea al pie de la lista o a la hoja del colchón.
  - Mostrar la suma solo con colchón mayor que 0.
  - Aplanar la nota, sin borde.
- **Comando sugerido:** `/impeccable distill`.

#### [P2] En el celular la meta queda lejos y el libro no se organiza

- **Qué:**
  - Con 20 filas por tanda, la meta queda a unos 1.700 px de desplazamiento a 375 px.
  - No hay encabezados por mes, y el año se repite en cada fecha.
- **Por qué importa:** "celular primero", y la meta es el gancho de la pantalla.
- **Corrección:**
  - En el celular, de 5 a 8 filas con "Ver todos", o la hoja de la meta antes del libro.
  - Agrupar por mes y omitir el año en curso.
- **Comando sugerido:** `/impeccable layout`, luego `/impeccable adapt`.

#### [P2] Primera visita: cinco "$ 0" y dos acciones primarias

- **Qué:**
  - "$ 0" en la cifra, en la suma y en "Apartado".
  - "Registra tu primer ingreso" y la barra fija "Registrar movimiento" son dos botones llenos a la
    vez.
  - "Apartar o liberar" se ofrece aunque no hay nada que mover; el panel lo dice recién al abrirlo.
- **Por qué importa:** diluye el primer paso y la regla se ve después, no antes.
- **Corrección:** ocultar la suma y la acción del colchón cuando todo está en $ 0, y dejar una sola
  acción primaria en el estado vacío.
- **Comando sugerido:** `/impeccable onboard`.

#### [P3] Meta cumplida sin momento y encabezado de escritorio con hueco

- **Qué:**
  - "Meta cumplida" pesa lo mismo que el texto de apoyo.
  - A 1280 px el botón queda a unos 500 px de la cifra.
- **Corrección:** un titular breve en esmeralda para la meta cumplida y un encabezado más compacto
  en escritorio.
- **Comando sugerido:** `/impeccable delight`, luego `/impeccable layout`.

### Señales de alerta por persona

- **Usuario distraído en el celular:** acción fija al pulgar, áreas de 44 px y vista previa del
  monto. En contra: la meta está a unas 20 filas y el aviso de éxito tapa filas por unos segundos.
- **Primera vez:** cinco "$ 0", dos botones primarios y una acción del colchón que no lleva a nada.
- **Usuario de lector de pantalla o teclado:**
  - "Disponible 123.000" se escucha dos veces seguidas.
  - La nota de categorías (`role="status"`) se anuncia al aparecer.
  - Si falla la cuota, no se anuncia nada.
- **Datos extremos:** a 320 px la cifra protagonista se parte dentro del número
  (`overflow-wrap: anywhere`, decisión de `style/sistema-base` para no desbordar).
- **Estudiante que comparte arriendo:** ve aportes y pagos separados en la cuenta del mes, pero un
  aporte le baja el "Ahorro del mes" aunque el Resumen lo cuente "A tu favor". Las filas de pagos
  no enlazan al proyecto.
- **Docente evaluador:** todo se puede sustentar con funciones puras. La clasificación de aportes y
  pagos depende de la descripción (anotado en "Fuera del rediseño"): el total no cambia, el renglón
  sí.

### Observaciones menores

- En el panel de gasto, con el error visible ("Tu disponible es $ 123.000…") sobra la ayuda
  "Disponible para gastar".
- "Guardar" es genérico; "Registrar gasto" o "Registrar ingreso" dirían más.
- El comentario de `ProgressBar.tsx` dice que la meta "avanza en esmeralda", pero la barra es azul
  tinta hasta cumplirla.
- "− Pagos entre integrantes" se parte en dos líneas en la columna de escritorio.
- La frase "Este mes salió $ 65.000 más…" repite el total "−$ 65.000" que está justo debajo.

### Preguntas para el equipo

1. ¿Aportar al fondo es "no ahorrar"? El Resumen trata ese dinero como "A tu favor". Si la meta lo
   resta, ¿qué le decimos al estudiante que aporta para el arriendo?
   - **Resuelta (decisión del equipo, 2026-11-18):** el aporte al fondo sigue contando como salida
     en el ahorro del mes.
2. La pantalla pregunta "¿Cuánto puedo gastar?". ¿Debería existir "Puedes gastar $ X este mes sin
   romper tu meta" como renglón de la suma?
3. ¿La nota del colchón se queda en el libro hasta que el backend registre esos movimientos, o
   basta con la hoja del colchón?

### Pendiente (sin hacer en esta rama)

- Los cuatro P2 y el P3 de arriba, para `style/pulido-final` o según lo que decida el equipo (la
  pregunta 1 cambia la definición del ahorro, que aprobó el usuario en esta rama).
  - En `style/pulido-final`: cuota como ritmo fijo y oculta con la meta cumplida; nota del colchón
    plana en su hoja y suma solo con colchón; primera visita con una sola acción primaria; tandas de
    8 filas en el celular y fechas sin el año en curso; titular de meta cumplida. Agrupar por mes
    queda descartado.
- Backend, anotado en "Fuera del rediseño" de `plan-rediseno.md`:
  - Cuota semanal errónea.
  - Marca de origen de los movimientos.
  - Zona horaria del servidor.
  - Movimiento en el historial al apartar o liberar.
  - Editar o eliminar movimientos.

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

## Proyectos compartidos — después del rediseño

- **Archivos:** `src/pages/SharedProjectsPage.tsx` y `src/features/shared-project/`:
  - renglón compartido con el Resumen en `components/ProjectStatusList`;
  - orden y línea de resumen en `projectLines.ts`;
  - carga con un saldo por proyecto en `projectBalances.ts` y `hooks/useSharedProjects.ts`;
  - panel `CreateProjectForm`.
- **Fecha:** 2026-11-16 · rama `style/proyectos` (commit `86379b7`).
- **Método:** dos evaluaciones aisladas en subagentes separados.
  - A: revisión de diseño con el código y 15 capturas de Chrome sin interfaz contra una API simulada
    (320, 375 y 1280 px). Escenarios: lista normal, falla del saldo de un proyecto, sin proyectos,
    error, carga, panel de crear, Detalle tras crear (con y sin error de carga) y datos extremos
    (40 proyectos, nombres sin espacios, montos de 12 cifras).
  - B: detector de impeccable sobre el código y sobre la página renderizada (`detect --cdp`, a 1280
    y 375 px), más comprobaciones de contraste, títulos, nombres accesibles y áreas táctiles.
- **Modo de la pantalla:** Operate.
- **Resultado:** **29/40, Bueno** (antes 23/40, +6). Cumple la meta de 28 del plan, con poco margen.

### Puntaje de heurísticas (Nielsen)

| # | Heurística | Antes | Ahora | Problema clave que queda |
|---|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 2 | 3 | Esqueleto con forma, falla parcial visible y aviso al crear. La lista espera al saldo más lento: N + 1 peticiones antes de ver un renglón. |
| 2 | Coincidencia con el mundo real | 2 | 3 | "Debes / A tu favor / Al día" se entiende de una vez. "A tu favor" incluye tu parte del fondo sin gastar y se puede leer como "me deben". |
| 3 | Control y libertad | 3 | 3 | El panel se cierra con Esc, "Cerrar" o el velo; "Atrás" vuelve del Detalle a la lista. No se puede renombrar ni borrar un proyecto (backend). |
| 4 | Consistencia y estándares | 2 | 3 | Mismo renglón y mismo orden que el Resumen. El h1 y el h2 miden igual; el Resumen dice "a quién" y ofrece "Pagar", la lista no. |
| 5 | Prevención de errores | 3 | 3 | Nombre obligatorio y tope de 100/500 caracteres. Sin aviso de nombre repetido; la elipsis puede esconder lo que distingue dos nombres. |
| 6 | Reconocer antes que recordar | 2 | 3 | Rol, estado e integrantes a la vista. No dice a quién le debes. |
| 7 | Flexibilidad y eficiencia | 2 | 2 | El orden ayuda. Sin atajo para pagar, búsqueda ni cortes por grupo; con 40 proyectos es desplazamiento puro. |
| 8 | Estética y diseño minimalista | 3 | 3 | El formulario ya no domina. En la falla parcial la noticia sale tres veces; el título "Tus proyectos" repite el h1. |
| 9 | Recuperación de errores | 3 | 3 | "Reintentar" pide solo los saldos que fallaron. Tras crear, el error dice "Tu cambio se guardó", no "El proyecto se creó". |
| 10 | Ayuda y documentación | 1 | 3 | El estado vacío explica el fondo común y el camino "si te agregan por correo"; el panel dice que serás el administrador. Nada explica qué incluye "A tu favor". |
| **Total** | | **23/40** | **29/40** | **Bueno**: la lista responde "¿dónde debo?" de un vistazo; falta "a quién" y que cargue más rápido con muchos grupos. |

### Veredicto de especificidad

**Revisión de diseño:** la pantalla dejó de ser intercambiable con un gestor de tareas. Tres cosas
son propias de SyncFund:
- El renglón dice tu situación en texto ("Debes", "A tu favor", "Al día"), con integrantes y rol.
- El orden dice qué atender primero: debes, saldo sin cargar, a tu favor y al día, cada grupo con el
  monto mayor arriba.
- Ninguna cifra se inventa: un saldo que no llegó se muestra como "Saldo sin cargar" (borde
  punteado, sin monto) y la línea de resumen nunca dice "no debes nada" si falta un saldo.

Lo genérico es la composición de escritorio: título pequeño, botón suelto a la derecha y una hoja
de 768 px sobre un lienzo vacío.

**Detector automático:**
- Código: **0 hallazgos** (`detect --json` y `--scope layout` sobre la página, `ProjectStatusList`,
  `CreateProjectForm` y `components/ui`; también con `--no-config`).
- Página renderizada (`detect --cdp`, igual a 1280 y a 375 px): **2 avisos**.
  - `cream-palette` (el fondo `ledger-50`): falso positivo. Es la identidad de DESIGN.md.
  - `flat-type-hierarchy` (h1 y h2 de 18 px): ya conocido. Es el pendiente del `h1` de
    `PageHeader` para `style/pulido-final`; coincide con lo que vio la revisión de diseño.
- Sin desplazamiento horizontal a 320, 375 ni 1280 px (tampoco con el panel abierto). Un solo h1.
  Renglones y botones de 44 px o más. Contraste AA en todo: el más justo es "Debes" (4.88:1).
- Los nombres accesibles de los renglones se leen completos ("Salida 1 integrante, Administrador
  Al día"). No se inyectó la superposición visual (sin navegador visible en la sesión).

### Impresión general

Antes, la lista mostraba el fondo común sin etiqueta. Ahora dice, renglón por renglón, cómo estás
en cada grupo y en qué orden atenderlo. Crear ya no tapa la lista y lleva directo a agregar
integrantes. Lo que más rinde ahora es que la lista diga a quién le debes (hoy el Resumen da más
información que la pantalla dedicada) y que no espere al saldo más lento.

### Lo que funciona

1. **"Certeza sobre cada peso" hasta el final.**
   - El saldo que falta nunca se vuelve cero, y va arriba porque podría ser una deuda.
   - La línea de resumen no promete "al día" sin todos los datos.
   - "Reintentar" pide solo lo que falló.
2. **Un renglón para toda la app.** El Resumen y la lista usan el mismo componente y el mismo orden:
   - un solo enlace por fila;
   - el nombre ocupa hasta dos líneas, y el estado baja de línea antes que aplastarlo;
   - montos de 12 cifras sin desbordes a 320 px.
3. **Crear en su lugar.**
   - Panel con foco en el nombre y acción fija al alcance del pulgar en el celular.
   - Aviso con el nombre del proyecto y salto al Detalle en la pestaña Integrantes.
   - Si esa carga falla, el error dice que el cambio se guardó.

### Problemas prioritarios

#### [P2] La lista dice dónde debes, pero no a quién ni deja pagar

- **Qué:** el renglón termina en "Debes $ 85.000 →". El Resumen, con los mismos datos, dice
  "Debes $ 85.000 a Laura Gómez" y ofrece "Pagar".
- **Por qué importa:** quien entra por "Ver todos" pierde información respecto al Resumen, y el
  principio es "quedar al día sin hacer cuentas".
- **Corrección:**
  - En los renglones con deuda, escribir "a Laura Gómez" (o "a 2 integrantes") en la segunda línea.
  - Opcional: un enlace secundario "Pagar" a `/projects/{id}?pagar=…`, que el Detalle ya atiende.
  - Los datos ya llegan en la situación de cada proyecto.
- **Comando sugerido:** `/impeccable shape`, luego `/impeccable clarify`.

#### [P2] La lista espera al saldo más lento y escala mal

- **Qué:** se pide la lista y luego un saldo por proyecto; el esqueleto sigue hasta que llegan
  todos (`projectBalances.ts`). Con 40 proyectos son 41 peticiones.
- **Por qué importa:** el uso principal es en el celular con datos móviles; la pantalla se siente
  más lenta justo cuando hay más grupos.
- **Corrección:**
  - Solo frontend: mostrar los renglones al llegar la lista, con "Cargando saldo", y ordenar al final.
  - Ideal, con aprobación del equipo: que la respuesta de la lista traiga el saldo neto del usuario
    (un campo en el DTO; es la pregunta 1 de la crítica anterior).
- **Comando sugerido:** `/impeccable harden`.

#### [P2] El siguiente paso tras crear solo vive en un aviso de 4 segundos

- **Qué:**
  - El aviso dice "Ahora agrega a los integrantes".
  - En el Detalle, la acción fija es "Registrar gasto", que fallaría con el fondo en $ 0.
  - "Agregar integrante" es una acción secundaria.
- **Por qué importa:** es el cierre del flujo de crear y la interfaz contradice al aviso.
- **Corrección:** en el Detalle, con un solo integrante, un estado guía persistente en Integrantes
  ("Solo estás tú. Agrega a los integrantes por su correo para repartir los gastos") con "Agregar
  integrante" como acción principal.
- **Comando sugerido:** `/impeccable onboard`, luego `/impeccable clarify` (es del Detalle).

#### [P3] La falla de un saldo se anuncia tres veces y con tono de error

- **Qué:** la línea de resumen, el aviso terracota con `role="alert"` y el renglón "Saldo sin
  cargar" dicen lo mismo.
- **Corrección:** quitar la frase de la línea de resumen cuando el aviso está visible, o volver el
  aviso una nota neutra de una línea con "Reintentar".
- **Comando sugerido:** `/impeccable distill`.

#### [P3] Jerarquía plana y el orden no se ve

- **Qué:**
  - El h1 y el título de la hoja miden lo mismo; es un pendiente conocido para `style/pulido-final`.
  - El orden por grupos no tiene cortes visibles.
- **Corrección:**
  - Quitar el título "Tus proyectos" o volverlo encabezado de grupo.
  - Con más de unos 6 proyectos, subtítulos discretos en `ink-muted` ("Debes · 2", "A tu favor · 1",
    "Al día · 2").
- **Comando sugerido:** `/impeccable typeset`, luego `/impeccable layout`.

### Señales de alerta por persona

- **En el celular, con una mano y conexión lenta:**
  - Espera el esqueleto completo por el saldo más lento.
  - La acción fija queda bien al pulgar.
  - Para pagar tiene que entrar al proyecto, cambiar de pestaña y buscar a la persona.
- **Lector de pantalla y teclado:**
  - A favor: un enlace por fila, foco visible, aviso con `role="status"` y pausa oculta antes de
    "Administrador".
  - El aviso de falla parcial lleva `role="alert"` e interrumpe en cada carga.
  - El nombre cortado no tiene `title` para quien ve.
- **Casos extremos:**
  - Con 40 nombres largos que solo difieren al final, la elipsis los deja iguales a 320 px.
  - Si la lista no carga, no se puede crear un proyecto.
- **Estudiante con varios grupos** (persona de PRODUCT.md):
  - Responde "¿en cuál debo?" de una mirada, como pedía la crítica anterior.
  - No ve a quién le debe.
  - "A tu favor $ 120.001" puede hacerle creer que alguien le debe esa plata.

### Observaciones menores

- En escritorio, "Crear proyecto" queda alineado al borde de la página y no al de la hoja de 768 px.
- A 375 px unos renglones ponen el estado al lado y otros debajo, según el largo del nombre.
- La descripción del proyecto sigue sin mostrarse en la lista.
- El error genérico dice "Inténtalo de nuevo en unos minutos" junto a un "Reintentar" inmediato.
- En el panel, la descripción se parte en tres líneas angostas por el botón "Cerrar".

### Estado de los problemas de la crítica anterior

| Problema | Estado |
|---|---|
| [P1] Cifra ambigua en cada fila | **Resuelto.** Tu saldo neto con estado en texto; el fondo sale del renglón. |
| [P1] El formulario desplaza a la lista | **Resuelto.** Panel y acción fija al pulgar. |
| [P2] Estado vacío pobre | **Resuelto.** Explica el fondo común y el camino "te agregan por correo". |
| [P2] Fila frágil y poco informativa | **Resuelto en su mayoría.** Corte seguro, plural, rol, flecha, orden fijo y tope de longitud. Falta `@Size` en el backend. |
| [P3] Crear sin confirmación | **Resuelto en parte.** Aviso y salto a Integrantes; el Detalle no sostiene el siguiente paso. |
| Estilos en línea y contraste de `ink-faint` | **Resueltos.** |

### Preguntas para el equipo

1. Si el Resumen ya muestra los mismos renglones con "a quién" y "Pagar", ¿la lista debe ser la
   versión completa (a quién, pagar y grupos)?
   - **Resuelta (decisión del equipo, 2026-11-18):** la lista dice "a quién" en los renglones con
     deuda, pero no se agrega "Pagar" ni cortes por grupo.
2. ¿Puede la respuesta de la lista traer el saldo neto del usuario, para evitar N peticiones?
   - **Resuelta (decisión del equipo, 2026-11-18):** sin cambiar el backend; la lista se muestra
     apenas llega y cada saldo se completa al llegar, sin esperar al más lento.
3. "A tu favor" mezcla lo que te deben con tu parte del fondo sin gastar. ¿Se distinguen en el
   renglón o basta con explicarlo en el Detalle?
   - **Resuelta (decisión del equipo, 2026-11-18):** no se separa; el Detalle agrega una línea que
     explica que incluye tu parte del fondo que aún no se gasta.
4. Tras crear, ¿qué debe empujar el Detalle: agregar integrantes o aportar primero?
   - **Resuelta (decisión del equipo, 2026-11-18):** agregar integrantes; con un solo integrante el
     Detalle guía con "Agregar integrante".
5. Con 15 o más proyectos, muchos terminados, ¿hace falta archivar o filtrar "con saldo
   pendiente"? (El ciclo de vida del proyecto aún no está decidido.)

### Pendiente (sin hacer en esta rama)

- Los tres P2 y los dos P3 de arriba, para `style/pulido-final` o según lo que decida el equipo.
  El tercer P2 es del Detalle.
  - En `style/pulido-final`: carga sin esperar al saldo más lento, "a quién" en los renglones con
    deuda, guía de "Agregar integrante" en el Detalle, aviso neutro de la falla parcial y jerarquía
    tipográfica. "Pagar" en la lista y subtítulos por grupo quedan descartados.
- Backend: `@Size` en el nombre del proyecto (`fix/limites-longitud`) y, si el equipo lo aprueba,
  el saldo neto del usuario en la respuesta de la lista.

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

## Detalle del proyecto — después del rediseño

- **Archivos:** `src/pages/SharedProjectDetailPage.tsx` (+ `.css`) y `src/features/shared-project/`
  (`ProjectActions`, `ProjectStatusTable`, `SettleDebtForm`, `ExpenseForm`, `ContributionForm`,
  `MembersList`, `RemoveMemberConfirm`, `AddMemberForm`; reglas del pago en `payment.ts`), más
  `TransactionList` y el `DebtNotice` del Resumen.
- **Fecha:** 2026-11-15 · rama `style/detalle-proyecto` (commit `788ebd8`).
- **Método:** dos evaluaciones aisladas.
  - **A:** revisión de diseño con el código y capturas de Chrome sin interfaz contra una API simulada.
    - Anchos: 320, 375 y 1280 px.
    - Escenarios: debo, me deben, pago completo y parcial, pago desde el Resumen, integrantes, proyecto
      vacío, error, no encontrado, carga, gasto mayor que el fondo y datos extremos.
  - **B:** detector de impeccable sobre el código y sobre la página renderizada (`detect --cdp`), en 9
    escenarios.
- **Modo de la pantalla:** Operate.
- **Resultado:** **29/40, Bueno** (antes 24/40, +5). Cumple la meta de 28 del plan.

### Puntaje de heurísticas (Nielsen)

| # | Heurística | Antes | Ahora | Problema clave que queda |
|---|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 2 | 3 | Gasto, aporte, agregar, eliminar y salir terminan con aviso, y el pago con un cierre propio; la carga tiene la forma del contenido. Mientras se recarga tras eliminar a alguien, su fila sigue a la vista. |
| 2 | Coincidencia con el mundo real | 3 | 2 | "Te deben" muestra el saldo neto, que incluye la parte del fondo: Ana ve "Te deben $ 186.667" cuando Carla, la única deudora, debe $ 113.333. |
| 3 | Control y libertad | 2 | 3 | El pago tiene revisión con "Volver"; los paneles se cierran con Esc, "Cerrar" o el velo; la confirmación de eliminar enfoca "Cancelar". En el celular, "Eliminar" queda arriba de "Cancelar". |
| 4 | Consistencia y estándares | 2 | 3 | El mismo saldo sale como "$ 113.333" en la página y "$ 113.333,33" en el panel. "Pagar" tiene tres estilos según el lugar. |
| 5 | Prevención de errores | 2 | 3 | "50.000" se lee bien y los límites se avisan mientras se escribe; quien no está al día ve la razón en lugar de "Eliminar". El gasto mayor que el fondo mostraba una división imposible (ajustado, ver abajo). |
| 6 | Reconocer antes que recordar | 3 | 3 | El pago llega con a quién y cuánto, también desde el Resumen; el historial dice "Aporte de Beto" y "Entre 3 · $ 80.000 c/u". No dice entre quiénes. |
| 7 | Flexibilidad y eficiencia | 2 | 3 | "Registrar gasto" fijo al pulgar, la pestaña en la URL y `?pagar=` directo al pago. El historial no se filtra ni se agrupa. |
| 8 | Estética y diseño minimalista | 2 | 3 | Una sola cifra protagonista y formularios en paneles. En el celular, quien debe ve el monto cuatro veces; en escritorio todo va en una columna. |
| 9 | Recuperación de errores | 3 | 3 | "Reintentar", "Volver a tus proyectos" en el 404 y aviso de que la acción sí quedó. Si fallan los saldos se pierde el nombre del proyecto. |
| 10 | Ayuda y documentación | 3 | 3 | Reglas antes del error (fondo en $ 0 → aportar; "Podrás salir cuando estés al día"). En un proyecto vacío, la guía solo está en la pestaña Movimientos. |
| **Total** | | **24/40** | **29/40** | **Bueno**: el flujo de pago es lo mejor de la app; la cifra "Te deben" mezcla saldo y deuda. |

### Veredicto de especificidad

**Revisión de diseño:** ahora es de SyncFund también por cómo está compuesta.
- La revisión del pago es un asiento contable que otra app no podría usar sin cambios:
  - "Sale de: Tu billetera (disponible…)", "Llega a: La billetera de Ana" y "Fondo del proyecto:
    No cambia";
  - bajo un filete, "Después del pago: Quedas al día".
  - Es "lo personal y lo compartido, juntos" convertido en interfaz.
- La tabla de Situación conserva su pie de libro mayor.
- Lo genérico está en el escritorio: cifra a la izquierda, botón a la derecha, franja de acciones y
  pestañas a todo el ancho, como cualquier panel de administración.

**Detector automático:**
- **Código:** **0 hallazgos** (`detect --json` sobre la página, `features/shared-project`,
  `features/transactions`, `features/dashboard`, `components/ui` y `components/layout`).
- **Página renderizada:** 9 escenarios (320, 375 y 1280 px; con deuda, integrantes, movimientos,
  vacío, extremo, error y el panel de pago abierto).
  - **Desplazamiento horizontal:** 0 en todos.
  - **Títulos:** un solo `h1` y ningún salto de nivel.
  - `cream-palette`: es el fondo ledger-50 aprobado. Falso positivo, como en el Resumen.
  - `flat-type-hierarchy`: el h1 de `PageHeader` y los h2 miden 18 px. Viene del encabezado que
    comparten todas las pantallas; se resuelve en `style/pulido-final` (`typeset`), no aquí.
  - `straggler`:
    - En la lista "Para quedar al día" con un nombre extremo, y en el mensaje de `LoadError` ("…en
      unos minutos.").
    - Los dos se corrigieron con `text-wrap: pretty`.
- No se usó el overlay en vivo (CLAUDE.md prohíbe el modo live).

### Impresión general

El rediseño resolvió casi todo lo que señaló la crítica anterior:
- la página se ordena por tareas;
- hay una sola cifra;
- los formularios van en paneles;
- el monto es seguro;
- el pago tiene revisión y cierre;
- las reglas se ven antes del error;
- el historial es trazable;
- `?pagar=` cierra el ciclo con el Resumen.

Lo que queda es de concepto: para quien tiene saldo a favor, "Te deben" dice un monto que nadie le
debe. La mayor oportunidad es separar "A tu favor en el fondo" de "Te deben" y darle al cierre del
pago el alivio que merece.

### Lo que funciona

1. **El flujo de pago.**
   - Llega lleno desde la línea "Para quedar al día", la tabla o el Resumen, y los tres usan la misma
     regla (`payment.ts`).
   - Los tres límites se avisan mientras se escribe.
   - El foco sigue cada paso.
   - El cierre usa la respuesta del backend.
   - Una intención de pago que no es una deuda real se ignora.
2. **Reglas antes del error.**
   - "Tiene $ 36.667 a favor. Se podrá eliminar cuando esté al día."
   - Con el fondo en $ 0, el panel de gasto invita a aportar.
   - El aporte muestra lo disponible antes de escribir.
   - "Solo el administrador puede agregar integrantes."
3. **Robusta con cualquier dato.**
   - Sin desborde a 320 px con $ 99.999.999.999 y "María Fernanda de los Ángeles Gómez-Restrepo".
   - Pestañas con el patrón ARIA completo.
   - Estados propios de carga, error, 404 y vacío.

### Problemas prioritarios

#### [P1] "Te deben" muestra el saldo neto, no lo que te deben

- **Qué:** `situationFigure` (`SharedProjectDetailPage.tsx`) titula "Te deben" todo saldo positivo.
  - Ana ve "Te deben $ 186.667", pero solo Carla le debe $ 113.333.
  - Cuando Carla paga, Ana sigue viendo "Te deben $ 73.333" sin ningún deudor.
  - La diferencia es su parte del fondo.
- **Por qué importa:** es la cifra protagonista y rompe "cada cifra dice qué es". Quien comparte
  arriendo puede reclamar de más. El mismo concepto sube al Resumen ("+ Te deben").
- **Corrección:** decisión de vocabulario del equipo (toca "en paz / te deben / debes"). Por ejemplo:
  - la cifra "A tu favor" o "Tu saldo en el fondo";
  - un renglón "Carla te debe $ 113.333" calculado desde `suggestedPayments`.
  - Es solo frontend.
- **Comando sugerido:** `/impeccable clarify`.
- **Resuelto (decisión del equipo, 2026-11-15):**
  - El saldo neto positivo se llama "A tu favor" en el Detalle, en el Resumen ("Billetera + A tu
    favor − Debes = Tienes en total") y en `MoneyStatus`. Ese saldo incluye la parte del fondo que
    aún no se gasta, así que no es una deuda.
  - "Debes" no cambia.
  - Se ajustaron los mismos términos en PRODUCT.md, DESIGN.md y el README.

#### [P2] El cierre del pago se queda corto

- **Qué:**
  - El título y la descripción del panel siguen diciendo "Pagarle a Ana. Sale de tu billetera…".
  - "Pago registrado" pesa lo mismo que "Revisa el pago", y "Quedaste al día." va en texto corrido.
  - El bloque es `role="status"` y además recibe el foco (posible doble lectura).
  - Al cerrar, el anillo de foco cae sobre la cifra.
- **Corrección:**
  - En el cierre, título "Pago hecho" y sin descripción.
  - Titular "Quedaste al día con Ana" en Fraunces y esmeralda, con el monto como renglón secundario.
  - Foco en el titular, no en el bloque.
- **Comando sugerido:** `/impeccable delight`, luego `/impeccable polish`.

#### [P2] "Pagar" en tres lugares y "Para quedar al día" en dos

- **Qué:**
  - Quien debe tiene "Pagar" en la línea de acción y en cada fila con saldo a favor. En el celular,
    los de la tabla son de ancho completo.
  - La lista "Para quedar al día" bajo la tabla repite su pago y agrega los de todos (7 viñetas con
    8 integrantes).
- **Corrección:**
  - "Pagar" compacto en la tabla también en el celular, o solo en la fila sugerida.
  - Quitar de la lista los pagos propios y plegar los del grupo.
- **Comando sugerido:** `/impeccable distill`, luego `/impeccable layout`.

#### [P2] En escritorio la página es una columna larga

- **Qué:**
  - A 1280 px, la frase de pago queda a unos 900 px de su botón.
  - "Aportar al fondo" va sola en una fila.
  - Las pestañas ocultan el historial mientras se mira la tabla.
- **Corrección:**
  - Desde unos 1100 px, Situación y Movimientos lado a lado (pestañas solo en el celular).
  - La línea de pago compacta y "Aportar al fondo" junto a "Registrar gasto".
  - Al planear la rama se decidió dejar pestañas en todos los tamaños para no partir la tabla; vale
    la pena revisarlo con capturas.
- **Comando sugerido:** `/impeccable layout`, luego `/impeccable adapt`.

### Señales de alerta por persona

- **Usuario distraído en el celular:**
  - A favor: "Registrar gasto" queda al pulgar, "50.000" ya no cuesta dinero y todos los botones
    miden al menos 44 px.
  - En contra: en la confirmación de eliminar, "Eliminar" queda arriba de "Cancelar", donde cae el
    pulgar; los "Pagar" de ancho completo se tocan al desplazar.
- **Usuario de lector de pantalla o teclado:**
  - A favor:
    - Un solo `h1`.
    - Pestañas con flechas.
    - El foco va al monto, luego a la revisión y luego al cierre.
    - "Cancelar" recibe el foco en la confirmación y la lista lo recibe al eliminar.
  - En contra:
    - Posible doble lectura del cierre.
    - El nuevo saldo de la cifra no se anuncia.
    - "Fondo" se repite junto a "Fondo disponible" en la tabla del celular.
- **Primera vez:** el proyecto vacío abre en Situación con "$ 0 / Al día". La guía "Primero aporten…"
  está en Movimientos; "Registrar gasto" sí lo redirige a aportar.
- **Estudiante que comparte arriendo:**
  - Ya tiene "Aporte de Beto", "Entre 3 · $ 80.000 c/u" y paga en tres toques desde el Resumen.
  - Le falta saber entre quiénes se dividió cada gasto.
  - Si le deben, "Te deben $ 186.667" le hace reclamar de más.

### Observaciones menores

- La página redondea a pesos ("$ 113.333") y el panel de pago muestra centavos. Conviene una sola
  regla o decir "exactos $ 113.333,33".
- En la revisión y el cierre, la descripción del panel repite el asiento; se puede ocultar.
- Un aporte antiguo sin aportante dice solo "Aporte" en el historial (se decidió no suponer el
  autor), y en la tabla "Aportes antiguos sin aportante". Conviene unificar el término.
- Si fallan los saldos, el título queda "Proyecto compartido" y solo se ofrece "Reintentar".
- A 320 px, la pestaña "Integrantes" toca el borde: se desplaza, pero no se nota que hay más.
- En la tabla del celular, el saldo queda al centro de la fila con `space-between` (ya estaba antes).
- "Estás al día" en tamaño Display parece una cifra.

### Preguntas para el equipo

1. ¿El saldo a favor dentro del fondo es "te deben"? Si alguien sale del proyecto con saldo a
   favor, ¿quién se lo devuelve? Define el vocabulario aquí y en el Resumen.
   - **Resuelta (decisión del equipo, 2026-11-15 y 2026-11-18):** se llama "A tu favor" y no se
     separa; bajo la cifra una línea explica que incluye tu parte del fondo que aún no se gasta.
2. Si la línea "Para quedar al día… Pagar" ya responde por la usuaria, ¿hace falta "Pagar" en la
   tabla, y debe permitir pagarle a quien no está en la sugerencia?
3. ¿El cierre del pago puede permitirse un pequeño gesto (esmeralda, la cifra que cambia a la vista)
   sin dejar de ser un libro mayor sobrio?
4. En escritorio, ¿Situación y Movimientos en dos columnas o pestañas como en el celular?
   - **Resuelta (decisión del equipo, 2026-11-18):** se mantienen las pestañas en todos los
     tamaños; en `style/pulido-final` solo se compacta la franja de acciones.

### Ajustes hechos después de la crítica

El puntaje de arriba es el de antes de estos ajustes.

- **Gasto mayor que el fondo:** ya no se muestra una división que no va a ocurrir; en su lugar dice
  "El fondo alcanza para $ X".
- **Historial:** "c/u" ya no queda solo en otra línea (espacio duro).
- **Avisos de una sola palabra:** `text-wrap: pretty` en la lista "Para quedar al día" y en el
  mensaje de `LoadError`.

### Pendiente (decisiones del equipo, sin hacer en esta rama)

- [x] Vocabulario de "Te deben" contra el saldo a favor en el fondo ([P1]), aquí y en el Resumen:
  ahora dice "A tu favor".
- [ ] Cierre del pago más claro y sin doble lectura ([P2]). En `style/pulido-final`.
- [ ] Un solo "Pagar" visible por deuda y lista del grupo plegable ([P2]). En `style/pulido-final`.
- [x] Dos columnas en escritorio ([P2]): descartado, se mantienen las pestañas (decisión del equipo,
  2026-11-18).
- [ ] Jerarquía tipográfica h1/h2 (`flat-type-hierarchy`), en `style/pulido-final`.

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

## Categorías — después del rediseño

- **Archivos:** `src/pages/CategoriesPage.tsx` y `src/features/categories/`:
  - medición, orden y línea de resumen compartidos con el Resumen en `budget.ts`;
  - carga en `hooks/useCategories.ts` (N + 2 peticiones en dos rondas);
  - `components/CategoryBudgetList` y el panel `CreateCategoryForm` con paso de revisión;
  - estados de la barra en `components/ui/ProgressBar.tsx` y `utils/budget.ts`.
- **Fecha:** 2026-11-16 · rama `style/categorias` (commit `d2afbaf`).
- **Método:** dos evaluaciones aisladas en subagentes separados.
  - A: revisión de diseño con el código y 9 capturas de Chrome sin interfaz contra el backend local
    (320, 375 y 1280 px): lista con los cuatro estados, datos extremos, validaciones del panel,
    revisión con límite sospechoso, aviso tras crear y estado vacío. Error de carga, "Reintentar"
    y "Tu cambio se guardó" verificados aparte.
  - B: detector de impeccable sobre el código y sobre la página renderizada (`detect --cdp`, a 1280
    y 375 px), más desplazamiento horizontal a 320 px.
- **Modo de la pantalla:** Operate.
- **Resultado:** **28/40, Bueno** (antes 20/40, +8). Cumple la meta de 28 del plan, sin margen.

### Puntaje de heurísticas (Nielsen)

| # | Heurística | Antes | Ahora | Problema clave que queda |
|---|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 2 | 3 | Mes nombrado, esqueleto, aviso al crear y "Tu cambio se guardó". La categoría nueva (0 %) queda al final, fuera de la vista en el celular. |
| 2 | Coincidencia con el mundo real | 2 | 3 | "Te quedan", "Te pasaste por" y montos con puntos de miles. "1 categoría pasada" se puede leer como "del mes pasado". |
| 3 | Control y libertad | 1 | 2 | "Volver" en la revisión; el panel se cierra con Esc o "Cerrar". Editar y eliminar siguen fuera (backend y UML). |
| 4 | Consistencia y estándares | 3 | 3 | Misma barra y mismo cálculo que el Resumen. Jerarquía plana: h1, mes y títulos de hoja miden 18 px. |
| 5 | Prevención de errores | 2 | 3 | Nombre repetido (sin importar tildes ni mayúsculas), 0 con guía, tope de la columna y revisión. El aviso de "faltan ceros" solo salta por debajo de $ 10.000. |
| 6 | Reconocer antes que recordar | 2 | 3 | Porcentaje, lo que queda y lo que te pasaste a la vista. La línea de resumen cuenta, pero no nombra cuáles. |
| 7 | Flexibilidad y eficiencia | 1 | 2 | Orden por uso. Sin paso a los movimientos de una categoría ni meses anteriores. |
| 8 | Estética y diseño minimalista | 3 | 3 | Limpia. Cuatro líneas de cabecera empujan la primera barra en el celular. |
| 9 | Recuperación de errores | 2 | 3 | Mensajes concretos y "Reintentar" que recupera. "Te pasaste por $ 50.000" no ofrece un siguiente paso. |
| 10 | Ayuda y documentación | 2 | 3 | Estado vacío que explica para qué sirven y cómo se usan; alcance, pista del límite y "Se mide en". "Te avisa" puede hacer esperar una notificación. |
| **Total** | | **20/40** | **28/40** | **Bueno**: responde "¿cómo voy este mes?" con certeza; falta que lo diga con nombre propio y con jerarquía. |

### Veredicto de especificidad

**Revisión de diseño:** la pantalla dejó de ser "formulario arriba, lista abajo". Es propio de
SyncFund:
- El mes nombrado, calculado en hora local y guardado junto con los datos.
- La línea de resumen por estados, sin sumar límites distintos: no esconde que te pasaste en una
  categoría porque te sobre en otra.
- La barra de tres estados con texto ("Cerca del límite", "Llegaste al límite", "Te pasaste por
  $X"), con el porcentaje real aunque el relleno se corte en 100 %. Por fin se usa el ámbar
  reservado.
- La revisión antes de crear como un asiento de libro mayor ("Se mide en: tu billetera personal").

Lo genérico: la cabecera apila cuatro líneas de peso parecido, y en escritorio la acción se alinea
al borde de la página y no al de la hoja de 768 px (igual que en Proyectos).

**Detector automático:**
- Código: **0 hallazgos** (página, `features/categories` y `ProgressBar`).
- Página renderizada (`detect --cdp`, igual a 1280 y a 375 px): **2 avisos**.
  - `cream-palette` (fondo `ledger-50`): falso positivo, es la identidad de DESIGN.md.
  - `flat-type-hierarchy` (h1 y h2 de 18 px): real y ya conocido; coincide con la revisión de
    diseño. Es el pendiente del `h1` de `PageHeader` para `style/pulido-final`.
- Sin desplazamiento horizontal a 320, 375 ni 1280 px. No se inyectó la superposición visual.

### Impresión general

Antes la pantalla obligaba a restar, no avisaba antes de pasarse y no decía de qué mes eran las
cifras. Ahora cada categoría dice cuánto queda o cuánto te pasaste, las más comprometidas van
primero y crear tiene una revisión que compensa que aún no se pueda editar. Lo que más rinde ahora
es que la línea de resumen nombre las categorías en problema y tenga más peso, y que una alerta
lleve a los gastos de esa categoría.

### Lo que funciona

1. **Certeza sin trampas aritméticas.** El estado se calcula sin redondear (nunca "100 %" sin
   haber llegado), el orden usa la proporción real y el límite 0 se lee como "sin límite" sin
   depender de `alertExcess`.
2. **Una barra accesible y compartida.** `role="progressbar"` con `aria-valuetext`, avisos en tonos
   700 (AA) y rellenos en 500; la misma barra en el Resumen y en Categorías.
3. **Prevención seria mientras no haya edición.** Nombre repetido, 0 con guía, tope de
   `DECIMAL(12,2)`, aviso de límite bajo, revisión y foco que sigue al paso.

### Problemas prioritarios

#### [P2] La línea de resumen cuenta pero no nombra, y no tiene peso

- **Qué:** "1 categoría pasada, 1 en el límite y 1 cerca del límite, de tus 4 con límite" va en
  cuerpo, debajo de un mes en Fraunces del tamaño del h1. "Pasada" es ambiguo.
- **Por qué importa:** es la respuesta a la pregunta de la pantalla; el usuario tiene que mapear el
  conteo a las filas.
- **Corrección:** nombrar hasta 2 o 3 categorías ("Te pasaste en Mercado; Transporte llegó al
  límite y Salidas va cerca"), contar solo cuando haya más, cambiar "pasada" por "en la que te
  pasaste" y darle más peso que al mes.
- **Comando sugerido:** `/impeccable clarify`, luego `/impeccable typeset`.

#### [P2] Exceder o acercarse al límite no lleva a ninguna parte

- **Qué:** las filas no son interactivas y la Billetera no filtra por categoría.
- **Por qué importa:** tras "te pasaste", la pregunta es "¿en qué?".
- **Corrección (solo frontend):** enlace "Ver gastos de Mercado" hacia `/wallet?categoria={id}` y
  filtro en la Billetera con los movimientos que ya carga.
- **Comando sugerido:** `/impeccable shape`.

#### [P2] La fila de estado cambia de forma según el ancho

- **Qué:** a 375 y 320 px, "Te quedan" y los montos bajan de línea en unas filas y en otras no.
- **Por qué importa:** rompe la lectura vertical del libro mayor.
- **Corrección:** por debajo de unos 24 rem, fijar siempre la fila de estado en dos líneas.
- **Nota:** "Llegaste al límite · Te quedan $ 0" se repite, pero es una decisión del equipo para
  esta rama; se conserva.
- **Comando sugerido:** `/impeccable layout`, luego `/impeccable adapt`.

#### [P3] Tras crear, la categoría nueva no se ve

- **Qué:** con 0 % va al final; en el celular queda debajo de la acción fija.
- **Corrección:** desplazar hasta la fila nueva y resaltarla un momento (respetando "reducir
  movimiento").
- **Comando sugerido:** `/impeccable polish`.

#### [P3] El lector de pantalla oye cada cifra tres veces

- **Qué:** montos visibles, `aria-valuetext` completo y la línea de estado.
- **Corrección:** dejar en `aria-valuetext` solo el porcentaje y el estado.
- **Comando sugerido:** `/impeccable harden`.

### Señales de alerta por persona

- **Usuario distraído en el celular:** cuatro líneas de cabecera antes de la primera barra; el
  orden sí le pone arriba la que se pasó.
- **Primera vez:** el estado vacío orienta. La descripción del panel habla de "la barra" antes de
  que exista y da por hecho el límite aunque el campo es opcional.
- **Lector de pantalla y teclado:** aviso con `role="status"` y foco al título de la revisión y,
  tras la primera categoría, al contenido. En contra, la triple lectura de cada fila.
- **Estudiante** (persona de PRODUCT.md): ve "Te quedan $ 30.000 para Salidas" y la noche del 30
  ya no ve $ 0 en todo. Si escribe 30.000 queriendo 300.000, no hay aviso y el error es permanente.

### Observaciones menores

- El carril de la barra (`ledger-100` sobre `paper`, ~1,2:1) apenas se ve con 0 %; el texto lleva
  la información.
- Carga todo o nada: si falla el gasto de una categoría, cae la página (en Proyectos se resolvió
  con "Saldo sin cargar").
- El mes queda fijo si la pestaña sigue abierta al cambiar de mes.
- En la revisión sigue visible la descripción del panel; con límite 0, la pista y el error se
  apilan.
- La nota de la hoja "Sin límite" repite el mes.

### Estado de los problemas de la crítica anterior

| Problema | Estado |
|---|---|
| [P1] Barra invisible y sin semántica | **Resuelto.** `progressbar`, tres estados con texto y tonos 700. Queda el carril de bajo contraste (menor). |
| [P1] Mes en UTC y sin nombre | **Resuelto.** La zona del servidor sigue pendiente para el paso a producción. |
| [P1] Sin edición ni eliminación | **Mitigado** con la revisión, nombres únicos y `MoneyInput`. Fuera de alcance (backend y UML). |
| [P2] Sin cifra protagonista ni orden | **Resuelto en parte.** Orden por uso; la cifra se reemplazó por una línea de estados (decisión del equipo), que aún no tiene peso. |
| [P2] Casos límite sin definir | **Resuelto.** 0 = sin límite, nombres largos, estado vacío con guía y aviso de éxito. |
| 2N + 2 peticiones | **Resuelto en parte.** N + 2 en dos rondas, sin `over-limit`. Una sola llamada requiere backend. |

### Preguntas para el equipo

1. ¿La línea de resumen debe nombrar las categorías en problema y pesar más que el mes?
   - **Resuelta (plan de `style/pulido-final`, 2026-11-18):** nombra hasta tres y pesa más que el mes.
2. ¿Se aprueba el enlace de una categoría a la Billetera filtrada (solo frontend)?
   - **Resuelta (decisión del equipo, 2026-11-18):** sí. El filtro es por categoría y por el mes
     actual, para que coincida con lo gastado que muestra Categorías; un chip "Mercado · Noviembre
     de 2026" con el total filtrado y "Quitar filtro", aplicado a todos los movimientos cargados.
3. ¿Se sube el umbral del aviso de límite bajo, o se muestra siempre el límite en palabras?

### Pendiente (sin hacer en esta rama)

- Los tres P2 y los dos P3 de arriba, para `style/pulido-final` o según lo que decida el equipo.
  - En `style/pulido-final`: los cinco, incluido el enlace a la Billetera filtrada por categoría y
    mes. Queda descartado que el mes se actualice solo con la pestaña abierta.
- Backend: un límite mayor que `DECIMAL(12,2)` responde 500 en vez de 400 (falta `@Max` o
  `@Digits` en `CreateCategoryRequest`); el frontend ya lo impide.
- Backend y UML: editar y eliminar categorías; `alertExcess` diría "excedido" con límite 0; una
  respuesta con todas las categorías y su gasto del mes.

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

## Login — después del rediseño

- **Archivos:** `src/pages/LoginPage.tsx` (ruta `/login`) dentro de
  `src/components/layout/AuthLayout.tsx`, con `Input`, `PasswordInput`, `Button` (`loadingText`),
  `FormError` (con foco) y `useFormErrors` (`showFormError`).
- **Fecha:** 2026-11-18 · rama `style/login-registro` (evaluado en el commit `3d6a030`; las
  correcciones de `ae52379` se anotan abajo).
- **Método:** dos evaluaciones aisladas en subagentes separados.
  - A: revisión de diseño con el código y capturas de Chrome sin interfaz contra una API simulada
    (320, 375 y 1280 px): formulario vacío, enviando, 422, sin conexión y correo precargado desde
    el Registro.
  - B: detector de impeccable sobre el código y sobre la página renderizada
    (`detect --viewport` a 1280, 375 y 320 px), más medidas por CDP: desplazamiento horizontal,
    botón dentro de la pantalla, h1, áreas táctiles y contraste.
- **Modo de la pantalla:** Operate (entrar rápido).
- **Resultado:** **29/40, Bueno** (antes 23/40, +6). Cumple la meta de 28 del plan.

### Puntaje de heurísticas (Nielsen)

| # | Heurística | Antes | Ahora | Problema clave que queda |
|---|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 2 | 3 | "Entrando…" con `aria-busy` y campos de solo lectura. Nada avisa si el backend tarda, y quien llega por una sesión vencida no sabe por qué. |
| 2 | Coincidencia con el mundo real | 3 | 3 | Español natural; el 422 dice "Correo o contraseña incorrectos…". "Un solo saldo real" del titular puede leerse como si billetera y fondo fueran un mismo saldo. |
| 3 | Control y libertad | 2 | 3 | "Mostrar", `replace` al entrar y salida al Registro. Sin recuperación de contraseña (fuera de alcance, y la pantalla lo dice). |
| 4 | Consistencia y estándares | 3 | 3 | h1 en el formulario, tokens y clases compartidas con el Registro. `FormError.css` aún usa tamaño y margen sin token. |
| 5 | Prevención de errores | 2 | 3 | Autocompletado, "Mostrar", `trim` del correo y bordes de campo de 3,4:1. |
| 6 | Reconocer antes que recordar | 3 | 3 | Etiquetas persistentes, sin placeholders y correo precargado desde el Registro. |
| 7 | Flexibilidad y eficiencia | 2 | 3 | `autoComplete` email y current-password, `enterKeyHint` y foco en la contraseña cuando el correo llega escrito. |
| 8 | Estética y diseño minimalista | 3 | 3 | Franja móvil compacta. La línea de apoyo repetía la de la marca (corregido después, ver abajo). |
| 9 | Recuperación de errores | 2 | 3 | El 422 es accionable, conserva lo escrito y recibe el foco. Quien olvidó la contraseña no tiene a dónde ir. |
| 10 | Ayuda y documentación | 1 | 2 | Nota honesta sobre la contraseña, sin un siguiente paso (no hay contacto de soporte definido). |
| **Total** | | **23/40** | **29/40** | **Bueno**: base sólida; quedan la espera larga y la sesión vencida. |

### Veredicto de especificidad

**Revisión de diseño:** en escritorio es propio. El titular en Fraunces sobre azul tinta, el
párrafo con el vocabulario del producto ("aporta al fondo", "quién le debe a quién") y los dos aros
en tonos de tinta tienen voz de autor. El formulario es un login estándar, y eso es lo correcto en
modo Operate. En el celular la marca queda en una franja con el nombre y una línea: neutra, pero ya
no estorba.

**Detector automático:**
- Código (`LoginPage`, `AuthLayout` y componentes de formulario): **0 hallazgos**.
- Página renderizada a 1280, 375 y 320 px: **1 aviso**, `cream-palette` (fondo `ledger-50`). Es un
  falso positivo: es la identidad de DESIGN.md.
- A 320 px el detector marcó como sugerencia (`straggler`) la palabra "lugar." sola en la segunda
  línea de la franja. Se corrigió con `text-wrap: balance` y ya no aparece.
- Medidas por CDP: sin desplazamiento horizontal a 320, 375 ni 1280 px; "Entrar" dentro de la
  pantalla en los tres; un solo h1; ningún enlace ni botón por debajo de 44 px. Contraste: franja
  y párrafo de la marca 9,5:1 (`on-ink-muted`); nota, ayuda y línea de apoyo 6,3:1.
- No se inyectó la superposición visual: la sesión no tenía un navegador visible.

### Impresión general

Antes el panel de marca empujaba el formulario en el celular, la contraseña se escribía a ciegas y
"Credenciales inválidas" no orientaba. Ahora se entra rápido: el formulario y "Entrar" se ven sin
desplazar, el gestor de contraseñas completa los datos, "Mostrar" evita el error de tipeo y el error
dice qué revisar sin borrar nada. Lo que más rinde ahora es explicar las dos situaciones en que el
usuario queda sin contexto: la espera larga y la sesión vencida.

### Lo que funciona

1. **La franja móvil compacta.** El formulario completo y "Entrar" quedan a la vista a 375 × 667 y
   a 320 × 568.
2. **El manejo de errores.** El foco va al error general (`tabIndex=-1` y `role="alert"`), el texto
   es humano y mantiene la decisión de no decir cuál de los dos campos falló, y los datos se
   conservan.
3. **La continuidad desde el Registro.** "Inicia sesión con este correo" llega con el correo escrito
   y el foco en la contraseña.

### Problemas prioritarios

#### [P2] La sesión vencida cae al Login sin explicación

- **Qué:** `apiClient.ts:34-38` borra la sesión y hace `window.location.href = '/login'`; el Login se
  ve igual que un acceso nuevo.
- **Por qué importa:** si la sesión vence a mitad de un registro en el celular, el usuario pierde lo
  escrito y no entiende qué pasó.
- **Corrección:** redirigir con una señal (`/login?motivo=sesion-vencida` o `sessionStorage`) y
  mostrar una nota informativa arriba del formulario: "Tu sesión venció. Vuelve a entrar para
  seguir.". Opcional: volver a la ruta de origen después de entrar.
- **Comando sugerido:** `/impeccable harden`.

#### [P2] Nada avisa si el backend tarda

- **Qué:** "Entrando…" es la única señal, sin límite de tiempo, en un botón desactivado al 60 %.
- **Por qué importa:** Railway puede tardar varios segundos en arrancar; sin aviso, el usuario
  recarga o vuelve a tocar.
- **Corrección:** después de unos 5–6 s, una línea bajo el botón con `aria-live="polite"`: "Está
  tardando más de lo normal; seguimos intentando.". Sirve igual para el Registro.
- **Comando sugerido:** `/impeccable harden`.

#### [P3] En escritorio las dos columnas no comparten la línea de arranque

- **Qué:** marca y formulario se centran cada uno por su cuenta (titular hacia y≈330, "Inicia
  sesión" hacia y≈190); los aros quedan cortados en la esquina.
- **Corrección:** alinear el nombre con el h1, o darle al motivo un tamaño y lugar deliberados.
- **Comando sugerido:** `/impeccable layout`.

### Señales de alerta por persona

- **Usuario distraído en el celular:** si la sesión vence, vuelve a un login sin explicación; con
  mala señal, "Entrando…" sin aviso de demora lo lleva a recargar.
- **Lector de pantalla y teclado:** al enviar, el botón se desactiva y el foco cae al `body`;
  "Entrando…" no se anuncia (`aria-busy` no es una región viva). El error sí se anuncia y recibe el
  foco. "Mostrar" cambia su `aria-label` en vez de usar `aria-pressed` (aceptable).
- **Estudiante** (persona de PRODUCT.md): si olvidó la contraseña, la nota le dice que no puede
  recuperarla, pero no a quién acudir.

### Observaciones menores

- El botón desactivado ("Entrando…" blanco sobre tinta al 60 %) da unos 3,5:1. WCAG exime los
  controles inactivos, pero aquí el texto informa un estado; conviene una variante de carga con
  opacidad completa.
- `FormError.css` usa `0.8125rem` y `1rem` en vez de tokens.
- La nota de la contraseña va antes de "¿No tienes cuenta?": para quien llega por primera vez, el
  Registro queda en tercer lugar.

### Corregido después de la evaluación (commit `ae52379`)

- La línea de apoyo ya no repite la franja: dice "Usa el correo con el que te registraste.".
- La palabra suelta en la franja a 320 px (`text-wrap: balance`).
- En teléfonos bajos (≤ 620 px de alto) la franja queda solo con el nombre.

### Estado de los problemas de la crítica anterior

| Problema | Estado |
|---|---|
| [P1] El panel de marca empuja el formulario y el motivo tapa el texto | **Resuelto.** Franja de unos 80 px en el celular, sin motivo; "Entrar" visible a 320 × 568. |
| [P1] Sin autocompletado ni "Mostrar" | **Resuelto.** `PasswordInput`, `autoComplete` y teclado de correo. |
| [P1] Bordes invisibles y foco débil en `Input` | **Resuelto** en ramas anteriores: `field-border` de 3,4:1 y anillo de foco, también con error. |
| [P2] Estados de envío y error que no orientan | **Resuelto en parte.** "Entrando…", `aria-busy`, foco al error, 422 reescrito y texto de conexión unificado. Falta el aviso de demora. |
| [P2] Texto que promete de más y motivo esmeralda | **Resuelto.** Sin "al instante"; motivo en dos tonos de tinta con tokens; DESIGN.md corregido. |
| Estilos en línea, placeholder del correo, enlace pequeño | **Resuelto.** Clases con tokens, sin placeholder, enlace de 44 px. |

### Preguntas para el equipo

1. ¿Se quiere un correo de contacto de soporte para quien olvida la contraseña? Si se define uno
   real, se agrega a la nota del Login; hoy la nota solo dice que no se puede recuperar desde la app.
   - **Resuelta (decisión del equipo, 2026-11-18):** no habrá correo de soporte por ahora.
2. ¿"Un solo saldo real" es exacto? Billetera y fondo son saldos separados, aunque el Resumen los
   sume en una cifra.
   - **Resuelta (decisión del equipo, 2026-11-18):** el titular es "Tu billetera y tus proyectos, un
     solo saldo real." (rama 8) y es exacto, porque el Resumen suma billetera y proyectos.
3. ¿Se aprueban el aviso de sesión vencida y el de demora? Tocan `apiClient` (toda la app), así que
   irían en `style/pulido-final`.
   - **Resuelta (decisión del equipo, 2026-11-18):** se aprueban los dos. "Tu sesión venció" solo
     sale si había una sesión guardada, nunca por una respuesta de `/auth/login` o `/auth/register`.

### Pendiente (sin hacer en esta rama)

- Los dos P2 (sesión vencida y aviso de demora) y el P3 de composición, para `style/pulido-final`.
  Los dos avisos quedaron aprobados por el equipo (2026-11-18).
- Recuperación de contraseña: fuera de alcance por ahora.

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

---

## Registro — después del rediseño

- **Archivos:** `src/pages/RegisterPage.tsx` (ruta `/register`) dentro de `AuthLayout`, con los
  mismos componentes que el Login más `Input.errorAction` (enlace bajo el error) y los validadores
  de longitud de `utils/validation.ts`. La bienvenida está en `src/pages/DashboardPage.tsx`.
- **Fecha:** 2026-11-18 · rama `style/login-registro` (evaluado en el commit `3d6a030`; las
  correcciones de `ae52379` se anotan abajo).
- **Método:** el mismo del Login. A, con el código y capturas contra una API simulada (formulario,
  errores de longitud, correo duplicado, enlace al Login y llegada al Resumen con el aviso); B, con
  el detector sobre el código y la página renderizada y medidas por CDP.
- **Modo de la pantalla:** Operate (crear la cuenta), con papel de primera impresión.
- **Resultado:** **32/40, Bueno** (antes 23/40, +9). Cumple la meta de 28 del plan.

### Puntaje de heurísticas (Nielsen)

| # | Heurística | Antes | Ahora | Problema clave que queda |
|---|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 3 | 3 | "Creando tu cuenta…" y el aviso "Tu cuenta quedó creada." al llegar. Nada avisa si el backend tarda. |
| 2 | Coincidencia con el mundo real | 3 | 3 | Claro. "Unirte a uno" prometía una acción que no existe (corregido después, ver abajo). |
| 3 | Control y libertad | 3 | 3 | "Mostrar", salida al Login y `replace`. |
| 4 | Consistencia y estándares | 2 | 3 | Mismo sistema que el Login. Con el correo duplicado se ven dos enlaces "Inicia sesión" y el espacio bajo el error es mayor. |
| 5 | Prevención de errores | 2 | 3 | Regla visible, `newEmail` estricto, `new-password`, `trim` y límites de la base. `maxLength` cortaba en silencio lo pegado (corregido después). |
| 6 | Reconocer antes que recordar | 2 | 4 | Etiquetas, regla persistente en la ayuda (y en `aria-describedby`), autocompletado, y el correo duplicado pasa escrito al Login. |
| 7 | Flexibilidad y eficiencia | 1 | 3 | El gestor genera y guarda la contraseña; `enterKeyHint` y mayúscula inicial en el nombre. |
| 8 | Estética y diseño minimalista | 3 | 3 | Limpio. Con el error de largo, la ayuda y el error de la contraseña quedan apilados. |
| 9 | Recuperación de errores | 2 | 4 | El correo duplicado aparece bajo el campo, con foco y con una salida que conserva el correo; los errores se borran al escribir. |
| 10 | Ayuda y documentación | 2 | 3 | El texto anticipa lo que pasa y el Resumen nuevo ofrece "Registra tu primer ingreso" y "Crea un proyecto". Aviso de tratamiento de datos fuera de alcance. |
| **Total** | | **23/40** | **32/40** | **Bueno**: un recorrido pensado para SyncFund; queda pulido de texto y de casos límite. |

### Veredicto de especificidad

**Revisión de diseño:** propio en lo que importa. La línea de apoyo explica el modelo del producto
(la billetera se crea sola y a los proyectos te agrega quien los administra), el correo duplicado
se convierte en continuidad hacia el Login, y la llegada al Resumen con el aviso y los primeros
pasos cierra el recorrido. Ya no es un formulario de plantilla.

**Detector automático:**
- Código (`RegisterPage`, `AuthLayout` y componentes de formulario): **0 hallazgos**.
- Página renderizada a 1280, 375 y 320 px: **1 aviso**, `cream-palette` (falso positivo, identidad
  de DESIGN.md). El `straggler` de la franja a 320 px se corrigió, como en el Login.
- Medidas por CDP: sin desplazamiento horizontal; un h1; áreas táctiles de 44 px. A 320 × 568,
  "Crear cuenta" quedaba 11 px por debajo del borde; con la franja solo con el nombre en teléfonos
  bajos (`ae52379`) queda dentro (borde inferior en 552 px). La ayuda "Mínimo 6 caracteres" da
  6,3:1.

### Impresión general

El Registro fallaba al crear la contraseña (sin gestor, regla escondida) y justo después de crear
la cuenta (un Resumen vacío sin bienvenida). Las dos puntas quedaron resueltas: la contraseña tiene
apoyo y regla visible, el correo duplicado tiene salida, y la cuenta nueva llega a un Resumen que
confirma y dice qué hacer. El mayor salto está en el final del recorrido.

### Lo que funciona

1. **El correo duplicado como continuidad.** Error bajo el campo, foco, y "Inicia sesión con este
   correo" lleva al Login con el correo escrito (por estado de navegación, no por la URL).
2. **Límites coherentes con la base y con BCrypt.** Nombre 100, correo 150 y contraseña de 72
   bytes, con mensajes en español; ningún campo corta en silencio.
3. **Un cierre con bienvenida y siguiente paso.** El aviso "Tu cuenta quedó creada." sale una sola
   vez y no se repite al recargar; el Resumen ofrece las dos primeras acciones.

### Problemas prioritarios

#### [P2] Nada avisa si la creación tarda, y un reenvío confunde

- **Qué:** como en el Login, pero aquí, si el usuario recarga y vuelve a enviar, el backend ya creó
  la cuenta y responde "Ya hay una cuenta con este correo." sobre su propia cuenta.
- **Corrección:** el mismo aviso de demora que en el Login. El enlace "Inicia sesión con este
  correo" ya rescata el caso.
- **Comando sugerido:** `/impeccable harden`.

#### [P3] La ayuda y el error de la contraseña se apilan, con un texto técnico

- **Qué:** "Mínimo 6 caracteres" y debajo "La contraseña puede tener máximo 72 caracteres (las
  tildes y la ñ cuentan doble)". Un emoji ocupa 4 bytes, así que "cuentan doble" no es exacto.
- **Corrección:** con error, ocultar la ayuda en `PasswordInput`, o reformular: "Es demasiado
  larga. Usa una más corta (máximo 72; las tildes, la ñ y los emojis ocupan más)."
- **Comando sugerido:** `/impeccable clarify`.

#### [P3] Ritmo del estado de correo duplicado

- **Qué:** el enlace del error más el margen del campo dejan un hueco mayor antes de "Contraseña", y
  se ven dos enlaces "Inicia sesión".
- **Corrección:** compensar el margen del campo cuando hay `errorAction`; ocultar el enlace del pie
  mientras se ve el del error.
- **Comando sugerido:** `/impeccable polish`.

### Señales de alerta por persona

- **Primera vez:** la línea de apoyo, la regla visible y la bienvenida lo guían bien.
- **Lector de pantalla:** la ayuda se anuncia con el campo y el error de duplicado recibe el foco
  con la salida al lado. Como en el Login, el foco cae al `body` mientras envía.
- **Estudiante a quien un compañero va a agregar al proyecto del arriendo** (persona de
  PRODUCT.md): la pantalla ahora le dice que quien administra el proyecto lo agrega con este
  correo, así que sabe que debe usar el mismo que le dio.

### Observaciones menores

- El mínimo de 6 caracteres es bajo para una app de dinero sin recuperación de contraseña (regla
  del backend).
- "Correo" podría ser "Correo electrónico" para lectores de pantalla (afecta a todos los
  formularios; pulido final).

### Corregido después de la evaluación (commit `ae52379`)

- "Unirte a uno" → "Para entrar a un proyecto compartido, quien lo administra te agrega con este
  correo." (la app no tiene una acción para unirse).
- Nombre y correo sin `maxLength`: los límites los dicen los validadores, como en la contraseña.
- "Crear cuenta" visible sin desplazar a 320 × 568 y sin palabra suelta en la franja.

### Estado de los problemas de la crítica anterior

| Problema | Estado |
|---|---|
| [P1] La contraseña nueva no tiene apoyo y su regla se esconde | **Resuelto.** `new-password`, "Mostrar" y la regla como ayuda visible y accesible. |
| [P1] Sin límites de longitud en ninguna capa | **Resuelto en el frontend.** El `@Size` de `RegisterUserRequest` (nombre 100, correo 150, contraseña 72) sigue pendiente en el backend. |
| [P1] "Correo ya registrado" lejos del campo y sin salida | **Resuelto** solo en el frontend, sin cambiar el contrato del 422. |
| [P2] Sin bienvenida ni primer paso | **Resuelto.** Aviso al llegar y estado de usuario nuevo en el Resumen. |
| [P3] Subtítulo pobre y estilos en línea | **Resuelto.** Texto que explica la billetera y los proyectos, con clases y tokens. |

### Preguntas para el equipo

1. ¿Se sube el mínimo de la contraseña (cambio de backend) en una app que maneja saldos y no
   permite recuperar la clave?
   - **Resuelta (decisión del equipo, 2026-11-18):** sí, a 8 caracteres. Es backend: va en la rama
     de `@Size` (anotado en "Fuera del rediseño" de `plan-rediseno.md`).
2. ¿Sobra el enlace "Inicia sesión" del pie mientras se muestra "Inicia sesión con este correo"?
   - **Resuelta (plan de `style/pulido-final`, 2026-11-18):** sí; el del pie se oculta mientras se
     ve el del error.

### Pendiente (sin hacer en esta rama)

- El P2 de demora (junto con el del Login) y los dos P3, para `style/pulido-final`.
- Backend: `@Size` en `RegisterUserRequest` (anotado en `plan-rediseno.md`), con el mínimo de la
  contraseña en 8 caracteres.
- Aviso de tratamiento de datos (Ley 1581 de 2012): fuera de esta rama.

---

## Crítica final

- **Fecha:** 2026-11-18 · rama `docs/cierre-rediseno`, sobre el código de `develop` al terminar el
  rediseño (commit `3211070`, PR #35). Esta rama no cambia la app.
- **Método:** `/impeccable critique`, con dos evaluaciones aisladas en subagentes separados.
  - **A (revisión de diseño):** un subagente por pantalla, que puntuó sin leer las críticas
    anteriores y solo después revisó qué se resolvió. Usó capturas de Chrome sin interfaz contra
    la API simulada a 320, 375–393 y 1280 px, con los escenarios normal, usuario nuevo, datos
    extremos y listas largas (y error donde aplica).
  - **B (detector):** `impeccable detect` sobre el código de cada pantalla y de
    `src/components/`, y sobre la página renderizada por CDP a 1280 y 375 px. No se inyectó la
    capa visual del detector (no había un navegador visible para el equipo).
- **Datos:** la API simulada de las capturas, nunca la base de datos local.

### Resultado

| Pantalla | Final | Banda | P0 | P1 | P2 | P3 | Detector (código / página) |
|---|---|---|---|---|---|---|---|
| Resumen | 29/40 | Bueno | 0 | 0 | 3 | 1 | 0 / 0 reales |
| Billetera personal | 28/40 | Bueno | 0 | 0 | 3 | 2 | 0 / 1 real (menor) |
| Proyectos compartidos | 30/40 | Bueno | 0 | 0 | 2 | 2 | 0 / 0 reales |
| Detalle del proyecto | 29/40 | Bueno | 0 | 0 | 3 | 1 | 0 / 0 reales |
| Categorías | 29/40 | Bueno | 0 | 0 | 2 | 2 | 0 / 0 reales |
| Login | 30/40 | Bueno | 0 | 0 | 1 | 3 | 0 / 0 reales |
| Registro | 32/40 | Bueno | 0 | 0 | 2 | 2 | 0 / 0 reales |

- Todas las pantallas quedan en la banda "Bueno" y por encima de la meta de 28/40; ninguna tiene
  problemas P0 ni P1. El promedio pasó de 21.6/40 antes del rediseño a 29.6/40.
- **Detector:** 0 hallazgos en el código (también con `--no-config`). En las páginas, 15 avisos:
  14 son `cream-palette` sobre el fondo `ledger-50`, que es la regla "Paper Ground" de
  `DESIGN.md` y no un error; el único real es `first-viewport-column-overflow` en la Billetera de
  escritorio (la columna de Meta y Colchón no queda fija mientras se recorre la lista larga).
- **Lo que más pesa en los puntajes:** "Flexibilidad y eficiencia" y "Ayuda y documentación" son
  las heurísticas más bajas en casi todas las pantallas (listas largas sin filtro, sin forma de
  editar lo registrado y el modelo fondo/billetera explicado solo con frases sueltas). Varias
  dependen del backend (editar y eliminar movimientos y categorías).
- **Regresión encontrada:** el pulido final dejó mal anidadas unas reglas de
  `features/shared-project/components/ProjectStatusList.css`. En escritorio, la flecha de los
  renglones de proyecto (Resumen y Proyectos) queda siempre en azul acero y corrida 2 px, y ya no
  reacciona al pasar el mouse. Está anotada en "Estado al cierre del rediseño" de
  `plan-rediseno.md` para corregirla en una rama `fix/`.
- **Pendientes:** los P2 y P3 de abajo se resumen, junto con lo de backend y producción, en
  "Estado al cierre del rediseño" de `plan-rediseno.md`.


### Resumen

- **Archivos:** `src/pages/DashboardPage.tsx` (+ `DashboardPage.css`) y `src/features/dashboard/`: `summary.ts`, `hooks/useDashboard.ts`, `components/SummaryLedger.tsx`, `components/DebtNotice.tsx`, `components/BudgetAlerts.tsx`. Usa también `ProjectStatusList.tsx` y `TransactionForm.tsx`.
- **Resultado:** **29/40, Bueno** (inicial 18/40 · después de su rama 28/40).
- **Escenarios revisados:** normal con deuda (320, 393 y 1280 px, con el panel "Registrar movimiento" abierto a 393); normal sin deuda ("No debes nada en tus proyectos"); un solo proyecto (375 y 1280); usuario nuevo (375 y 1280); datos extremos (320 y 1280); lista larga (1280, 34 proyectos); carga (esqueletos) y error de la cifra; flujo "Pagar" hasta el panel de pago del Detalle. Sin desplazamiento horizontal en ningún ancho.
- **Detector (B):** 0 hallazgos en el código; en la página, solo `cream-palette` sobre el fondo `ledger-50` (falso positivo: es la regla "Paper Ground").

#### Puntaje de heurísticas (Nielsen)

| # | Heurística | Puntaje | Hallazgo clave |
|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 3 | Esqueletos con la forma de la cifra, la cuenta y las hojas; aviso al guardar; página activa marcada. El Resumen no vuelve a consultar solo (no hay `setInterval` ni `visibilitychange` en `useDashboard.ts`) ni dice cuándo se actualizó la cifra. |
| 2 | Coincidencia con el mundo real | 3 | Vocabulario del producto: "A tu favor", "Debes", "incluye colchón", "Te pasaste por". Pero "Tienes en total" suma "A tu favor", que es dinero del fondo que todavía no se puede gastar. |
| 3 | Control y libertad | 3 | El panel se cierra con Esc, "Cerrar" o el velo, y abre con el foco en el monto. Al reabrirlo empieza vacío (a propósito). |
| 4 | Consistencia y estándares | 3 | El h1 usa `--text-headline`; "Pagar" es secundario y "Registrar movimiento" es la única acción principal. "+ A tu favor $ 0" va en negrita y "− Debes $ 0" atenuado. |
| 5 | Prevención de errores | 3 | La cifra es todo o nada, sin totales parciales. El aviso de deuda no advierte que la billetera no alcanza: se descubre dentro del panel de pago. |
| 6 | Reconocer antes que recordar | 3 | Se ve a quién, cuánto y en qué proyecto se debe; "Pagar" abre el Detalle con el pago ya lleno. No se explica que "A tu favor" incluye la parte propia del fondo. |
| 7 | Flexibilidad y eficiencia | 3 | Registrar a un toque (botón fijo en el celular) y pagar a dos toques más la revisión. El panel siempre abre en Gasto. |
| 8 | Estética y diseño minimalista | 3 | Sobrio y fiel al libro mayor, una sola cifra protagonista. "Tus proyectos" no tiene tope (34 renglones, unos 2.700 px) y "Ver todos" aparece aunque ya se vean todos. |
| 9 | Recuperación de errores | 3 | Errores de la cifra y del presupuesto por separado, con Reintentar, y aviso de "el cambio sí quedó" si falla la recarga. Con error de la cifra no hay otra salida. |
| 10 | Ayuda y documentación | 2 | La cuenta con signos explica de dónde sale el total; nada explica qué es el colchón ni por qué "A tu favor" no es plata disponible. |
| **Total** | | **29/40** | **Bueno** |

#### Veredicto de especificidad

Lo que dice y cómo lo cuenta es de SyncFund: la suma de libro mayor "Billetera + A tu favor − Debes" (con "más" y "menos" para el lector de pantalla), "incluye colchón $ 200.000", el aviso "Debes $ 100.000 a Laura Gómez · Arriendo apartamento" con un "Pagar" que llega al pago ya lleno y las etiquetas Debes / A tu favor / Al día por proyecto. En escritorio la composición (cifra, indicadores, aviso y dos hojas con "Ver todos" / "Ver categorías") todavía se parece a un dashboard; la salvan Fraunces, el papel cálido y la ausencia de sombras y gráficos de adorno.

#### Lo que funciona

- **La cifra se puede comprobar a ojo.** `summary.ts` redondea cada parte antes de sumar, así que $ 1.434.000 + $ 200.000 − $ 100.000 = $ 1.534.000 cuadra siempre, incluso con montos de 12 cifras.
- **"Pagar" cumple lo que promete.** `DebtNotice.tsx` enlaza a `/projects/{id}?pagar={toUserId}` y el Detalle abre "Pagarle a …" con el monto sugerido. El botón es secundario y compacto: no compite con "Registrar movimiento".
- **Resiste los datos extremos y los estados.** Sin desborde a 320 px con nombres largos, árabe, cirílico o montos de 12 dígitos; el usuario nuevo ve dos primeros pasos en vez de un $ 0; "Estás al día" solo aparece si todo está en cero.

#### Problemas pendientes

- **[P2] "Tienes en total" suma dinero que no se puede gastar.** Con datos extremos la cifra dice $ 100.000.001.500 mientras la billetera tiene $ 1.500. Arreglo sin cambiar la cifra aprobada: una nota bajo "+ A tu favor" en `SummaryLedger.tsx` ("tu parte del fondo y lo que te deben; no está en tu billetera"), o una línea "Puedes gastar $ X". Comando: `/impeccable clarify`.
- **[P2] La lista "Tus proyectos" no tiene tope.** Con 34 proyectos la hoja mide unos 2.700 px. Arreglo: mostrar los primeros 5 de `summary.projects` (ya ordenados) y "Ver los 34 proyectos"; esconder "Ver todos" si no hay más. Comando: `/impeccable layout`.
- **[P2] El aviso de deuda no anticipa que la billetera no alcanza.** Arreglo en `DebtNotice.tsx`: si la deuda supera el disponible, "Tu billetera tiene $ X; registra un ingreso antes de pagar" (el pago parcial sigue disponible). Comando: `/impeccable clarify`.
- **[P3] La cifra no se actualiza sola.** Si un compañero paga, la deuda no desaparece hasta recargar. Arreglo en `useDashboard.ts`: recargar al volver a la pestaña (`visibilitychange`) y quizá cada 60 s mientras esté visible. Comando: `/impeccable harden`.

#### Carga cognitiva y recorrido emocional

Falla 1 punto del checklist ("pocas opciones"): con deuda, en escritorio hay unas 12 opciones a la vista, bien agrupadas por hojas; con 34 proyectos la hoja se vuelve un muro. Pico: el total y, debajo, el aviso terracota con a quién y cuánto. Final: "Pagar" lleva al panel ya lleno. Valle: la billetera insuficiente, que se descubre tarde. El usuario nuevo arranca con dos acciones claras, aunque en escritorio queda media pantalla vacía.

#### Señales de alerta por persona

- **Estudiante que comparte arriendo** (PRODUCT.md): ve la deuda sin buscarla y paga con dos toques; si le deben, puede creer que tiene más plata disponible; si el compañero paga mientras tiene la app abierta, la deuda no desaparece sola.
- **Usuario distraído en el celular:** "Registrar movimiento" fijo al pulgar y "Pagar" secundario; el panel siempre abre en "Gasto", así que quien anota su sueldo cambia el tipo.
- **Lector de pantalla:** la cuenta se oye con "más" y "menos", el `aria-label` de "Pagar" dice a quién, cuánto y dónde; el nuevo total después de guardar no se anuncia.

#### Observaciones menores

- "+ A tu favor $ 0" en negrita y "− Debes $ 0" atenuado: los dos ceros deberían verse igual.
- A 320 px el título "Presupuesto del mes" se parte en dos líneas junto a "Ver categorías".
- Con error de la cifra podría enlazar a Billetera o Proyectos.
- En el celular, "Tus proyectos" empieza bajo el pliegue.

#### Estado de lo pendiente de la crítica anterior

- [P1] "Pagar" promete un pago y entrega una navegación: **resuelto** (`?pagar=` abre el pago ya lleno).
- [P2] Dos acciones principales del mismo peso: **resuelto**.
- [P2] "Estás al día" y "Tienes en total": **parcial** ("No debes nada en tus proyectos" ya separa el caso con saldo a favor; falta aclarar que "A tu favor" no se puede gastar).
- [P2] En el celular la deuda se repite y los proyectos quedan bajo el pliegue: **sigue igual**.
- [P3] Título plano y composición de dashboard: **parcial** (h1 con `--text-headline`).
- Margen negativo cambiado por `gap` en `.dashboard__top`: **resuelto**.

### Billetera personal

- **Archivos:** `src/pages/PersonalWalletPage.tsx` y `src/features/personal-wallet/` (cálculos en `walletFigures.ts`; hojas `WalletLedger`, `SavingsGoalSheet` y `CushionSheet`; paneles `TransactionForm`, `SavingsGoalForm` y `CushionForm`), además de `src/features/transactions/components/TransactionList.tsx` y `src/components/ui/ProgressBar.tsx`.
- **Resultado:** **28/40, Bueno** (inicial 20/40 · después de su rama 28/40). La rama 9a quitó casi todo lo pendiente de la crítica anterior, pero no movió el puntaje: siguen sin poder corregirse los movimientos, el historial largo cuesta recorrerlo y el disponible sale dos veces.
- **Escenarios revisados:** normal (1280, 393 y 320 px), usuario nuevo (1280 y 393), datos extremos (1280 y 320), historial largo (1280, 236 movimientos) y los paneles "Registrar movimiento" (con un gasto mayor que el disponible), "Apartar o liberar colchón" y "Meta de ahorro". Sin desplazamiento horizontal.
- **Detector (B):** 0 hallazgos en el código; en la página de escritorio, `first-viewport-column-overflow` en `PageColumns` (`main-aside`): la lista de movimientos mide el doble de la ventana y la columna de Meta y Colchón no es `sticky`, así que queda vacía al bajar (real, menor). `cream-palette` es falso positivo.

#### Puntaje de heurísticas (Nielsen)

| # | Heurística | Puntaje | Hallazgo clave |
|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 3 | Carga con forma, avisos con el monto ("Apartaste… tu disponible quedó en…") y vista previa en vivo en los tres paneles. El movimiento recién registrado no se marca en la lista; si falla la cuota, desaparece sin aviso. |
| 2 | Coincidencia con el mundo real | 3 | "Disponible + Colchón = Total en tu billetera" y "Ahorro del mes" se leen como un asiento contable; "Ritmo de la meta" ya no se confunde con lo que falta. "Disponible" aparece como etiqueta de la cifra y otra vez como primer renglón de la suma. |
| 3 | Control y libertad | 2 | Los paneles se cierran con "Cerrar", Esc o el velo; el filtro trae "Quitar filtro". Un movimiento mal registrado no se puede editar ni borrar (falta en el backend), y cambiar Gasto/Ingreso borra lo escrito (decisión del equipo). |
| 4 | Consistencia y estándares | 3 | Mismos `Sheet`, `Panel`, `MoneyInput` y `EmptyState` que el resto; el total sale del mismo `walletFigures` que usa el Resumen. |
| 5 | Prevención de errores | 3 | El límite se ve antes de escribir, avisa en vivo si te pasas y deshabilita la opción imposible. Cuando el gasto no alcanza, no dice que se puede liberar el colchón. |
| 6 | Reconocer antes que recordar | 3 | Categoría en cada fila, meta precargada, límites visibles en el panel. Aportes y pagos no enlazan a su proyecto. |
| 7 | Flexibilidad y eficiencia | 2 | Acción fija al pulgar, tandas de 8 filas en el celular y filtro desde Categorías. Con 236 movimientos son 11 clics de "Ver más", sin encabezados por mes, búsqueda ni filtro propio. |
| 8 | Estética y diseño minimalista | 3 | Una sola cifra protagonista, hojas planas y el colchón en su hoja. Con meta cumplida el mensaje se repite tres veces. |
| 9 | Recuperación de errores | 3 | Error de carga con Reintentar y sin cifras viejas; el error del gasto dice el disponible. La falla de la cuota sigue siendo silenciosa. |
| 10 | Ayuda y documentación | 3 | El colchón y el ahorro del mes se explican donde se ven; los estados vacíos dan el siguiente paso. No se dice qué es el "Ritmo de la meta". |
| **Total** | | **28/40** | **Bueno** |

#### Veredicto de especificidad

Lo propio de SyncFund está en las cuentas: la suma con filete "Disponible + Colchón = Total en tu billetera", el asiento del mes "Ingresos − Gastos − Aportes a proyectos = Ahorro del mes", que separa lo personal de lo compartido, y la vista previa del colchón ("Tu disponible quedará en… y tu colchón en…"). La composición sí es intercambiable: título con cifra a la izquierda, botón suelto a la derecha y tres hojas en dos columnas; a 1280 px el botón queda a unos 470 px de la cifra.

#### Lo que funciona

- **La primera visita está bien resuelta.** Solo "$ 0" como cifra, una sola acción llena (la barra fija) y la hoja del colchón explica en vez de ofrecer una acción que no lleva a nada.
- **Los paneles impiden el error en vez de reportarlo.** Al escribir un gasto mayor que el disponible, el campo pasa a terracota con "Tu disponible es $ 1.234.000; no alcanza para este gasto"; el colchón muestra sus dos límites antes de escribir y el resultado antes de confirmar; el botón dice qué va a pasar ("Registrar gasto", "Apartar").
- **En el celular la meta queda cerca.** Con 8 filas, la meta queda a unos 1.100 px de desplazamiento a 393 px (antes unos 1.700), y "Cumpliste tu meta de noviembre" le da un momento propio.

#### Problemas pendientes

- **[P2] El historial largo no se puede recorrer.** Con 236 movimientos, "Ver más" de 20 en 20 obliga a unos 11 clics, sin encabezados de mes, búsqueda ni filtro por mes; para saber cuánto gastó en octubre hay que contar a mano. Arreglo: un selector de mes que reuse `filterByCategoryMonth` sin categoría, o encabezados de mes con subtotal en `TransactionList`. Comando: `/impeccable layout`.
- **[P2] "Disponible" aparece dos veces seguidas.** La cifra grande y debajo el renglón "Disponible $ 1.234.000", también en lector de pantalla. Arreglo: dejar en la suma solo "+ Colchón … = Total en tu billetera …", con la cifra grande como primer sumando. Comando: `/impeccable distill`.
- **[P2] El gasto que no alcanza termina en un callejón sin salida.** Con colchón apartado, el error solo dice "no alcanza". Arreglo: si el monto cabe en disponible + colchón, agregar "Puedes liberar $ X de tu colchón" con un enlace al panel del colchón. Comando: `/impeccable clarify`.
- **[P3] La meta cumplida se anuncia tres veces.** Titular, etiqueta del mes y "Meta cumplida" junto a la barra en 80 px. Arreglo: ocultar uno de los tres. Comando: `/impeccable polish`.
- **[P3] En escritorio el botón principal queda lejos de la cifra.** Arreglo: alinear la acción con la línea de la cifra o compactar el encabezado. Comando: `/impeccable layout`.

#### Carga cognitiva y recorrido emocional

Falla 1 punto del checklist (memoria de trabajo: sumar mentalmente las filas de un mes anterior). Ningún punto de decisión con más de 4 opciones. Pico: el titular esmeralda de meta cumplida y el aviso con el saldo resultante. Valle: el gasto que no alcanza aunque haya colchón. Final de cada acción: aviso con el monto y la cifra actualizada.

#### Señales de alerta por persona

- **Estudiante que comparte arriendo** (PRODUCT.md): ve "Aporte a «Arriendo apartamento»" como fila suelta, sin enlace al proyecto. Los aportes restan del "Ahorro del mes" (decisión del equipo) sin que la pantalla lo explique. Ese renglón se reconoce comparando la descripción con un texto fijo (`walletFigures.ts`): un gasto escrito a mano con ese formato se contaría como aporte (ya anotado como "Marcar el origen de cada movimiento" en el plan).
- **Usuario distraído en el celular:** barra fija y foco automático en el monto; si se equivoca de monto, no puede corregirlo.
- **Datos extremos (320 px):** montos de 12 cifras bajan a su línea sin desbordar; una categoría sin espacios se corta a la fuerza.

#### Observaciones menores

- El colchón todavía se explica en tres textos (dos en la hoja y uno en el panel).
- "Ritmo de la meta" no dice que es la meta repartida en el mes.
- La selección Gasto/Ingreso usa el mismo azul para los dos tipos; el color propio solo aparece al escribir el monto.

#### Estado de lo pendiente de la crítica anterior

- Cuota como ritmo fijo y oculta con la meta cumplida: **resuelto**.
- Nota del colchón plana y en su hoja: **resuelto**; las explicaciones bajaron de cuatro a tres: **parcial**.
- Primera visita con una sola acción principal: **resuelto**.
- Tandas de 8 filas en el celular y fechas sin el año en curso: **resuelto**.
- Titular de meta cumplida: **resuelto** (ahora con redundancia, P3).
- "Disponible" dos veces cuando hay colchón: **sigue igual**.
- Encabezado de escritorio con hueco: **sigue igual**.
- Falla silenciosa de la cuota, enlaces de aportes y pagos a su proyecto, y editar o borrar movimientos (backend): **sigue igual**.

### Proyectos compartidos

- **Archivos:** `src/pages/SharedProjectsPage.tsx` (+ `.css`); en `src/features/shared-project/`: `components/ProjectStatusList.tsx` y `.css`, `components/CreateProjectForm.tsx`, `projectLines.ts`, `hooks/useSharedProjects.ts`.
- **Resultado:** **30/40, Bueno** (inicial 23/40 · después de su rama 29/40).
- **Escenarios revisados:** normal (320, 393 y 1280 px), usuario nuevo (393 y 1280), datos extremos (320, 393 y 1280: nombre sin espacios, nombre de una letra, montos de 12 cifras, acreedor con nombre largo), lista larga (393: 34 proyectos), panel "Crear proyecto" abierto y con el error de nombre obligatorio. Sin desplazamiento horizontal. Carga, falla parcial de saldos y error de carga revisados en el código.
- **Detector (B):** 0 hallazgos en el código; en la página, solo `cream-palette` (falso positivo). La regresión de la flecha la encontró la revisión A comprobando el estilo calculado en Chrome; el detector no la ve.

#### Puntaje de heurísticas (Nielsen)

| # | Heurística | Puntaje | Hallazgo clave |
|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 3 | Los renglones salen apenas llega la lista, con "Cargando saldo" en cada uno y un fundido al llegar la cifra. La línea de resumen espera a tener todos los saldos. Al crear hay aviso y se abre el Detalle. La flecha del renglón dejó de reaccionar al pasar el mouse (regresión del CSS). |
| 2 | Coincidencia con el mundo real | 3 | "Debes en 1 de tus 4 proyectos", "Le debes a Laura Gómez", "A tu favor", "Al día". "A tu favor" se explica solo en el Detalle, como decidió el equipo. |
| 3 | Control y libertad | 3 | El panel se cierra con "Cerrar", Esc o el velo, y arranca limpio. Si la lista no carga, no hay forma de crear un proyecto. |
| 4 | Consistencia y estándares | 3 | Renglón y orden iguales a los del Resumen. Por la regresión del CSS, en escritorio todas las flechas quedan siempre en `ink-600` y corridas 2 px. |
| 5 | Prevención de errores | 3 | Nombre obligatorio con error en línea y foco; topes de 100/500 caracteres; el panel avisa que serás el administrador. Sin aviso de nombre repetido ni contador. |
| 6 | Reconocer antes que recordar | 4 | Cada renglón trae nombre, integrantes, rol, estado con monto y a quién le debes. No hay que entrar para saber qué pasa. |
| 7 | Flexibilidad y eficiencia | 2 | Con 34 proyectos la página mide unos 2.500 px en el celular, sin búsqueda, filtro ni forma de plegar los "Al día". |
| 8 | Estética y diseño minimalista | 3 | Hoja de libro mayor sobria, con un solo color fuerte: el de la deuda. En listas largas, "Al día" y "Administrador" se repiten y meten ruido. |
| 9 | Recuperación de errores | 3 | "Reintentar" en el error de carga; la falla parcial es una nota neutra cuyo "Reintentar" pide solo los saldos que fallaron. |
| 10 | Ayuda y documentación | 3 | El estado vacío explica el fondo común y el camino "si alguien te agrega por correo"; el panel explica el rol. Nada explica "A tu favor" en la lista. |
| **Total** | | **30/40** | **Bueno** |

#### Veredicto de especificidad

La pantalla es propia de SyncFund: el renglón dice tu situación en palabras ("Debes $ 100.000 · Le debes a Laura Gómez"), el orden pone primero lo que hay que resolver y un saldo que no llegó nunca se muestra como cero. Lo único genérico es el escritorio vacío: una hoja de 768 px con mucho lienzo sobrante y el estado vacío pequeño a la izquierda.

#### Lo que funciona

- **Certeza sobre cada peso, en cada estado.** "Cargando saldo" mientras carga; "Saldo sin cargar" con borde punteado si falla, y ese renglón sube en el orden. La línea de resumen nunca dice "no debes nada" si falta un dato (`projectsHeadline` en `projectLines.ts`).
- **La deuda dice a quién se debe.** "Le debes a …" en terracota y en texto, que aguanta nombres largos y montos de 12 cifras a 320 px.
- **Crear lleva al siguiente paso.** El panel abre con el foco en el nombre, la acción queda fija al alcance del pulgar y, al crear, se abre el Detalle en la pestaña Integrantes con un aviso.

#### Problemas pendientes

- **[P2] Regresión del CSS en `features/shared-project/components/ProjectStatusList.css` (líneas 118–143).** En el commit del pulido final (3211070), un comentario y dos reglas (`__loading` y `__payees`) quedaron dentro del selector `.project-status-list__row:hover …` del `@media (hover: hover)`, y la regla `.project-status-list__arrow { color: var(--ink-600); transform: translateX(2px) }` quedó suelta. Comprobado en Chrome a 1280 px: la flecha en reposo tiene el color de `ink-600` y `translateX(2px)` fijo, en vez de `ink-faint`. Afecta al Resumen y a la lista; ni `build` ni `lint` lo detectan. Arreglo: restaurar `.project-status-list__row:hover .project-status-list__arrow { … }` como estaba en 1bc7b6b y borrar los bloques duplicados. Comando: `/impeccable polish`.
- **[P2] Una lista larga es puro desplazamiento.** 30 renglones "Al día · Administrador" iguales, unos 2.500 px en el celular. Arreglo compatible con la decisión del equipo (sin cortes por grupo): con más de unos 8 proyectos, plegar los "Al día" tras "Mostrar N proyectos al día", o un campo para filtrar por nombre. Consultar con el equipo. Comando: `/impeccable distill`.
- **[P3] La columna del estado no se alinea en el celular.** A 393 px unos renglones llevan el estado al lado y otros debajo, según el largo del nombre. Arreglo: por debajo de unos 480 px, el estado siempre en su línea, a la derecha. Comando: `/impeccable adapt`.
- **[P3] Si la lista no carga, no se puede crear.** En la rama `error` de `SharedProjectsPage.tsx`, el `PageHeader` no lleva `action`. Arreglo: mantener "Crear proyecto" también en el error. Comando: `/impeccable harden`.

#### Carga cognitiva y recorrido emocional

Falla 1 punto del checklist (agrupación en la lista larga). Ningún punto de decisión con más de 4 opciones. Momento pico: el primer renglón en terracota con "Le debes a Laura Gómez". Final: el aviso con el nombre del proyecto y el salto a Integrantes. Valle: buscar un proyecto en la lista larga.

#### Señales de alerta por persona

- **Estudiante con varios grupos** (PRODUCT.md): "Debes en 1 de tus 4 proyectos" y el acreedor le resuelven la pregunta; "A tu favor $ 200.000" puede hacerle creer que alguien le debe esa plata.
- **Usuario intensivo (Alex):** sin búsqueda ni atajos; con 34 proyectos solo le queda Ctrl+F.
- **Lector de pantalla y teclado:** cada fila es un solo enlace con nombre legible; "Cargando saldo" se anuncia en texto oculto y la falla parcial es `role="status"`. Sin bloqueos.

#### Observaciones menores

- En el estado vacío la línea del encabezado ocupa todo el ancho; con lista llega solo hasta `--list-max`.
- El nombre tiene tope de 100 caracteres sin contador visible.
- "Administrador" repetido en la lista larga; se podría atenuar.

#### Estado de lo pendiente de la crítica anterior

- La lista no dice a quién le debes: **resuelto** ("Pagar" no se agrega, por decisión del equipo).
- La lista espera al saldo más lento: **resuelto**.
- La falla de un saldo se anuncia tres veces con tono de error: **resuelto**.
- Jerarquía plana y orden sin cortes visibles: **parcial** (los cortes se descartaron por decisión del equipo).
- Estado al lado o debajo según el largo del nombre a 375 px: **sigue igual**.
- Si la lista no carga, no se puede crear: **sigue igual**.

### Detalle del proyecto

- **Archivos:** `src/pages/SharedProjectDetailPage.tsx` (+ `.css`) y `src/features/shared-project/`: `ProjectActions`, `ProjectStatusTable`, `SettleDebtForm`, `ExpenseForm`, `ContributionForm`, `MembersList`, `ParticipantChips` y `payment.ts`; además `TransactionList`, `PageHeader` y `Panel`.
- **Resultado:** **29/40, Bueno** (inicial 24/40 · después de su rama 29/40).
- **Escenarios revisados:** normal en `/projects/40` (Diego debe 100.000 a Laura) y `/projects/11` (a favor y administrador): pestañas Situación, Movimientos e Integrantes; panel de gasto vacío, con división 2 de 3 y mayor que el fondo; panel de aporte; pago con monto, monto mayor que la deuda, revisión y cierre; error 404. Datos extremos: nombres largos, sin espacios, árabe, vietnamita y "Ñ", montos de 12 cifras, 7 integrantes y billetera de $ 1.500. Anchos 320, 393 (táctil) y 1280 px, sin desplazamiento horizontal.
- **Detector (B):** 0 hallazgos en el código; en la página, solo `cream-palette` (falso positivo).

#### Puntaje de heurísticas (Nielsen)

| # | Heurística | Puntaje | Hallazgo clave |
|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 3 | Carga con la forma del contenido; las acciones terminan con aviso y el pago con un cierre propio que usa la respuesta del backend. No hay señal de cuándo se actualizaron los datos. |
| 2 | Coincidencia con el mundo real | 3 | "Debes / A tu favor / Al día", "Pagó $ 100.000 / Recibió $ 100.000" y "Entre 3 · $ 180.000 c/u" hablan como el grupo. En `/projects/11`, "A tu favor $ 200.000" pesa como cobro aunque nadie le debe; la nota lo aclara en letra pequeña. |
| 3 | Control y libertad | 3 | Revisión con "Volver"; paneles que se cierran con "Cerrar", Esc o el velo. Un gasto mal registrado no se puede deshacer (límite del backend). |
| 4 | Consistencia y estándares | 3 | Un solo estilo de "Pagar" y montos con la misma regla en página y panel. Quedan dos "Pagar" para la misma deuda; el filete de la franja se corta antes de "Aportar al fondo" en escritorio. |
| 5 | Prevención de errores | 4 | Límites en vivo ("Supera lo que debes", "Supera el fondo disponible", "El fondo alcanza para…"), fondo visible antes de escribir, paso de revisión y "Podrás salir cuando estés al día" antes de intentarlo. |
| 6 | Reconocer antes que recordar | 3 | El pago llega con a quién y cuánto, y la división se calcula a la vista. El historial no dice entre quiénes se dividió cada gasto. |
| 7 | Flexibilidad y eficiencia | 2 | Pestaña en la URL, `?pagar=` y "Registrar gasto" fijo al pulgar. El historial no se filtra ni se agrupa, y no hay atajo para pagar lo que alcanza. |
| 8 | Estética y diseño minimalista | 3 | Una cifra protagonista, tabla con pie de libro mayor y paneles limpios. En el celular, quien debe recorre unos 470 px antes de la tabla y ve su deuda tres veces. |
| 9 | Recuperación de errores | 3 | Mensajes en español con el número exacto y "Volver a tus proyectos" en el 404. Si la billetera no alcanza, el panel abre ya en error y sin salida. |
| 10 | Ayuda y documentación | 2 | Buena ayuda en contexto ("Igual a la suma de los saldos…", "Incluye tu parte del fondo…"), pero no hay dónde entender el modelo fondo/billetera más allá de frases sueltas. |
| **Total** | | **29/40** | **Bueno** |

#### Veredicto de especificidad

Es de SyncFund por su composición, no solo por su paleta. La revisión del pago es un asiento contable ("Sale de: Tu billetera / Llega a: La billetera de Laura / Fondo del proyecto: No cambia / Después del pago: Quedas al día"), y la tabla de Situación con el pie "Fondo disponible — Igual a la suma de los saldos" convierte en interfaz la regla del producto. Lo genérico sigue en el escritorio: cifra a la izquierda, botón principal a la derecha y pestañas a todo el ancho, como un panel de administración.

#### Lo que funciona

- **El flujo de pago completo.** Llega con el monto sugerido, avisa los tres límites mientras se escribe, tiene revisión de libro mayor y cierra con "Pago hecho" y "Quedaste al día con Laura Gómez" en Fraunces esmeralda, mientras la tabla ya muestra "Al día · Pagó $ 100.000".
- **Reglas visibles antes del error.** El panel de gasto muestra el disponible, marca "Supera el fondo disponible ($ 240.000)" y cambia la división por "El fondo alcanza para $ 240.000". En Integrantes, quien debe lee "Debes $ 100.000. Podrás salir cuando estés al día." en lugar de un botón que falla.
- **Robustez con datos extremos.** A 320 px no hay desborde con montos de 13 cifras, un título sin espacios, un nombre árabe y 7 integrantes: la tabla pasa a fichas, los chips se reacomodan y los pagos se pliegan en "Ver los 5 pagos sugeridos entre integrantes".

#### Problemas pendientes

- **[P2] Si la billetera no alcanza, el pago abre en error y sin salida.** Con billetera de $ 1.500, el panel abre con la deuda completa y "no alcanza para este pago". Arreglo en `SettleDebtForm.tsx`: si el disponible es menor que lo sugerido, prellenar el mínimo de los dos y guiar ("Con tu billetera puedes pagar $ 1.500 ahora; te quedarían $ X por pagar"), con enlace a la Billetera. Comando: `/impeccable harden`.
- **[P2] Dos "Pagar" para la misma deuda.** La franja "Para quedar al día… · Pagar" y otro "Pagar" en la fila de Laura, que además estira esa fila (unos 70 px contra 43). Arreglo en `ProjectStatusTable`: quitarlo de la tabla cuando ya está en la franja, o dejarlo como enlace de texto que no cambie la altura. Comando: `/impeccable distill`.
- **[P2] En el celular, la tabla empieza tarde para quien debe.** A 393 px la deuda sale en la cifra, la franja y la ficha propia, y "Aportar al fondo" ocupa todo el ancho; la tabla empieza cerca de y = 520. Arreglo: "Aportar al fondo" en ancho automático o como acción secundaria, y sin resaltar la deuda en la ficha propia. Comando: `/impeccable layout`.
- **[P3] Detalles de alineación en escritorio.** El filete de la franja de pago se corta en "Pagar" (es el borde del `<li>`), y "A favor $ 940.000.000.000" se parte en dos líneas. Arreglo: filete en `.project-actions` y `white-space: nowrap` en el saldo. Comando: `/impeccable polish`.

#### Carga cognitiva y recorrido emocional

Falla "un solo foco por vista" en el celular de quien debe (deuda tres veces y tres botones antes de la tabla), y con nombres largos el nombre de la otra persona se repite en título, descripción y nota del panel. Solo los chips con 7 integrantes pasan de 4 opciones, aliviados por "Quitar a todos / Seleccionar a todos". Pico: la revisión del pago, bien atendida por el asiento contable. Final: "Quedaste al día con Laura Gómez". Valle: la billetera insuficiente.

#### Señales de alerta por persona

- **Estudiante que comparte arriendo** (PRODUCT.md): paga en tres toques con el monto puesto; no sabe entre quiénes se dividió cada gasto; si está corto de plata, el pago lo deja sin camino; "A tu favor $ 200.000" en verde puede leerse como plata por cobrar.
- **Usuario distraído en el celular:** "Registrar gasto" al pulgar y botones de 44 px; tiene que bajar para ver la tabla, y el "Pagar" de la ficha de Laura queda donde se toca sin querer al desplazar.
- **Teclado o lector de pantalla:** el foco sigue el paso (monto → "Revisa el pago" → titular del cierre), un solo `h1` y pestañas con patrón ARIA; en la ficha móvil se lee "Fondo" justo después de "Fondo disponible".

#### Observaciones menores

- En la ficha móvil del pie, la etiqueta "Fondo" repite "Fondo disponible".
- La vista previa "Vas a pagarle…" se repite casi igual en la revisión.
- "Para quedar al día" usa viñetas de navegador.
- La descripción del panel de gasto ocupa 3 líneas a 393 px y 5 a 320 px.
- En Integrantes (administrador), una fila sin botón queda sin separador inferior.

#### Estado de lo pendiente de la crítica anterior

- [P1] "Te deben" en vez de saldo neto: **resuelto** ("A tu favor" con nota).
- [P2] Cierre del pago: **resuelto**.
- [P2] "Pagar" en tres lugares y lista "Para quedar al día": **parcial** (siguen dos "Pagar" por deuda).
- [P2] Una columna en escritorio: **descartado por el equipo**.
- Jerarquía tipográfica h1/h2: **resuelto**.
- "Estás al día" en tamaño Display: **resuelto**.
- Montos redondeados contra centavos: **resuelto**.
- "Fondo" repetido junto a "Fondo disponible" en el celular: **sigue igual**.
- Historial sin decir entre quiénes: **sigue igual**.

### Categorías

- **Archivos:** `src/pages/CategoriesPage.tsx` (+ `.css`) y `src/features/categories/`: `budget.ts` (medición, orden y línea de resumen compartidos con el Resumen), `hooks/useCategories.ts`, `components/CategoryBudgetList.tsx`, `components/CreateCategoryForm.tsx` (panel en dos pasos), `services/categoryService.ts`; componentes compartidos `ProgressBar`, `Panel`, `Sheet`, `EmptyState` y `PageHeader`.
- **Resultado:** **29/40, Bueno** (inicial 20/40 · después de su rama 28/40).
- **Escenarios revisados:** normal (320, 375 y 1280 px), usuario nuevo (375 y 1280), datos extremos (375 y 1280), lista larga (375 y 1280; 5.638 px en el celular); panel "Crear categoría" vacío, con nombre repetido y en la revisión con un límite sospechoso ($ 300); el enlace "Ver gastos de Mercado" hasta la Billetera filtrada. Sin desplazamiento horizontal. Carga y error de carga revisados en el código.
- **Detector (B):** 0 hallazgos en el código; en la página, solo `cream-palette` (falso positivo).

#### Puntaje de heurísticas (Nielsen)

| # | Heurística | Puntaje | Hallazgo clave |
|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 3 | Mes nombrado, línea de resumen, esqueleto, aviso al crear y fila nueva resaltada y llevada a la vista. Con 40 categorías, las de abajo solo se conocen bajando mucho. |
| 2 | Coincidencia con el mundo real | 3 | "Te pasaste en Mercado", "Te quedan $ 5.000", "Cerca del límite". "Cuenta los gastos de tu billetera personal a los que les pusiste categoría" se lee forzado. |
| 3 | Control y libertad | 2 | En el panel hay "Volver", "Cerrar" y Esc, pero una categoría no se puede editar ni eliminar (backend y UML). |
| 4 | Consistencia y estándares | 3 | Misma barra, cálculo y orden que el Resumen. "Ver gastos" aparece solo en las filas con alerta. |
| 5 | Prevención de errores | 4 | Nombre repetido sin importar tildes ni mayúsculas, 0 con guía, tope de `DECIMAL(12,2)`, aviso "¿faltaron ceros?", revisión tipo asiento y nota de que no se podrá cambiar. |
| 6 | Reconocer antes que recordar | 3 | Porcentaje real, lo que queda o lo que se pasó, y la línea que nombra las categorías en problema. Con muchas categorías no se encuentra una por nombre. |
| 7 | Flexibilidad y eficiencia | 2 | El enlace a la Billetera filtrada es un buen atajo, pero no hay búsqueda, meses anteriores ni forma de compactar la lista. |
| 8 | Estética y diseño minimalista | 3 | Libro mayor limpio y jerarquía clara (h1 > resumen > mes). Con muchas categorías, decenas de filas idénticas "0 % usado"; en el celular cada fila ocupa 4–5 líneas. |
| 9 | Recuperación de errores | 3 | Errores en español, el error del backend dentro de la revisión, "Reintentar" y "Tu cambio se guardó" si la recarga falla. Si falla una sola consulta de gasto, cae toda la página. |
| 10 | Ayuda y documentación | 3 | El estado vacío explica para qué sirve; hay pista del límite opcional y "Se mide en". La descripción del panel nombra "la barra" a quien aún no tiene ninguna. |
| **Total** | | **29/40** | **Bueno** |

#### Veredicto de especificidad

Es de SyncFund y no una pantalla de presupuesto genérica: la cabecera responde "¿cómo voy este mes?" nombrando las categorías ("Te pasaste en Mercado; Transporte y Salidas van cerca del límite") sin sumar límites distintos, la barra de tres estados usa por fin el ámbar reservado y la revisión antes de crear es un asiento de libro mayor ("Se mide en: tu billetera personal, mes a mes"). Lo genérico es la lista larga: una pila uniforme de barras vacías, cuando un libro mayor real agruparía lo que no tiene movimiento.

#### Lo que funciona

- **La cabecera nombra y tiene peso.** La línea de resumen va en 600 y `ink-900`, nombra hasta tres categorías y cuenta cuando hay más.
- **De la alerta a la causa en un toque.** "Ver gastos de Mercado" lleva a la Billetera filtrada por categoría y mes, con chip, total ($ 480.000, que coincide con la barra) y "Quitar filtro".
- **Prevención seria mientras no haya edición.** La revisión muestra el límite en palabras, avisa en ámbar con un límite bajo y deja claro que no se podrá cambiar; el aviso de nombre repetido cita el nombre existente.

#### Problemas pendientes

- **[P2] La lista no escala.** Con muchas categorías la página mide 5.638 px en el celular: unas 35 barras iguales "0 % usado" y la hoja "Sin límite" al fondo con renglones de "$ 0". Arreglo: agrupar en cada hoja las categorías sin gasto este mes en un renglón plegable ("12 categorías sin gastos este mes", con `<details>`). Comando: `/impeccable layout`.
- **[P2] "Ver gastos" solo existe en las filas con alerta.** Servicios (18 %) no lo tiene, y con un nombre largo el enlace ocupa dos o tres líneas. Arreglo: el nombre de la categoría como enlace en todas las filas con gasto (o un "Ver gastos" corto con `aria-label` completo), con el énfasis solo en las filas con alerta. Comando: `/impeccable clarify`.
- **[P3] Filas altas en el celular.** Por debajo de 24 rem cada categoría ocupa 5–6 líneas y solo caben dos y media sobre la acción fija. Arreglo: llevar "Te quedan" a la línea del porcentaje. Comando: `/impeccable adapt`.
- **[P3] Una consulta de gasto fallida tumba toda la página.** `fetchMonthSpend` usa `Promise.all`. Arreglo: `Promise.allSettled` y una fila "Gasto sin cargar" con "Reintentar" para esa categoría, como ya hace Proyectos. Comando: `/impeccable harden`.

#### Carga cognitiva y recorrido emocional

Ningún punto de decisión con más de 4 opciones. Falla "agrupar y revelar de a poco" en listas largas. Pico: la cabecera con nombre propio, un mal momento entregado con tacto y con un siguiente paso. Final: el aviso "Categoría «X» creada" y la fila nueva resaltada. Valle: la revisión con límite sospechoso, correcta pero algo amenazante para un acto pequeño.

#### Señales de alerta por persona

- **Estudiante que comparte apartamento** (PRODUCT.md), a fin de mes en el celular: ve en qué se pasó y llega a los gastos en un toque. Si escribe 30.000 queriendo 300.000, el aviso no salta (solo por debajo de $ 10.000) y el error es permanente porque no hay edición.
- **Primera vez:** el estado vacío orienta y da ejemplos; el panel habla de "la barra" antes de que exista y suena como si el límite fuera obligatorio.
- **Lector de pantalla y teclado:** `aria-valuetext` con porcentaje y estado, foco que sigue al paso de revisión y enlace "Ver gastos de …" con nombre completo.

#### Observaciones menores

- El anillo de foco del título "Revisa la categoría" ocupa todo el ancho del panel y parece un campo.
- En escritorio, con un nombre extremo, el botón "Crear categoría" queda centrado frente a una línea de resumen de tres renglones.
- La nota de la hoja "Sin límite" sobra cuando la cabecera ya nombra el mes.
- El carril de la barra al 0 % tiene muy poco contraste (el texto lleva la información).

#### Estado de lo pendiente de la crítica anterior

- La línea de resumen cuenta pero no nombra y no tiene peso: **resuelto**.
- Exceder o acercarse al límite no lleva a ninguna parte: **resuelto, con matiz** (solo en filas con alerta).
- La fila de estado cambia de forma según el ancho: **resuelto** (a costa de altura).
- Tras crear, la categoría nueva no se ve: **resuelto**.
- El lector de pantalla oye cada cifra tres veces: **resuelto**.
- Jerarquía plana: **resuelto**.
- Carga todo o nada: **sigue igual**.
- Aviso de "faltan ceros" solo por debajo de $ 10.000: **sigue igual**.
- Backend (editar o eliminar categorías, `@Digits`/`@Max`, una sola respuesta con el gasto del mes): **sigue igual**.

### Login

- **Archivos:** `src/pages/LoginPage.tsx` (ruta `/login`), dentro de `src/components/layout/AuthLayout.tsx` + `AuthLayout.css`, con `src/components/ui/Input.tsx`, `PasswordInput.tsx`, `Button.tsx`, `FormError.tsx`, `src/hooks/useFormErrors.ts`, `src/hooks/useSlowHint.ts`, `src/utils/authStorage.ts` (aviso de sesión vencida) y `src/features/auth/services/authService.ts`.
- **Resultado:** **30/40, Bueno** (inicial 23/40 · después de su rama 29/40).
- **Escenarios revisados:** 1280 × 800, 375 × 667 (móvil) y 320 × 568 (móvil), sin sesión. Estados: formulario vacío, envío vacío (dos errores de campo), correo sin "@", contraseña incorrecta (422) con "Mostrar" activado, 401, sin conexión (error de red simulado), espera larga (más de 6 s: aparece el aviso de demora) y sesión vencida. No hubo desplazamiento horizontal en ningún ancho.
- **Detector (B):** 0 hallazgos en el código; en la página, solo `cream-palette` (falso positivo).

#### Puntaje de heurísticas (Nielsen)

| # | Heurística | Puntaje | Hallazgo clave |
|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 4 | "Entrando…" en el botón, que conserva la opacidad completa. A los 6 s sale "Está tardando más de lo normal; seguimos intentando." en una región viva. "Tu sesión venció" explica por qué el usuario volvió aquí. |
| 2 | Coincidencia con el mundo real | 3 | Español natural ("Usa el correo con el que te registraste", "Entrar"). Pero un 401 en el login muestra el texto genérico del backend, que no corresponde a esta pantalla. |
| 3 | Control y libertad | 3 | Hay "Mostrar/Ocultar", la salida al Registro y `replace` al entrar. Durante la espera larga no se puede cancelar. No hay recuperación de contraseña (decisión del equipo). |
| 4 | Consistencia y estándares | 3 | Componentes y tokens compartidos con el Registro, y un solo h1. El lema del celular ("en un solo lugar") no coincide con el titular de escritorio ("un solo saldo real"). |
| 5 | Prevención de errores | 3 | Teclado de correo, `autoCapitalize="none"`, `trim` del correo, autocompletado y "Mostrar". No avisa de Bloq Mayús. |
| 6 | Reconocer antes que recordar | 3 | Etiquetas que no desaparecen, sin placeholders, el gestor de contraseñas completa los datos y el correo llega escrito desde el Registro. |
| 7 | Flexibilidad y eficiencia | 3 | `enterKeyHint` (next/go), Enter envía y el foco va a la contraseña si el correo llega escrito. En escritorio el foco no arranca en el correo. |
| 8 | Estética y diseño minimalista | 3 | Sobrio y bien jerarquizado. El error general es texto terracota pequeño sin contenedor y pesa menos que el aviso informativo de sesión vencida. |
| 9 | Recuperación de errores | 3 | El 422 dice qué revisar, conserva lo escrito y recibe el foco. Los errores de campo enfocan el primero. Si se olvidó la contraseña no hay salida. |
| 10 | Ayuda y documentación | 2 | La nota "Por ahora SyncFund no permite recuperarla" es honesta pero no ofrece un siguiente paso. |
| **Total** | | **30/40** | **Bueno** |

#### Veredicto de especificidad

En escritorio la pantalla es de este producto: el titular en Fraunces sobre azul tinta, el párrafo con el vocabulario propio ("aporta al fondo", "quién le debe a quién") y los dos aros de tinta (billetera y fondo) no servirían tal cual en otra app. El nombre y el h1 arrancan a la misma altura, así que las dos columnas se leen como una sola composición. El formulario es un login estándar, y en modo Operate eso es lo correcto. En el celular la franja de marca es neutra, pero cumple su función: dejar el formulario a la vista.

#### Lo que funciona

- **Los estados de espera y de regreso.** La región viva siempre está presente, el aviso de demora aparece a los 6 s y la nota de sesión vencida va en tinta, no en terracota, porque no es culpa del usuario.
- **El formulario entero cabe en la pantalla del celular.** A 320 × 568 se ven el h1, los dos campos, "Entrar", el enlace al Registro y la nota sin desplazarse. A 375 px, con dos errores de campo, "Entrar" sigue a la vista.
- **El manejo de errores.** La validación local enfoca el primer campo con error. El 422 conserva los datos y mueve el foco al mensaje con `role="alert"`, sin revelar cuál de los dos campos falló.

#### Problemas pendientes

- **[P2] El error general parece un error de la contraseña y pesa poco.** Es un `<p>` terracota en `--text-label`, sin fondo, pegado bajo el campo Contraseña (`components/ui/FormError.css`); con foco, el anillo queda ceñido al texto. Es el momento de mayor frustración de la pantalla y el aviso informativo de sesión vencida tiene más presencia. Arreglo: darle a `.sf-form-error` el tratamiento de bloque de `.auth-form__notice` (fondo claro en token, `padding`, `radius-sm`) y un `outline-offset` positivo. Comando: `/impeccable harden`.
- **[P3] Un 401 en el login muestra un mensaje que no corresponde a esta pantalla.** `LoginPage.tsx` solo traduce el 422; otro estado muestra el texto del backend ("Tu sesión no es válida o ya expiró…"). Arreglo: tratar el 401 de `/auth/login` igual que el 422. Comando: `/impeccable clarify`.
- **[P3] Dos lemas distintos para la misma marca.** Celular: "Tu billetera y tus proyectos, en un solo lugar."; escritorio: "…un solo saldo real." (`AuthLayout.tsx`). Arreglo: una sola frase. Comando: `/impeccable clarify`.
- **[P3] Ayuda sin salida si se olvidó la contraseña.** Aceptado por el equipo (recuperación fuera de alcance); queda como la mayor fricción de H9 y H10.

#### Carga cognitiva y recorrido emocional

No falla ningún punto del checklist. El único punto de decisión tiene dos opciones (Entrar / Regístrate) más "Mostrar". Momento pico: el error de credenciales, bien redactado pero visualmente débil. Final: entrar al Resumen con `replace`. La espera larga ya no es un valle.

#### Señales de alerta por persona

- **Estudiante en el celular con mala señal** (PRODUCT.md): el aviso de demora y la nota de sesión vencida cubren lo que antes lo hacía recargar. Si escribe mal la contraseña, el error aparece bajo ese campo y puede no revisar el correo.
- **Lector de pantalla y teclado:** "Entrando…" se anuncia por la región viva y el error recibe el foco; el anillo de foco del mensaje queda pegado al texto.
- **Primera vez (Jordan):** "¿No tienes cuenta? Regístrate" está antes de la nota de la contraseña y mide 44 px. Sin bloqueos.

#### Observaciones menores

- En escritorio el correo no recibe el foco al cargar (en el celular, no enfocarlo evita abrir el teclado).
- No hay aviso de Bloq Mayús en la contraseña.
- En escritorio queda mucho vacío bajo el formulario; el motivo de los aros queda cortado en la esquina (decisión).

#### Estado de lo pendiente de la crítica anterior

- Sesión vencida sin explicación: **resuelto** (`markSessionExpired` y la nota "Tu sesión venció…").
- Nada avisa si el backend tarda: **resuelto** (`useSlowHint` a 6 s).
- Columnas sin línea de arranque común en escritorio: **resuelto** (`--auth-start`).
- "Entrando…" sin anuncio para lector de pantalla: **resuelto**.
- Botón de carga al 60 % de opacidad: **resuelto** (`aria-busy` con opacidad completa).
- `FormError.css` sin tokens: **resuelto**; su peso visual sigue débil (nuevo P2).
- Recuperación de contraseña: **sigue igual** (fuera de alcance).

### Registro

- **Archivos:** `src/pages/RegisterPage.tsx` (ruta `/register`) dentro de `src/components/layout/AuthLayout.tsx`; `src/components/ui/Input.tsx` (con `errorAction`), `PasswordInput.tsx`, `Button.tsx`, `FormError.tsx`; `src/features/auth/services/authService.ts`; `src/utils/validation.ts`; `src/hooks/useSlowHint.ts`; la bienvenida está en `src/pages/DashboardPage.tsx`.
- **Resultado:** **32/40, Bueno** (inicial 23/40 · después de su rama 32/40).
- **Escenarios revisados:** formulario vacío a 1280, 375 y 320 px (a 320 × 568 "Crear cuenta" queda visible sin desplazar); envío vacío; correo inválido con contraseña corta; correo ya registrado a 375 y 1280 px; el enlace "Inicia sesión con este correo" hasta el Login; registro exitoso hasta el Resumen con el aviso "Tu cuenta quedó creada.". Sin desplazamiento horizontal. El estado de usuario nuevo del Resumen no se pudo comprobar desde aquí (la API simulada responde al registro con un usuario que ya tiene datos).
- **Detector (B):** 0 hallazgos en el código; en la página, solo `cream-palette` (falso positivo).

#### Puntaje de heurísticas (Nielsen)

| # | Heurística | Puntaje | Hallazgo clave |
|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 4 | Al enviar: "Creando tu cuenta…", `aria-busy` y un aviso para lector de pantalla. Si tarda: aviso de demora. Al llegar al Resumen: "Tu cuenta quedó creada.". |
| 2 | Coincidencia con el mundo real | 3 | Español claro y vocabulario del producto. La línea de apoyo explica el modelo, pero dice dos cosas en cuatro renglones. |
| 3 | Control y libertad | 3 | "Mostrar"/"Ocultar", salida al Login y `replace` para que "Atrás" no vuelva al formulario. |
| 4 | Consistencia y estándares | 3 | Mismo `AuthLayout` y campos que el Login. "Ya hay una cuenta con este correo." lleva punto final y los demás errores no. |
| 5 | Prevención de errores | 3 | Regla visible ("Mínimo 6 caracteres"), teclado de correo, `new-password`, `trim` y dominio obligatorio. La regla solo se comprueba al enviar y el mínimo de 6 es bajo para una app de dinero. |
| 6 | Reconocer antes que recordar | 4 | Etiquetas siempre visibles, ayuda ligada por `aria-describedby`, y el correo duplicado pasa escrito al Login. |
| 7 | Flexibilidad y eficiencia | 3 | Autocompletado, `enterKeyHint` y mayúscula inicial en el nombre. En escritorio ningún campo recibe el foco al abrir. |
| 8 | Estética y diseño minimalista | 3 | Limpio, con franja de marca corta en el celular. La línea de apoyo pesa cuatro renglones antes del primer campo. |
| 9 | Recuperación de errores | 4 | Errores bajo cada campo, foco en el primero, se borran al escribir. El correo duplicado ofrece una salida que conserva el correo. |
| 10 | Ayuda y documentación | 2 | No dice para qué se usan el nombre y el correo ni trae aviso de tratamiento de datos. |
| **Total** | | **32/40** | **Bueno** |

#### Veredicto de especificidad

La pantalla está pensada para SyncFund y no es un registro de plantilla: el titular "un solo saldo real" y los dos círculos entrelazados nombran el producto, la línea de apoyo explica que la billetera se crea sola y que a los proyectos te agrega quien los administra, y el correo duplicado lleva al Login en vez de quedarse en un callejón sin salida. Lo único genérico es el formulario de tres campos, y eso es correcto para la tarea.

#### Lo que funciona

- **El correo duplicado como continuidad.** Error bajo el campo, con foco; "Inicia sesión con este correo" lleva al Login con el correo escrito (por estado de navegación, no por la URL) y el foco en la contraseña. El "Inicia sesión" del pie se oculta para que no haya dos.
- **Buena respuesta durante la espera y al final.** El botón dice qué pasa, el lector de pantalla oye la espera, hay aviso si el servidor tarda y el cierre es un aviso en el Resumen.
- **Pensado para el celular.** La franja de marca se reduce, los campos usan 16 px (sin zoom), los objetivos táctiles miden 44 px y aparece el teclado de correo.

#### Problemas pendientes

- **[P2] El mínimo de contraseña sigue en 6 caracteres.** El equipo ya decidió subirlo a 8 junto con el `@Size` del backend (`RegisterUserRequest`); en el mismo PR, cambiar `minLength(password, 6, …)` y la ayuda en `RegisterPage.tsx`. Comando: `/impeccable harden` (solo la parte del frontend).
- **[P2] No dice para qué se usan los datos.** Falta el aviso de tratamiento de datos (Ley 1581 de 2012) y no se explica que los integrantes verán el nombre. Arreglo: ayuda "Así te verán en tus proyectos compartidos" en Nombre y, si el equipo lo aprueba, una línea sobre el uso del correo. Comando: `/impeccable clarify`.
- **[P3] La línea de apoyo junta dos ideas lejos del campo que importa.** Dejar "Te creamos una billetera personal…" y pasar la frase del correo a la ayuda del campo Correo. Comando: `/impeccable clarify`.
- **[P3] La regla de la contraseña no confirma cuando ya se cumple.** Que la ayuda pase a "✓ Tiene 6 caracteres o más" (con signo, no solo color) sin mostrar el error antes de enviar. Comando: `/impeccable harden`.

#### Carga cognitiva y recorrido emocional

Falla 1 punto del checklist: la línea de apoyo de cuatro renglones compite con el primer campo. Ningún punto de decisión con más de 4 opciones. Momento pico: el correo duplicado, resuelto con un toque. Final: el aviso de cuenta creada.

#### Señales de alerta por persona

- **Estudiante a quien un compañero va a agregar al proyecto del arriendo** (PRODUCT.md): la pantalla le dice que use el correo con el que lo agregarán, pero en el párrafo de arriba y no junto al campo Correo.
- **Primera vez con una app de finanzas:** no sabe si "Nombre" será visible para otros ni qué pasa con su correo.
- **Lector de pantalla:** errores y ayuda ligados al campo; la espera se anuncia en región viva, aunque el foco cae al `body` al enviar.

#### Observaciones menores

- El Nombre acepta una sola letra.
- Puntuación inconsistente entre mensajes de error.
- En escritorio ningún campo recibe el foco al abrir.
- A 320 px el eslogan se parte en dos líneas.

#### Estado de lo pendiente de la crítica anterior

- Sin aviso si la creación tarda: **resuelto**.
- Ayuda y error de la contraseña apilados y texto técnico: **resuelto**.
- Ritmo del correo duplicado y doble "Inicia sesión": **resuelto**.
- "Correo" → "Correo electrónico": **resuelto**.
- Foco al `body` mientras envía: **parcial**.
- `@Size` y mínimo de 8 caracteres en el backend: **sigue igual**.
- Aviso de tratamiento de datos (Ley 1581): **sigue igual**.
