/** Desde este porcentaje usado, un presupuesto de categoría pasa a "Cerca del límite". */
export const BUDGET_WARN_PERCENT = 80;

/** Porcentaje usado, redondeado como lo muestra ProgressBar. Sin límite (0) cuenta como 0 %. */
export function budgetPercent(spent: number, limit: number): number {
  return limit > 0 ? Math.round((spent / limit) * 100) : 0;
}
