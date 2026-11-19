# Datos demo de SyncFund

`seed-demo.mjs` carga datos de demostración **a través de la API** (no escribe directo en la base),
así que cada dato pasa por las mismas validaciones, reglas de negocio y permisos que el uso normal.

## Qué crea

**3 usuarios** (correos del dominio reservado `example.com`, todos con la misma contraseña):

| Usuario | Correo | Billetera |
|---|---|---|
| Ana Restrepo | `ana.demo@example.com` | 2 ingresos, 5 gastos, 3 categorías, colchón 800.000, meta 600.000 |
| Bruno Cárdenas | `bruno.demo@example.com` | 1 ingreso, 5 gastos, 3 categorías, colchón 400.000, meta 350.000 |
| Carla Mejía | `carla.demo@example.com` | 2 ingresos, 4 gastos, 3 categorías, colchón 150.000, meta 200.000 |

Las categorías muestran los tres estados de la barra: holgada, cerca del límite (Entretenimiento de Bruno)
y excedida (Restaurantes de Carla).

**1 proyecto compartido**, «Viaje a Santa Marta», administrado por Ana:

- Aportes: Ana 1.200.000, Bruno 600.000, Carla 300.000 (fondo 2.100.000).
- Gastos que paga el fondo: alojamiento 1.200.000 y tiquetes 450.000 entre los tres, tour en lancha
  240.000 entre Ana y Bruno, cena 180.000 entre Bruno y Carla. Queda un fondo de 30.000.
- Pago: Bruno le paga 160.000 a Ana, de billetera a billetera.

Situación final del proyecto:

| Integrante | Saldo neto | En pantalla |
|---|---|---|
| Ana | +370.000 | A tu favor |
| Bruno | 0 | Al día |
| Carla | −340.000 | Debes |

## Requisitos

- Node 18 o superior (usa `fetch` nativo; no hay dependencias que instalar).
- El backend corriendo y accesible en la URL que se indique.

## Cómo correrlo (PowerShell, desde la raíz del repositorio)

```powershell
$env:SEED_API_URL = "http://localhost:8080/api"
$s = Read-Host "Contraseña para las cuentas demo" -AsSecureString
$env:SEED_PASSWORD = [System.Net.NetworkCredential]::new('', $s).Password
Remove-Variable s

node scripts/seed-demo/seed-demo.mjs

Remove-Item Env:SEED_PASSWORD
```

- `SEED_API_URL`: URL base de la API, incluido `/api`.
- `SEED_PASSWORD`: contraseña de las tres cuentas. Mínimo 8 caracteres y máximo 72 bytes
  (las tildes, la ñ y los emojis ocupan más de un byte). Si falta o no cumple, el script no hace nada.

La contraseña nunca se escribe en el código ni se imprime; tampoco los tokens.

## Comportamiento

- **Idempotente:** antes de crear nada intenta iniciar sesión con `ana.demo@example.com`. Si entra,
  informa que los datos ya existen y termina sin crear duplicados.
- **Se detiene en el primer error**, mostrando el endpoint, el código HTTP y el mensaje de la API.
  Lo creado hasta ese punto se conserva: el script no borra nada. Si pasa, hay que limpiar esos datos
  a mano (o usar una base nueva) antes de volver a correrlo, porque al existir Ana ya no crea nada.
- Al terminar imprime un resumen (billeteras, categorías y situación del proyecto) y avisa si la
  situación no coincide con la tabla de arriba.

> Crea datos reales en la base a la que apunte `SEED_API_URL`. Revisa la URL que imprime al empezar.
