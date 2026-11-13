# SyncFund — Guía del proyecto para Claude Code

> Versión 0.5 — revisada contra la estructura real del repositorio; agrega las skills de diseño.

## Qué es SyncFund
Aplicación web de finanzas personales y gastos compartidos. Un usuario gestiona su
billetera personal (PersonalWallet: movimientos, meta de ahorro, colchón) y participa en
proyectos compartidos (SharedProject: gastos divididos entre integrantes, cálculo de deudas
y saldo neto).
- **Modelo de fondo:** un aporte sale de la billetera personal de quien aporta (GASTO en su
  billetera + INGRESO en el proyecto, con el aportante en `involvedIdsList`). Los gastos
  compartidos los paga solo el fondo, que nunca queda en negativo (422 si no alcanza).
- **Pago entre integrantes** (`POST /api/projects/{id}/settlements`, `SharedProject.settleDebts`):
  quien debe le paga a quien tiene saldo a favor, de billetera a billetera (GASTO en la de quien
  paga, INGRESO en la de quien recibe). El fondo no cambia. En el proyecto quedan un `ABONO`
  (`involvedIdsList = [quien paga]`) y un `COBRO` (`[quien recibe]`), que nunca pasan por
  `recordTransaction` ni cuentan en `auditWallet`. `POST /api/transactions` solo acepta INGRESO o GASTO.
- **Eliminar integrantes / salir** (`DELETE /api/projects/{id}/members/{userId}`, `SharedProject.removeParticipant`):
  el admin elimina a otros y un integrante puede salir, solo si está al día (|saldo| < medio centavo).
  El admin no puede salir ni ser eliminado. Sus transacciones se conservan; solo se borra la fila de
  `project_participants`.
- Saldo neto = aportes propios − parte de los gastos en que participó + pagos hechos (ABONO)
  − pagos recibidos (COBRO). Lo calcula `DebtCalculator.calculateBalances`; la suma de los
  saldos netos es igual al fondo (salvo INGRESO antiguos sin aportante, que no cuentan para nadie).

Es un proyecto académico de Ingeniería Informática; el diseño UML fue entregado y evaluado
previamente.
- **Grupo del proyecto:** cuatro integrantes (los de la sección Colaboradores del README).
- **Desarrollo con Claude Code:** Diego y Juan.

## Stack
- **Backend:** Spring Boot 4.1.1, Java 21, Spring Security + JWT, JPA/Hibernate
- **Base de datos:** MySQL
- **Frontend:** React 19 + TypeScript 6, Vite 8, React Router 7, Axios para las llamadas a la API
  - Estilos con CSS propio (sin Tailwind ni librería de componentes).
  - Aún no hay librería de formularios/validación ni framework de pruebas instalados;
    proponer antes de agregar cualquier dependencia nueva.
- **Despliegue:** backend + MySQL en Railway, frontend en Vercel
  - Producción: https://syncfund.vercel.app  ·  API: https://syncfund-production.up.railway.app

## Estructura del repositorio
```
syncfund_/
├── demo/                → BACKEND (Spring Boot + Maven). El nombre "demo" viene de
│                          Spring Initializr; NO renombrar: Railway despliega desde esta carpeta.
├── syncfund-frontend/   → FRONTEND (React + TypeScript + Vite)
│   └── env.example      → plantilla de variables de entorno (sin valores reales)
├── docs/                → documentación del proyecto (diseño UML, etc.)
├── CLAUDE.md
└── README.md
```
- Cada subproyecto tiene su propio `.gitignore` (`demo/.gitignore`, `syncfund-frontend/.gitignore`).
- Nunca editar ni versionar `demo/target/` ni `syncfund-frontend/node_modules/`.

## Comandos
Desarrollo en Windows (PowerShell). Ejecutar desde la raíz del repo.

| Acción | Comando |
|---|---|
| Correr backend | `cd demo; .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"` |
| Pruebas backend | `cd demo; .\mvnw.cmd test` |
| Instalar dependencias frontend | `cd syncfund-frontend; npm install` |
| Correr frontend | `cd syncfund-frontend; npm run dev` |
| Compilar frontend (`tsc -b && vite build`, incluye chequeo de tipos) | `cd syncfund-frontend; npm run build` |
| Lint frontend (ESLint) | `cd syncfund-frontend; npm run lint` |
| Previsualizar el build | `cd syncfund-frontend; npm run preview` |

Antes de dar por terminado un cambio en el frontend: `npm run build` y `npm run lint` sin errores.
Antes de dar por terminado un cambio en el backend: `.\mvnw.cmd test` sin fallos.

