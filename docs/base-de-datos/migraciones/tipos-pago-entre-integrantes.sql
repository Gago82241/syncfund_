-- =====================================================================
-- Migración: pagos entre integrantes de un proyecto compartido
-- (transactions.type admite ABONO y COBRO)
--
-- Un pago de Y a X dentro de un proyecto deja dos registros del proyecto
-- que NO mueven el fondo: ABONO (involvedIdsList = [Y], sube su saldo neto)
-- y COBRO (involvedIdsList = [X], baja su saldo neto).
--
-- Se ejecuta A MANO. Debe correr ANTES de desplegar el código: la columna es
-- un ENUM nativo de MySQL y ddl-auto=update no modifica columnas existentes,
-- así que sin este script el primer pago falla con "Data truncated for column 'type'".
--
-- Orden: PASO 1 > PASO 2 > desplegar > Comprobación final
-- No borra ni modifica filas: solo agrega dos valores al final del ENUM.
-- Agregar valores al final conserva los existentes y en MySQL 8 no reescribe la tabla.
-- El código anterior sigue funcionando con la columna ampliada.
-- =====================================================================


-- ---------------------------------------------------------------------
-- PASO 1. Diagnóstico (solo lectura).
-- Se espera: type = enum('GASTO','INGRESO').
-- Si ya aparece enum('GASTO','INGRESO','ABONO','COBRO'), el script ya corrió: no seguir.
-- Si aparece varchar, no hace falta el PASO 2.
-- ---------------------------------------------------------------------
SHOW COLUMNS FROM transactions LIKE 'type';

SELECT type, COUNT(*) AS movimientos FROM transactions GROUP BY type;


-- ---------------------------------------------------------------------
-- PASO 2. Amplía el ENUM. Quite /* y */ para ejecutarlo.
-- ---------------------------------------------------------------------
/* INICIO PASO 2
ALTER TABLE transactions
    MODIFY COLUMN type ENUM('GASTO','INGRESO','ABONO','COBRO') NOT NULL;
FIN PASO 2 */


-- ---------------------------------------------------------------------
-- >>> AQUÍ SE DESPLIEGA EL CÓDIGO <<<
-- ---------------------------------------------------------------------


-- ---------------------------------------------------------------------
-- Comprobación final (solo lectura).
-- La columna debe mostrar enum('GASTO','INGRESO','ABONO','COBRO') NOT NULL y
-- el conteo por tipo debe ser el mismo del PASO 1 (más los pagos nuevos, si hay).
-- ---------------------------------------------------------------------
SHOW COLUMNS FROM transactions LIKE 'type';

SELECT type, COUNT(*) AS movimientos FROM transactions GROUP BY type;
