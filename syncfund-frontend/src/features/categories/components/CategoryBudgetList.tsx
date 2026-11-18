import { useCallback } from 'react';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { formatCOP } from '../../../styles/theme';
import type { BudgetLine } from '../budget';
import './CategoryBudgetList.css';

interface ListProps {
  lines: readonly BudgetLine[];
  /** Categoría recién creada: se trae a la vista y se resalta un momento. */
  highlightId?: number | null;
}

/**
 * Trae a la vista el renglón recién creado (con 0 % queda al final, a veces bajo la acción fija
 * del celular). Sin animación de desplazamiento: "nearest" solo mueve lo necesario.
 */
function useScrollToHighlighted(highlightId: number | null | undefined) {
  // Ref de callback: la fila aparece cuando termina la recarga, no cuando cambia highlightId.
  return useCallback(
    (row: HTMLLIElement | null) => {
      if (row && highlightId != null) row.scrollIntoView({ block: 'nearest' });
    },
    [highlightId],
  );
}

/** Categorías con límite: una barra por categoría, ya ordenadas (sortBudgetLines). */
export function LimitedCategoryList({ lines, highlightId }: ListProps) {
  const highlightedRef = useScrollToHighlighted(highlightId);
  return (
    <ul className="category-budget-list">
      {lines.map((line) => (
        <li
          key={line.categoryId}
          ref={line.categoryId === highlightId ? highlightedRef : undefined}
          className={line.categoryId === highlightId ? 'category-row--new' : undefined}
        >
          <ProgressBar label={line.name} value={line.spent} max={line.limit} kind="budget" />
        </li>
      ))}
    </ul>
  );
}

/** Categorías sin límite: renglón de libro mayor con lo gastado; no hay contra qué medir. */
export function UnlimitedCategoryList({ lines, highlightId }: ListProps) {
  const highlightedRef = useScrollToHighlighted(highlightId);
  return (
    <ul className="category-spend-list">
      {lines.map((line) => (
        <li
          key={line.categoryId}
          ref={line.categoryId === highlightId ? highlightedRef : undefined}
          className={`category-spend-list__row${line.categoryId === highlightId ? ' category-row--new' : ''}`}
        >
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
