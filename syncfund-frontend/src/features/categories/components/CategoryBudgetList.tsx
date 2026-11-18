import { ProgressBar } from '../../../components/ui/ProgressBar';
import { formatCOP } from '../../../styles/theme';
import type { BudgetLine } from '../budget';
import './CategoryBudgetList.css';

/** Categorías con límite: una barra por categoría, ya ordenadas (sortBudgetLines). */
export function LimitedCategoryList({ lines }: { lines: readonly BudgetLine[] }) {
  return (
    <ul className="category-budget-list">
      {lines.map((line) => (
        <li key={line.categoryId}>
          <ProgressBar label={line.name} value={line.spent} max={line.limit} kind="budget" />
        </li>
      ))}
    </ul>
  );
}

/** Categorías sin límite: renglón de libro mayor con lo gastado; no hay contra qué medir. */
export function UnlimitedCategoryList({ lines }: { lines: readonly BudgetLine[] }) {
  return (
    <ul className="category-spend-list">
      {lines.map((line) => (
        <li key={line.categoryId} className="category-spend-list__row">
          <span className="category-spend-list__name">{line.name}</span>
          <span className="category-spend-list__amount tabular-nums">
            {formatCOP(line.spent)}
            <span className="visually-hidden"> gastado este mes</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
