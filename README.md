# SyncFund

**Aplicación web para la gestión de finanzas personales y gastos compartidos.**

Proyecto académico desarrollado para la asignatura de Construcción de Software del Politécnico Colombiano Jaime Isaza Cadavid.

🔗 **Demo en producción:** [syncfund.vercel.app](https://syncfund.vercel.app)

---

## Tabla de contenidos

- [Descripción](#descripción)
- [Características principales](#características-principales)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Tecnologías](#tecnologías)
- [Recursos útiles](#recursos-útiles)
- [Colaboradores](#colaboradores)

---

## Descripción

SyncFund es una aplicación web que integra en un mismo sistema la administración de las finanzas personales de un usuario y la gestión de gastos realizados en grupo. Su propósito es que cada usuario pueda registrar y controlar sus propios ingresos y egresos y, a la vez, participar en fondos colectivos en los que el sistema distribuye los gastos entre los integrantes y determina el saldo de cada uno.

### Contexto

La gestión de gastos compartidos (vivienda, viajes, actividades grupales) suele llevarse por separado de las finanzas personales, lo que obliga a calcular manualmente cuánto aportó cada persona y cuánto adeuda. SyncFund unifica ambos registros: cuando un usuario participa en un gasto grupal, el valor correspondiente se descuenta tanto del fondo del grupo como de su billetera personal, de modo que ambos saldos se mantienen consistentes.

### Módulos del sistema

| Módulo | Responsabilidad |
|---|---|
| **Autenticación y usuarios** | Registro, inicio de sesión y emisión de tokens JWT. |
| **Billetera personal** (`PersonalWallet`) | Registro de movimientos (ingresos y gastos), meta de ahorro mensual y saldo de reserva ("colchón") que impide que el saldo quede en negativo. |
| **Proyectos compartidos** (`SharedProject`) | Creación de grupos, incorporación de integrantes por correo electrónico, aportes al fondo común y registro de gastos con selección de participantes. |
| **Cálculo de deudas** (`DebtCalculator`) | Determinación del saldo neto de cada integrante: si está al día, si le deben o si debe. |
| **Categorías** | Clasificación de gastos con límite de presupuesto mensual y alerta cuando se supera. |

### Enfoque de desarrollo

El sistema se diseñó antes de su implementación mediante un modelo orientado a objetos documentado en UML: diagramas de clases, paquetes, componentes, secuencia, estados y despliegue, tarjetas CRC y modelo entidad-relación. La implementación respeta ese diseño y sigue una arquitectura en capas (presentación, aplicación, dominio y persistencia). El patrón Observer se aplica en el núcleo contable para propagar los cambios de saldo de un proyecto compartido a sus participantes.

En seguridad, además de la autenticación sin estado con JWT, el backend verifica en cada operación que el recurso solicitado pertenezca al usuario o que este sea miembro del proyecto. Un token válido no permite consultar ni modificar información de otro usuario.

### Decisiones técnicas relevantes

- **Patrón Observer sobre una API REST:** el patrón se mantuvo fiel al diseño original pese a que la comunicación entre cliente y servidor es sin estado.
- **Doble registro de los gastos compartidos:** un mismo gasto afecta el fondo del proyecto y la billetera de cada participante, sin alterar el cálculo de deudas.
- **Autorización por recurso:** se separó la verificación de identidad (autenticación) de la verificación de propiedad o membresía (autorización).

### Limitaciones y trabajo futuro

- Implementar el ciclo de vida completo de un proyecto compartido descrito en las máquinas de estado (Activo → En liquidación → Cerrado).
- Reemplazar la actualización de datos por consulta periódica (*polling*) por notificaciones en tiempo real mediante WebSockets.

## Características principales

- **Billetera personal**: registro de ingresos y gastos, meta de ahorro mensual con cálculo automático de cuota, y un "colchón" de seguridad que nunca permite dejar el saldo en negativo.
- **Proyectos compartidos**: crea un grupo, agrega integrantes por correo electrónico, registra gastos selectivos (eliges quién participa en cada uno) y aportes al fondo común.
- **Cálculo de deudas en tiempo real**: en todo momento puedes ver si estás "en paz", te deben, o debes, sin tener que hacer la cuenta a mano.
- **Categorías con alerta de presupuesto**: define un límite mensual por categoría de gasto y recibe aviso visual cuando lo superas.
- **Seguridad**: autenticación con JWT y una capa de autorización que verifica, en cada petición, que el recurso solicitado pertenezca a quien hace la petición, no solo que haya iniciado sesión.

## Instalación y ejecución

### Requisitos previos

- Java 21
- Node.js (LTS) y npm
- MySQL Server 8.0+
- Git

### 1. Clona el repositorio

```bash
git clone https://github.com/Gago82241/syncfund_.git
cd syncfund_
```

### 2. Backend (`demo/`)

Crea la base de datos y un usuario dedicado en tu MySQL local:

```sql
CREATE DATABASE IF NOT EXISTS syncfund_db;
CREATE USER IF NOT EXISTS 'syncfund_user'@'localhost' IDENTIFIED BY 'TU_CONTRASEÑA';
GRANT ALL PRIVILEGES ON syncfund_db.* TO 'syncfund_user'@'localhost';
```

Crea tu configuración local a partir de la plantilla incluida y complétala con tus credenciales de MySQL y un secreto JWT propio:

```bash
cd demo/src/main/resources
cp application-local.properties.example application-local.properties   # macOS / Linux
Copy-Item application-local.properties.example application-local.properties   # Windows (PowerShell)
```

> `application-local.properties` está excluido del control de versiones y nunca debe subirse al repositorio. En producción, los mismos valores se definen como variables de entorno (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`).

Ejecuta el backend con el perfil `local`:

```bash
cd demo
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"   # Windows
./mvnw spring-boot:run -Dspring-boot.run.profiles=local          # macOS / Linux
```

El backend queda escuchando en `http://localhost:8080`. Hibernate crea las tablas automáticamente en el primer arranque.

### 3. Frontend (`syncfund-frontend/`)

```bash
cd syncfund-frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`, conectada por defecto a `http://localhost:8080/api`.

## Tecnologías

**Backend**
- [Spring Boot 4.1.1](https://spring.io/projects/spring-boot) (Java 21) — framework principal
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa) + Hibernate — persistencia
- [Spring Security](https://spring.io/projects/spring-security) + [JJWT](https://github.com/jwtk/jjwt) — autenticación y autorización
- MySQL 8 — base de datos relacional
- Maven — gestor de dependencias

**Frontend**
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) — vía [Vite](https://vite.dev/)
- [React Router](https://reactrouter.com/) — enrutamiento
- [Axios](https://axios-http.com/) — cliente HTTP

**Arquitectura y patrones de diseño**
- Arquitectura en capas (Presentación / Aplicación / Dominio / Persistencia)
- Patrón **Observer** (`SharedProject` como sujeto observable, notifica cambios de saldo a sus participantes)
- Autenticación **JWT** sin estado + autorización por recurso (dueño/membresía, no solo "está logueado")

**Infraestructura**
- [Railway](https://railway.com/) — backend y base de datos MySQL en producción
- [Vercel](https://vercel.com/) — frontend en producción
- GitHub — control de versiones

## Recursos útiles

- [Documentación oficial de Spring Boot](https://docs.spring.io/spring-boot/index.html)
- [Documentación oficial de React](https://react.dev/learn)
- [JJWT — librería JWT para Java](https://github.com/jwtk/jjwt)
- [Documentación de Railway](https://docs.railway.com/)
- [Documentación de Vercel](https://vercel.com/docs)
- [Refactoring Guru — patrón Observer](https://refactoring.guru/es/design-patterns/observer)

## Colaboradores

- **Diego Alejandro Pulgarin Gómez** — [@Gago82241](https://github.com/Gago82241)
- **Juan Jose Correa Londoño** — [@juancorrea82232-rgb](https://github.com/juancorrea82232-rgb)
- **Harold Arteaga** — [@HarArte](https://github.com/HarArte)
- **Yorleyner Mazo Cardenas** — [@yorleynermc](https://github.com/yorleynermc)

---

<p align="center">Proyecto académico · Politécnico Colombiano Jaime Isaza Cadavid · 2026</p>
