/**
 * Presupuesto del mes por categoría: lo usan el Resumen (hoja "Presupuesto del mes") y la
 * pantalla de Categorías, para que una categoría se mida, se describa y se ordene igual en las dos.
 *
 * Límite 0 = sin límite. El backend guarda `monthlyLimit` como número (no admite vacío), así que el
 * frontend envía 0 cuando el usuario deja el campo vacío y lo muestra como "Sin límite".
 * Ojo: Category.alertExcess (GET /categories/{id}/over-limit) diría "excedido" para cualquier gasto
 * con límite 0; por eso el estado se calcula aquí con lo gastado y el límite, sin consultarlo.
 */
import { categoryService } from './services/categoryService';
import { BUDGET_WARN_PERCENT, budgetPercent } from '../../utils/budget';
import type { CategoryResponse } from '../../types/api';

export interface BudgetLine {
  categoryId: number;
  name: string;
  /** Gastado en el mes en la billetera personal. */
  spent: number;
  /** Límite mensual; 0 = sin límite. */
  limit: number;
  /** Porcentaje usado como lo muestra ProgressBar (0 sin límite). */
  percent: number;
}

export function hasLimit(line: { limit: number }): boolean {
  return line.limit > 0;
}

/** Una línea por categoría, en el orden del backend. Lo no consultado cuenta como 0. */
export function toBudgetLines(
  categories: readonly CategoryResponse[],
  spentByCategory: ReadonlyMap<number, number>,
): BudgetLine[] {
  return categories.map((c) => {
    const spent = spentByCategory.get(c.categoryId) ?? 0;
    const limit = c.monthlyLimit > 0 ? c.monthlyLimit : 0;
    return { categoryId: c.categoryId, name: c.name, spent, limit, percent: budgetPercent(spent, limit) };
  });
}

/** Proporción sin redondear: ordena bien dos categorías que muestran el mismo porcentaje. */
function ratio(line: BudgetLine): number {
  return line.limit > 0 ? line.spent / line.limit : 0;
}

/**
 * Con límite: de la más usada a la menos (empates: más gastado primero, luego el orden del backend).
 * Sin límite: de la de más gasto a la de menos.
 */
export function sortBudgetLines(lines: readonly BudgetLine[]): { limited: BudgetLine[]; unlimited: BudgetLine[] } {
  const indexed = lines.map((line, index) => ({ line, index }));
  const bySpent = (a: { line: BudgetLine; index: number }, b: { line: BudgetLine; index: number }) =>
    b.line.spent - a.line.spent || a.index - b.index;
  const limited = indexed
    .filter(({ line }) => hasLimit(line))
    .sort((a, b) => ratio(b.line) - ratio(a.line) || bySpent(a, b))
    .map(({ line }) => line);
  const unlimited = indexed
    .filter(({ line }) => !hasLimit(line))
    .sort(bySpent)
    .map(({ line }) => line);
  return { limited, unlimited };
}

/** Categorías con límite que ya van en el 80 % o más este mes, de la más pasada a la menos. */
export function selectBudgetAlerts(
  categories: readonly CategoryResponse[],
  spentByCategory: ReadonlyMap<number, number>,
): BudgetLine[] {
  return sortBudgetLines(toBudgetLines(categories, spentByCategory)).limited.filter(
    (line) => line.percent >= BUDGET_WARN_PERCENT,
  );
}

/**
 * Gasto del mes de cada categoría en la billetera personal, todas las consultas en paralelo
 * (Category.calculateTotalExpense). `month` es "yyyy-MM" en hora local (currentMonthKey).
 */
export async function fetchMonthSpend(
  walletId: number,
  categories: readonly CategoryResponse[],
  month: string,
): Promise<Map<number, number>> {
  const spent = await Promise.all(
    categories.map((c) =>
      categoryService
        .getExpense(c.categoryId, walletId, 'PERSONAL', month)
        .then((r) => [c.categoryId, r.data] as const),
    ),
  );
  return new Map(spent);
}
