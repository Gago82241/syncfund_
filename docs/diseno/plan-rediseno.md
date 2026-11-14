# Plan maestro del rediseño de SyncFund

Nov 13, 2026 · @diego

El rediseño cambia la estructura de la app (menú lateral en escritorio y barra inferior en el celular), corrige el contraste de los colores, agrega 10 componentes compartidos y rehace las 7 pantallas, en 9 ramas. La meta es que cada pantalla pase de 18–24/40 a 28/40 o más en la crítica de Impeccable, sin tocar el backend ni perder la identidad "El Libro Mayor Vivo".

## Principios

Seis reglas deciden cualquier duda durante la construcción; si una propuesta choca con una de ellas, gana la regla.

1. **Certeza sobre cada peso.** Ninguna cifra se muestra si no viene del backend, y cada cifra dice qué es ("Disponible", "Te deben", "Fondo del proyecto").
2. **Una sola cifra protagonista por pantalla.** Las demás cifras son secundarias o van en renglones.
3. **El color solo habla de dinero.** Esmeralda = a favor o ingreso, terracota = en contra, gasto o error, ámbar = alerta de presupuesto, azul tinta = estructura y acciones. Siempre acompañado de signo o texto, nunca solo color.
4. **Lo importante primero, lo ocasional a un toque.** La tarea principal de cada pantalla está a la vista; los formularios y ajustes se abren en paneles.
5. **Celular primero, escritorio aprovechado.** Cada pantalla se diseña a 375 px y luego se expande; en escritorio se usa el ancho con hojas en columnas.
6. **Solo frontend y sin librerías nuevas.** Todo se construye con React y CSS propio; cualquier excepción la aprueba el equipo.

## Sistema visual

La paleta y las tipografías se conservan; lo que cambia es que el texto de los montos usa tonos más oscuros para cumplir el contraste mínimo de 4.5:1, y que todos los valores pasan a ser variables CSS en `globals.css` y `theme.ts`.

### Colores que cambian o se agregan

| Token | Valor | Contraste sobre el papel | Uso |
| --- | --- | --- | --- |
| `gain-700` (nuevo) | #1E7259 | 5.3:1 | Texto de montos a favor e ingresos |
| `gain-500` | #2F9E7D (igual) | 3.0:1 | Solo bordes y rellenos, nunca texto pequeño |
| `loss-700` | #A8452D (igual) | 5.4:1 | Ahora también texto de montos en contra y gastos, además de errores |
| `loss-500` | #C65D43 (igual) | 3.8:1 | Solo bordes y rellenos |
| `ink-faint` | #8C8A82 → #6E6C64 | 3.2:1 → 4.8:1 | Fechas, metadatos y textos de ayuda |
| `warn-700` (nuevo) | #86620F | 5.1:1 | Texto "Cerca del límite" en Categorías |
| `warn-500` | #C9971F (igual) | 2.4:1 | Solo el relleno de la barra de presupuesto |
| `field-border` (nuevo) | #8F8B80 | 3.4:1 sobre blanco | Borde de los campos (WCAG pide 3:1 para controles) |

Los valores son la propuesta inicial; Claude Code los verifica con el detector de contraste antes de fijarlos.

### Tipografía

- Se mantienen Fraunces (títulos y cifras) y Figtree (interfaz).
- La cifra protagonista pasa a tamaño fluido: de 2rem en el celular a 2.75rem en escritorio, para que cifras largas no se salgan de la pantalla.
- Escala en variables CSS: display, headline, title, body (1rem), small (0.9375rem) y label (0.8125rem).
- Los campos de formulario usan al menos 16 px de letra, para que el iPhone no haga zoom al escribir.

### Espacios, bordes y sombra

- Escala de espacios en variables CSS: 0.5, 0.75, 1, 1.5, 2.5 y 4rem. Ningún componente usa medidas sueltas.
- Radios sin cambios: 4 px (botones y campos), 8 px (hojas), 14 px (chips).
- Una sola sombra, `shadow-float`, solo para paneles laterales, hojas inferiores y menús. Detrás del panel, un velo azul tinta semitransparente.

### Movimiento

- 150 ms para respuesta al toque y al pasar el cursor; 200 ms para abrir y cerrar paneles.
- Curva de salida suave (ease-out), sin rebotes.
- Quien tiene activado "reducir movimiento" en su sistema no ve animaciones; eso ya existe en `globals.css` y se mantiene.

### Íconos

- Un componente `Icon` con unos 8 íconos dibujados en SVG propio: Resumen, Billetera, Proyectos, Categorías, agregar, cerrar, flecha y cuenta.
- Trazo fino de 1.5 px en el color del texto, coherente con el estilo de libro mayor. Sin librería de íconos.