## Reglas de arquitectura (obligatorias)
1. **Respetar el diseño UML entregado.** No crear clases de dominio nuevas ni cambiar
   atributos o firmas de métodos definidos en la documentación. Si una tarea parece
   requerirlo, DETENERSE y proponerlo al equipo antes de escribir código.
   - Excepción permitida: componentes y archivos propios del frontend, y clases de la capa
     de transporte (DTOs de request/response) y manejo de errores.
2. **Arquitectura en capas:** Controller → Service → Repository → Model.
   - Los controllers no acceden a repositories directamente.
   - La lógica de negocio vive en los services, no en controllers ni en el frontend.
3. **Patrón Observer** en Core_Accounting: no reemplazarlo ni saltárselo al registrar
   movimientos o gastos.
4. **No modificar el esquema de la base de datos** (tablas, columnas, relaciones) sin
   aprobación explícita del equipo. Producción usa la misma estructura.
   - Un cambio de esquema sobre tablas con datos lleva un script manual en
     `docs/base-de-datos/migraciones/`, que se ejecuta antes del despliegue. `ddl-auto=update`
     también corre en producción y no basta: una columna `NOT NULL` nueva deja las filas
     existentes con un valor por defecto, y si la llave foránea falla solo registra una advertencia.
   - Los enums persistidos (`transactions.type`, `origin_wallet_type`) son `ENUM` nativos de MySQL:
     un valor nuevo en el enum de Java exige un `ALTER TABLE ... MODIFY` en un script de migración
     (ver `tipos-pago-entre-integrantes.sql`).

## Seguridad (no romper)
- Todas las rutas exigen JWT excepto `/api/auth/**` y las peticiones `OPTIONS` (preflight CORS).
- Toda operación sobre PersonalWallet, SharedProject, Category o User debe verificar dueño/membresía con
  `CurrentUserProvider`; si no corresponde, lanzar `ForbiddenException` (403).
- La configuración CORS usa `.cors(Customizer.withDefaults())`; no eliminarla.
- Nunca escribir contraseñas, secretos JWT ni URLs de conexión en el código: usar variables
  de entorno.
- Configuración local en `demo/src/main/resources/application-local.properties` (ignorado por Git).
  Para crearlo, copiar `application-local.properties.example` y completar los valores propios.
  Nunca agregar valores por defecto con secretos en `application.properties`.

## Validaciones y errores
- Toda entrada de la API llega como DTO anotado con Bean Validation
  (`@NotBlank`, `@Email`, `@Positive`, `@Size`, …) y el controller usa `@Valid`.
- Los errores se devuelven siempre con el mismo formato JSON desde un único
  `@RestControllerAdvice`:
  - Validación → 400 `{ "status": 400, "message": "...", "errors": { "campo": "mensaje" } }`
    (un solo mensaje por campo)
  - Solicitud mal formada → 400 `{ "status": 400, "message": "..." }` (sin `errors`)
  - Sin sesión válida → 401 `{ "status": 401, "message": "..." }`
  - Sin permiso → 403 `{ "status": 403, "message": "..." }`
  - No encontrado → 404 `{ "status": 404, "message": "..." }`
  - Conflicto de estado → 409 `{ "status": 409, "message": "..." }`
  - Regla de negocio incumplida → 422 `{ "status": 422, "message": "..." }`
  - Error interno → 500 `{ "status": 500, "message": "..." }` (mensaje genérico, sin detalles técnicos)
- Mensajes de error en español, claros para el usuario final.
- El frontend valida también los formularios antes de enviar, pero el backend es la
  validación definitiva.

## Sistema de diseño — "Libro mayor, no dashboard"
- Identidad: sobria, confiable, propia de una app financiera.
- Colores: **azul tinta** (marca/primario), **verde esmeralda** (ingresos, éxito),
  **terracota** (gastos, errores).
- Tipografías: **Fraunces** (títulos, cifras destacadas) y **Figtree** (texto e interfaz).
- **Fuente única de verdad del diseño:**
  - `syncfund-frontend/src/styles/globals.css` → variables CSS globales, tipografías y estilos base
  - `syncfund-frontend/src/styles/theme.ts` → tokens de diseño para usar desde TypeScript
  - Leer ambos archivos antes de cualquier cambio visual. Si se necesita un color o tamaño
    nuevo, agregarlo como token en esos archivos; nunca escribir valores hex sueltos en componentes.
- Reutilizar los componentes existentes antes de crear otros nuevos.
- Toda pantalla debe funcionar en móvil y escritorio.

