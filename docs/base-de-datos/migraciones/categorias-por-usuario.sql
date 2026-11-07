-- =====================================================================
-- Migración: cada categoría pertenece a un usuario (categories.user_id)
--
-- Se ejecuta A MANO y POR PARTES. Debe correr ANTES de desplegar el código:
-- si el código llega primero, ddl-auto=update agrega la columna con 0 en las
-- filas existentes, la llave foránea falla y las categorías dejan de ser
-- visibles para todos.
--
-- Orden: PASO 1 > PASO 2 > PASO 3 (opción A u opción B) > desplegar > PASO 4
-- Los bloques que borran o modifican datos están comentados a propósito:
-- quite /* y */ solo del bloque que vaya a ejecutar.
-- Haga una copia de seguridad antes del PASO 2.
-- =====================================================================


-- ---------------------------------------------------------------------
-- PASO 1. Diagnóstico (solo lectura). Sirve para elegir la opción del PASO 3.
-- ---------------------------------------------------------------------
SELECT c.category_id, c.name,
       COUNT(DISTINCT pw.user_id)                     AS usuarios_personales,
       COALESCE(SUM(t.origin_wallet_type = 'SHARED'), 0) AS usos_compartidos,
       COUNT(t.transaction_id)                        AS usos_totales
FROM categories c
LEFT JOIN transactions t ON t.category_id = c.category_id
LEFT JOIN personal_wallets pw
       ON t.origin_wallet_type = 'PERSONAL' AND pw.wallet_id = t.origin_wallet_id
GROUP BY c.category_id, c.name;


-- ---------------------------------------------------------------------
-- PASO 2. Agrega la columna, todavía opcional: el código anterior sigue
-- funcionando porque no la conoce.
-- ---------------------------------------------------------------------
/* INICIO PASO 2
ALTER TABLE categories
    ADD COLUMN user_id BIGINT NULL,
    ADD CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES users (user_id);
FIN PASO 2 */


-- ---------------------------------------------------------------------
-- PASO 3, OPCIÓN A. Reiniciar: quita la categoría de los movimientos y borra
-- todas las categorías. Movimientos y saldos quedan intactos.
-- Para bases con solo datos de prueba.
-- ---------------------------------------------------------------------
/* INICIO OPCION A
START TRANSACTION;
UPDATE transactions SET category_id = NULL WHERE category_id IS NOT NULL;
DELETE FROM categories;
COMMIT;
FIN OPCION A */


-- ---------------------------------------------------------------------
-- PASO 3, OPCIÓN B. Inferir y clonar. Para bases con usuarios reales.
-- La única pista del dueño son los movimientos personales:
--   - Usada por un usuario: pasa a ser suya.
--   - Usada por varios: queda del primero y los demás reciben una copia.
--   - Gasto compartido: conserva la categoría solo si su dueño integra el proyecto.
--   - Sin uso personal: no se puede saber de quién es, y se borra.
-- ---------------------------------------------------------------------
/* INICIO OPCION B
ALTER TABLE categories ADD COLUMN origen_id BIGINT NULL;

START TRANSACTION;

UPDATE categories c
JOIN (
    SELECT t.category_id, MIN(pw.user_id) AS owner_id
    FROM transactions t
    JOIN personal_wallets pw
      ON t.origin_wallet_type = 'PERSONAL' AND pw.wallet_id = t.origin_wallet_id
    WHERE t.category_id IS NOT NULL
    GROUP BY t.category_id
) usos ON usos.category_id = c.category_id
SET c.user_id = usos.owner_id;

INSERT INTO categories (name, monthly_limit, user_id, origen_id)
SELECT DISTINCT c.name, c.monthly_limit, pw.user_id, c.category_id
FROM transactions t
JOIN personal_wallets pw
  ON t.origin_wallet_type = 'PERSONAL' AND pw.wallet_id = t.origin_wallet_id
JOIN categories c ON c.category_id = t.category_id
WHERE pw.user_id <> c.user_id;

UPDATE transactions t
JOIN personal_wallets pw
  ON t.origin_wallet_type = 'PERSONAL' AND pw.wallet_id = t.origin_wallet_id
JOIN categories copia ON copia.origen_id = t.category_id AND copia.user_id = pw.user_id
SET t.category_id = copia.category_id;

UPDATE transactions t
JOIN categories c ON c.category_id = t.category_id
LEFT JOIN project_participants pp
       ON pp.project_id = t.origin_wallet_id AND pp.user_id = c.user_id
SET t.category_id = NULL
WHERE t.origin_wallet_type = 'SHARED' AND pp.user_id IS NULL;

UPDATE transactions t
JOIN categories c ON c.category_id = t.category_id
SET t.category_id = NULL
WHERE c.user_id IS NULL;

DELETE FROM categories WHERE user_id IS NULL;

COMMIT;

ALTER TABLE categories DROP COLUMN origen_id;
FIN OPCION B */


-- ---------------------------------------------------------------------
-- >>> AQUÍ SE DESPLIEGA EL CÓDIGO <<<
-- ---------------------------------------------------------------------


-- ---------------------------------------------------------------------
-- PASO 4. Después del despliegue: resuelve las categorías creadas sin dueño
-- por el código anterior mientras tanto y vuelve obligatoria la columna.
-- Solo toca filas sin dueño: no borra las que ya se crearon con el código nuevo.
-- ---------------------------------------------------------------------
/* INICIO PASO 4
START TRANSACTION;
UPDATE transactions t
JOIN categories c ON c.category_id = t.category_id
SET t.category_id = NULL
WHERE c.user_id IS NULL;
DELETE FROM categories WHERE user_id IS NULL;
COMMIT;

ALTER TABLE categories MODIFY user_id BIGINT NOT NULL;
FIN PASO 4 */


-- ---------------------------------------------------------------------
-- Comprobación final (solo lectura). Las dos cuentas deben dar 0, y
-- SHOW CREATE TABLE debe mostrar user_id NOT NULL y una sola llave hacia users.
-- ---------------------------------------------------------------------
SELECT COUNT(*) AS categorias_sin_dueno FROM categories WHERE user_id IS NULL;

SELECT COUNT(*) AS movimientos_con_categoria_inexistente
FROM transactions t
LEFT JOIN categories c ON c.category_id = t.category_id
WHERE t.category_id IS NOT NULL AND c.category_id IS NULL;

SHOW CREATE TABLE categories;