## Estructura de la app

La columna única de 640 px se reemplaza por un esqueleto con navegación fija y páginas en hojas; el punto de cambio entre la versión de celular y la de escritorio es 1024 px.

&#91;embedded content: Esqueleto de la app · escritorio y celular\]

Las dos versiones comparten el mismo encabezado y las mismas hojas; solo cambia dónde va la navegación y, en el celular, la acción principal baja para quedar al alcance del pulgar. La fila de indicadores solo aparece en el Resumen.

### Navegación

|  | Celular y tableta (menos de 1024 px) | Escritorio (1024 px o más) |
| --- | --- | --- |
| Destinos | Barra inferior fija con 4 destinos: ícono + etiqueta, 56 px de alto | Menú lateral fijo de 240 px a la izquierda |
| Marca | Barra superior delgada con "SyncFund" | Arriba del menú lateral |
| Cuenta y "Cerrar sesión" | Menú de cuenta en la barra superior | Al pie del menú lateral |
| Página activa | Marcada en la barra (color y peso) | Marcada en el menú (fondo azul neblina) |

- "Cerrar sesión" deja de ser un enlace destacado: va dentro del menú de cuenta.
- La página activa se anuncia a los lectores de pantalla (`aria-current="page"`), y hay un enlace oculto "Saltar al contenido" para quien navega con teclado.
- En el celular se respeta el área segura del iPhone (la franja inferior del gesto de inicio).

### Esqueleto de cada página

1. **Encabezado de página:** título (el único `h1`), la cifra protagonista con su etiqueta y, en escritorio, la acción principal.
2. **Fila de indicadores** (solo en el Resumen): máximo 3 datos secundarios.
3. **Hojas:** secciones en papel blanco con línea fina. Una columna en el celular; en escritorio, dos columnas donde el contenido lo permite (Resumen, Billetera y Detalle del proyecto). Ancho máximo del contenido: unos 1200 px.

### Acciones y paneles

- **Acción principal en el celular:** un botón fijo justo encima de la barra inferior ("Registrar movimiento", "Registrar gasto"…), siempre al alcance del pulgar.
- **Paneles:** los formularios se abren en un panel lateral derecho de unos 420 px en escritorio y en una hoja que sube desde abajo en el celular (hasta el 90 % de la pantalla).
- Un panel se cierra con Esc, con su botón "Cerrar" o tocando el velo de fondo. Mientras está abierto, el foco del teclado queda dentro del panel y al cerrarlo vuelve al botón que lo abrió.
- Se construyen con el elemento `<dialog>` nativo del navegador, que ya resuelve el foco y la tecla Esc sin librerías.

## Componentes

Se construyen una vez, en la primera rama, y todas las pantallas los reutilizan; así un arreglo en un componente arregla la app entera.

### Nuevos

| Componente | Qué es | Dónde se usa | Qué problema resuelve |
| --- | --- | --- | --- |
| `PageHeader` | Encabezado con título, cifra protagonista con etiqueta y acción principal | Todas las pantallas con sesión | Cifras sin etiqueta; falta de `h1` |
| `Sheet` | Hoja de papel blanco con título de sección y línea fina | Todas las pantallas | Páginas planas y vacías |
| `Panel` | Panel lateral (escritorio) u hoja inferior (celular) basado en `<dialog>` | Todos los formularios | Formularios apilados que tapan la lista |
| `MoneyInput` | Campo de monto que acepta puntos de miles ("50.000") y muestra en vivo "Vas a aportar 50.000" | Movimientos, aportes, gastos, pagos, meta, colchón, límites | Montos que se convierten en 50 en vez de 50.000 |
| `PasswordInput` | Campo de contraseña con botón "Mostrar" | Login y Registro | Errores al escribir la contraseña en el celular |
| `Skeleton` | Bloques grises con la forma del contenido mientras carga | Todas las cargas | Texto "Cargando…" sin forma |
| `EmptyState` | Mensaje con una acción concreta ("Crea tu primer proyecto") | Listas vacías y usuario nuevo | Pantallas vacías sin siguiente paso |
| `ProgressBar` | Barra con porcentaje y texto, accesible para lectores de pantalla | Meta de ahorro y presupuesto de categorías | Barra invisible que depende solo del color |
| `MoneyStatus` | Etiqueta de estado con monto: "Te deben", "Debes", "Al día" | Resumen, Proyectos, Detalle | Estados distintos entre pantallas y solo por color |
| `Toast` | Aviso breve de éxito que se anuncia al lector de pantalla | Después de guardar, aportar, pagar, crear | Acciones que terminan sin confirmación |