## Skills de diseño
Instaladas en el proyecto para el rediseño visual del frontend.

**Qué skill se usa para qué**
- **Dirección visual:** `frontend-design` (plugin de Anthropic, habilitado en `.claude/settings.json`).
- **impeccable** (`.claude/skills/impeccable`, con sus subagentes en `.claude/agents`):
  - Diagnóstico: `init`, `document`, `critique`.
  - Construcción: `shape`, `layout`, `adapt`, `harden`.
  - Cierre: `audit`, `polish`.
- **Emil Kowalski** (`.claude/skills`):
  - `emil-design-eng`, `find-animation-opportunities`, `review-animations` → animaciones e interacción.
  - `mobile-native` → sensación nativa en móvil.
  - `break-ui` → pruebas con datos extremos (nombres largos, montos enormes, listas vacías…).
  - `learn-taste` → registrar las correcciones de diseño que haga el equipo.

**Reglas**
- Este CLAUDE.md tiene prioridad sobre cualquier skill: si una skill sugiere algo que lo contradice, gana CLAUDE.md.
- El rediseño es solo frontend (`syncfund-frontend/`); no se toca el backend (`demo/`).
- No se agregan librerías nuevas (animación, componentes, iconos, etc.) sin aprobación del equipo.
- Colores, tipografías y espacios solo como tokens en `globals.css` / `theme.ts`.
- **No usar el modo "live" de impeccable** (ni el subagente `impeccable-manual-edit-applier`, que solo sirve para ese modo).
- Se conserva la identidad "libro mayor" (azul tinta, esmeralda, terracota; Fraunces + Figtree)
  salvo que el equipo decida otra cosa.

**Qué se versiona y qué no** (ver `.gitignore` de la raíz)
- Se suben: `.claude/settings.json`, `.claude/skills/` (sin `bin/`), `.claude/agents/` y `skills-lock.json`.
- No se suben: `.claude/settings.local.json` (hooks y permisos de cada uno),
  `.claude/skills/impeccable/scripts/bin/` (motor binario) y `.agents/` (copia para otros agentes).

**Activarlo en otro equipo**
1. Traer la rama; las skills y los subagentes llegan con el repositorio.
2. En Claude Code: `/plugins` → instalar `frontend-design`.
3. Descargar el motor de impeccable una sola vez (no hace falta `npx impeccable install`). Desde la raíz, en PowerShell:
   `.\.claude\skills\impeccable\scripts\impeccable.cmd engine-probe`
   Debe imprimir `impeccable-engine 0.1.23`. El launcher descarga el binario de los releases de GitHub,
   verifica su SHA-256 contra `scripts/engine-checksums.txt` y lo guarda en `%USERPROFILE%\.impeccable\bin\0.1.23\`.
   Requiere red, `curl.exe` y `certutil` (vienen con Windows 10/11). Si se omite, el motor se descarga
   la primera vez que se use, pero los hooks tienen un límite de 5 s y la descarga puede no alcanzar.
4. (Opcional) Hook del detector de diseño: como `settings.local.json` no se sube, activarlo con
   `/impeccable hooks on`, o copiar el bloque `hooks` de otro `settings.local.json` del equipo.
   Corre después de cada edición de archivos de UI y al final de cada turno; nunca bloquea una edición,
   solo agrega recordatorios. Se apaga con `/impeccable hooks off`.

## Forma de trabajo con Claude
- Trabajar **por partes**: una tarea concreta a la vez.
- Para cambios que toquen varios archivos: presentar primero un plan y esperar aprobación.
- Después de cambiar código: compilar y correr las pruebas relacionadas.
- Explicar brevemente qué se cambió y por qué (el equipo debe poder sustentarlo).
- Nunca hacer `push` directo a `main` ni a `develop`.

## Flujo Git
- `main` = producción (despliega automáticamente en Vercel y Railway).
- `develop` = integración; aquí se unen las mejoras antes de pasar a producción.
- Ramas de trabajo desde `develop`: `feature/<descripcion>`, `fix/<descripcion>`,
  `style/<descripcion>`.
- Commits con prefijo (Conventional Commits), en español:
  `feat: agrega validación de monto en MovementRequest`
  `fix: corrige cálculo de deuda con un solo integrante`
  `style: aplica nueva paleta al dashboard`
- Todo cambio entra por Pull Request revisado por el otro desarrollador (Diego o Juan).
- La documentación de diseño (UML, patrones Observer y Arquitectura en Capas, MER) está en el
  README y en `docs/diagramas/`. Consultarla antes de modificar el dominio o la estructura de capas.
