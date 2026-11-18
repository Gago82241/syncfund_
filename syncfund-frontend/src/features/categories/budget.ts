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
import { budgetStatus, budgetUsedPercent } from '../../utils/budget';
import type { CategoryResponse } from '../../types/api';

export interface BudgetLine {
  categoryId: number;
  name: string;
  /** Gastado en el mes en la billetera personal. */
  spent: number;
  /** Límite mensual; 0 = sin límite. */
  limit: number;
  /** Porcentaje usado como lo muestra ProgressBar (0 sin límite; 100 solo al llegar al límite). */
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
    return { categoryId: c.categoryId, name: c.name, spent, limit, percent: budgetUsedPercent(spent, limit) };
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
    (line) => budgetStatus(line.spent, line.limit) !== 'normal',
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

/** "a", "a y b", "a, b y c". */
function joinParts(parts: string[]): string {
  return parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}`;
}

/**
 * Una línea que responde "¿cómo voy?" sin sumar montos: un total de límites distintos escondería
 * que te pasaste en una categoría si te sobra en otra.
 * Ej.: "1 categoría pasada, 1 en el límite y 2 cerca del límite, de tus 5 con límite."
 * null si no hay categorías.
 */
export function budgetHeadline(limited: readonly BudgetLine[], unlimitedCount: number): string | null {
  const total = limited.length;
  if (total === 0) {
    return unlimitedCount === 0
      ? null
      : 'Ninguna categoría tiene límite: aquí ves cuánto llevas gastado en cada una.';
  }
  const statuses = limited.map((line) => budgetStatus(line.spent, line.limit));
  const over = statuses.filter((s) => s === 'over').length;
  const atLimit = statuses.filter((s) => s === 'limit').length;
  const warn = statuses.filter((s) => s === 'warn').length;

  if (over + atLimit + warn === 0) {
    return total === 1
      ? 'Vas bien en tu única categoría con límite.'
      : `Vas bien en tus ${total} categorías con límite.`;
  }

  if (total === 1) {
    if (over === 1) return 'Te pasaste en tu única categoría con límite.';
    if (atLimit === 1) return 'Llegaste al límite en tu única categoría con límite.';
    return 'Tu única categoría con límite está cerca del límite.';
  }

  // El sustantivo va solo en la primera parte: "1 categoría pasada y 2 cerca del límite".
  const parts: string[] = [];
  const add = (n: number, text: string, plural = text) => {
    const noun = parts.length === 0 ? (n === 1 ? 'categoría ' : 'categorías ') : '';
    parts.push(`${n} ${noun}${n === 1 ? text : plural}`);
  };
  if (over > 0) add(over, 'pasada', 'pasadas');
  if (atLimit > 0) add(atLimit, 'en el límite');
  if (warn > 0) add(warn, 'cerca del límite');
  return `${joinParts(parts)}, de tus ${total} con límite.`;
}