### Que cambian

- **`Button`:** estado presionado visible (se oscurece y baja 1 px), altura mínima de 44 px y variantes existentes (principal, fantasma, peligro).
- **`Input`:** borde con el nuevo `field-border`, foco más visible y ayuda debajo del campo en vez de en el placeholder.
- **Renglones del historial:** la descripción larga se corta con elipsis y el monto nunca se parte en dos líneas.
- **Tabla "Situación del proyecto":** se conserva como componente distintivo, con los colores corregidos y el estado en texto.

## Pantallas

Cada pantalla responde una pregunta principal y la responde arriba; lo demás se ordena debajo en hojas.

### Resumen — "¿Cuánto tengo?"

- **Cifra protagonista:** billetera + tu saldo neto en cada proyecto, con desglose debajo: "Billetera" y "En proyectos". Se calcula en el frontend (decisiones 1 y 2).
- **Justo debajo:** si debes en algún proyecto, un aviso destacado con a quién, cuánto y botón "Pagar". Si estás al día, una línea discreta: "Estás al día en todos tus proyectos".
- **Fila de indicadores:** Billetera, Te deben y Debes.
- **Hojas:** "Tus proyectos" (un renglón por proyecto con tu estado) y "Presupuesto del mes" (solo las categorías cerca del límite o pasadas).
- **Acción principal:** "Registrar movimiento".
- **Usuario nuevo:** en vez de una cifra en cero, dos acciones: "Registra tu primer ingreso" y "Crea un proyecto".

### Detalle del proyecto — "¿Cómo estoy en este proyecto?"

- **Cifra protagonista:** tu situación ("Te deben", "Debes" o "Estás al día", con el monto). El fondo del proyecto va como dato secundario del encabezado (decisión 3).
- **Pestañas:** Situación (la tabla de libro mayor) · Movimientos · Integrantes, que incluye "Agregar integrante" y "Salir del proyecto" (decisión 7).
- **Acciones:** "Registrar gasto", "Aportar" y "Pagar", cada una en su panel (decisión 6).
- **Reglas visibles antes del error:** el formulario de gasto muestra el fondo disponible; "Salir del proyecto" explica que solo se puede estando al día.
- **Pago:** un paso de revisión ("De tu billetera a la de Laura; el fondo no cambia") y un aviso de cierre ("Quedaste al día").
- **En escritorio:** Situación y Movimientos pueden ir en dos columnas.

### Billetera personal — "¿Cuánto puedo gastar?"

- **Cifra protagonista:** "Disponible", y debajo "Total = disponible + colchón" (decisión 5).
- **Hojas:** Movimientos (renglones de libro mayor), Meta de ahorro (con barra de progreso) y Colchón.
- **Paneles:** "Registrar movimiento", "Editar meta" y "Apartar o liberar colchón" (decisión 7). Al cambiar entre Gasto e Ingreso, los campos siguen reiniciándose (decisión anterior del equipo).
- **En escritorio:** Movimientos a la izquierda; meta y colchón a la derecha.

### Proyectos compartidos — "¿Dónde debo o me deben?"

- **Cada renglón:** nombre del proyecto, número de integrantes, tu saldo neto con su estado y la etiqueta "Administrador" si lo eres (decisión 4).
- **Orden:** primero los proyectos donde debes.
- **Acción principal:** "Crear proyecto", en panel. Al crearlo, se abre directamente su Detalle.
- **Sin proyectos:** explicación en una línea de qué es un proyecto compartido y el botón "Crea tu primer proyecto".

### Categorías — "¿Cómo voy con mi presupuesto este mes?"

- **Encabezado:** el mes nombrado ("Noviembre de 2026").
- **Cada categoría:** nombre, gastado de límite y barra de progreso con texto: normal, "Cerca del límite" en ámbar desde el 80 % y "Te pasaste" en terracota desde el 100 %.
- **Orden:** de mayor a menor porcentaje usado.
- **Acción principal:** "Crear categoría", en panel. Límite vacío = sin límite; no se permite 0.

### Login y Registro — "Entrar rápido"

- **Celular:** el panel de marca se reduce a una franja corta con el nombre y una línea; el formulario queda visible sin desplazarse.
- **Escritorio:** se mantiene la pantalla dividida; el círculo esmeralda del motivo pasa a azul tinta.
- **Campos:** `PasswordInput` con "Mostrar", teclado de correo en el celular y atributos para que el gestor de contraseñas complete los datos.
- **Correo ya registrado:** el error aparece bajo el campo Correo con el enlace "Inicia sesión con este correo".
- **Tras registrarse:** va al Resumen con el estado de usuario nuevo.

