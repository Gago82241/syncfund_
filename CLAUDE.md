# SyncFund — Guía del proyecto para Claude Code

> Borrador v0.1 — revisar en equipo antes de subirlo al repositorio.
> Los puntos marcados con **[VERIFICAR]** dependen de cómo está organizado el código real.

## Qué es SyncFund
Aplicación web de finanzas personales y gastos compartidos. Un usuario gestiona su
billetera personal (PersonalWallet: movimientos, meta de ahorro, colchón) y participa en
proyectos compartidos (SharedProject: gastos divididos entre integrantes, cálculo de deudas
y saldo neto). Es un proyecto académico de Ingeniería Informática desarrollado por dos
integrantes; el diseño UML fue entregado y evaluado previamente.

## Stack
- **Backend:** Spring Boot 4.1.1, Java 21, Spring Security + JWT, JPA/Hibernate
- **Base de datos:** MySQL
- **Frontend:** React + TypeScript, Vite
- **Despliegue:** backend + MySQL en Railway, frontend en Vercel
  - Producción: https://syncfund.vercel.app  ·  API: https://syncfund-production.up.railway.app

## Estructura del repositorio  [VERIFICAR]
```
/backend     → proyecto Spring Boot
/frontend    → proyecto React + Vite
CLAUDE.md
```

## Comandos  [VERIFICAR]
| Acción | Comando |
|---|---|
| Correr backend | `cd backend && ./mvnw spring-boot:run` |
| Pruebas backend | `cd backend && ./mvnw test` |
| Correr frontend | `cd frontend && npm run dev` |
| Compilar frontend | `cd frontend && npm run build` |
| Revisar tipos/lint | `cd frontend && npm run lint` |

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

## Seguridad (no romper)
- Todas las rutas exigen JWT excepto `/api/auth/**` y las peticiones `OPTIONS` (preflight CORS).
- Toda operación sobre PersonalWallet, SharedProject o User debe verificar dueño/membresía con
  `CurrentUserProvider`; si no corresponde, lanzar `ForbiddenException` (403).
- La configuración CORS usa `.cors(Customizer.withDefaults())`; no eliminarla.
- Nunca escribir contraseñas, secretos JWT ni URLs de conexión en el código: usar variables
  de entorno.

## Validaciones y errores
- Toda entrada de la API llega como DTO anotado con Bean Validation
  (`@NotBlank`, `@Email`, `@Positive`, `@Size`, …) y el controller usa `@Valid`.
- Los errores se devuelven siempre con el mismo formato JSON desde un único
  `@RestControllerAdvice`:
  - Validación → 400 `{ "status": 400, "errors": { "campo": "mensaje" } }`
  - Sin permiso → 403 `{ "status": 403, "message": "..." }`
  - No encontrado → 404 `{ "status": 404, "message": "..." }`
- Mensajes de error en español, claros para el usuario final.
- El frontend valida también los formularios antes de enviar, pero el backend es la
  validación definitiva.

## Sistema de diseño — "Libro mayor, no dashboard"
- Identidad: sobria, confiable, propia de una app financiera.
- Colores: **azul tinta** (marca/primario), **verde esmeralda** (ingresos, éxito),
  **terracota** (gastos, errores). [VERIFICAR: ubicar los valores hex en el archivo de tokens/estilos]
- Tipografías: **Fraunces** (títulos, cifras destacadas) y **Figtree** (texto e interfaz).
- Reutilizar los tokens y componentes existentes; no introducir colores ni fuentes sueltas.
- Toda pantalla debe funcionar en móvil y escritorio.

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
- Todo cambio entra por Pull Request revisado por el otro integrante.
