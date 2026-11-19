/** Desde este porcentaje usado, un presupuesto de categoría pasa a "Cerca del límite". */
export const BUDGET_WARN_PERCENT = 80;

/** Medio peso: por debajo, gastado y límite se consideran iguales (los montos llegan como double). */
const TOLERANCE = 0.5;

/** Porcentaje redondeado (meta de ahorro y base del de presupuesto). Sin límite (0) cuenta como 0 %. */
export function budgetPercent(spent: number, limit: number): number {
  return limit > 0 ? Math.round((spent / limit) * 100) : 0;
}

/**
 * Estado de un presupuesto de categoría, con los montos sin redondear:
 *   over:  gastado > límite (como Category.alertExcess en el backend);
 *   limit: gastado = límite (llegaste, pero no te pasaste);
 *   warn:  80 % o más;
 *   normal: lo demás, y siempre si no hay límite.
 */
export type BudgetStatus = 'normal' | 'warn' | 'limit' | 'over';

export function budgetStatus(spent: number, limit: number): BudgetStatus {
  if (limit <= 0) return 'normal';
  if (spent > limit + TOLERANCE) return 'over';
  if (spent >= limit - TOLERANCE) return 'limit';
  if ((spent / limit) * 100 >= BUDGET_WARN_PERCENT) return 'warn';
  return 'normal';
}

/**
 * Porcentaje usado que se muestra en un presupuesto: nunca dice "100 %" sin haber llegado al
 * límite (199.500 de 200.000 es 99 %) ni menos de 100 % cuando ya llegó.
 */
export function budgetUsedPercent(spent: number, limit: number): number {
  const percent = budgetPercent(spent, limit);
  const status = budgetStatus(spent, limit);
  if (status === 'limit') return 100;
  if (status === 'over') return Math.max(percent, 100);
  return Math.min(percent, 99);
}