## Accesibilidad

Cada rama se revisa contra esta lista antes del PR; el comando `audit` de Impeccable la comprueba de forma automática.

- [ ] Texto con contraste de al menos 4.5:1 (3:1 para bordes de campos y textos grandes).
- [ ] Ningún estado se comunica solo con color: siempre hay signo, etiqueta o texto.
- [ ] Todo se puede usar con teclado y el foco siempre se ve.
- [ ] Botones y enlaces de al menos 44 × 44 px en el celular.
- [ ] Un solo `h1` por página y títulos de sección en orden.
- [ ] Cargas, éxitos y errores se anuncian al lector de pantalla.
- [ ] Los paneles atrapan el foco y lo devuelven al cerrarse.
- [ ] Sin desplazamiento horizontal a 320 px de ancho.
- [ ] Las animaciones se apagan con "reducir movimiento".

## Fuera del rediseño

Estos cambios tocan el backend o el diseño UML, así que van en ramas propias con pruebas, como se aprobó en la decisión 8.

| Cambio | Qué toca | Cuándo |
| --- | --- | --- |
| Límites de longitud en registro y nombre de proyecto (`@Size`) | Backend (DTO) | Ya, en paralelo al rediseño |
| Editar y eliminar categorías | Backend y diagrama UML | Después del rediseño |
| Movimiento en el historial al apartar o liberar colchón | Dominio y base de datos | Después del rediseño |
| Guardar quién pagó cada gasto compartido | Base de datos y backend | Después del rediseño |
| Error de correo duplicado en `errors.email` | Contrato del API | Solo si la solución del frontend no basta |
| Endpoint agregado de categorías con su gasto del mes | Backend | Solo si Categorías se siente lenta |
| Recuperación de contraseña | Backend y envío de correos | Fuera de alcance por ahora |
| Aviso de tratamiento de datos (Ley 1581 de 2012) | Texto legal en el Registro | Antes de pasar a producción; consultar con el docente |
| Paso a producción (migraciones en Railway y PR de `develop` a `main`) | Infraestructura | Al terminar el rediseño y el testing |

## Orden de trabajo

Primero las bases que comparten todas las pantallas, luego cada pantalla empezando por la de peor puntaje, y al final una pasada de pulido; son 9 ramas hacia `develop`.

1. **`style/sistema-base`:** variables CSS (colores corregidos, tipografía, espacios, sombra, movimiento), íconos y los 10 componentes nuevos, más los cambios a `Button` e `Input`. Skills: frontend-design e Impeccable (`typeset`, `colorize`).
2. **`style/estructura-app`:** menú lateral, barra inferior, menú de cuenta, encabezado y hojas en todas las pantallas. Resuelve el único P0. Skills: Impeccable (`layout`, `adapt`) y `mobile-native`.
3. **`style/resumen`:** la cifra billetera + saldos netos, el aviso de deuda, indicadores y hojas.
4. **`style/detalle-proyecto`:** pestañas, paneles de gasto, aporte y pago, y el paso de revisión del pago.
5. **`style/billetera`:** "Disponible", meta con progreso y paneles de movimiento, meta y colchón.
6. **`style/proyectos`:** renglones con tu saldo neto, orden y panel para crear.
7. **`style/categorias`:** mes nombrado, barras de progreso con texto y panel para crear.
8. **`style/login-registro`:** franja de marca en el celular, `PasswordInput` y error de correo duplicado.
9. **`style/pulido-final`:** animaciones (`find-animation-opportunities`, `review-animations`), prueba con datos extremos (`break-ui`), `audit`, nueva crítica de las 7 pantallas, `learn-taste` y actualización de `DESIGN.md`.

En paralelo, cuando haya tiempo: la rama de backend `fix/limites-longitud`.

### Una rama está terminada cuando

- [ ] `npm run build` y `npm run lint` pasan sin errores.
- [ ] Las pruebas manuales pasan en escritorio y a 375 px de ancho.
- [ ] El detector de Impeccable no reporta hallazgos en los archivos tocados.
- [ ] Cumple la lista de accesibilidad.
- [ ] En las ramas de pantalla, la nueva crítica da 28/40 o más.
- [ ] Hay capturas del "después" en escritorio y celular, para la comparación en la sustentación.
- [ ] Juan revisa y aprueba el PR, que se fusiona con "Squash and merge".

### Cómo lo usa Claude Code

En la primera rama, este plan se exporta como Markdown y se guarda en `docs/diseno/plan-rediseno.md`. Desde ahí, cada rama le pide a Claude Code leer su sección del plan antes de proponer cambios.
