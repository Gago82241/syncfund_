/**
 * Menos de medio centavo se considera "al día": las partes de un gasto entre 3 no son exactas
 * (100.000 / 3), y tras pagar con 2 decimales queda un residuo como -0,0033.
 * Lo usan la tarjeta resumen y la tabla de situación, para que el mismo saldo nunca se muestre
 * con dos estados distintos.
 */
export const HALF_CENT = 0.005;

/** Menos de medio centavo cuenta como cero (mismo criterio que el backend y MoneyStatus). */
export function settle(amount: number): number {
  return Math.abs(amount) < HALF_CENT ? 0 : amount;
}
