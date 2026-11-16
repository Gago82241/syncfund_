import { formatCOP } from '../../../styles/theme';
import type { BudgetLine } from '../budget';
import './CategoryList.css';

export function CategoryList({ categories }: { categories: BudgetLine[] }) {
  if (categories.length === 0) {
    return <p style={{ color: 'var(--ink-faint)' }}>Todavía no has creado categorías.</p>;
  }

  return (
    <ul className="category-list">
      {categories.map((cat) => {
        const pct = Math.min(100, cat.percent);
        const overLimit = cat.limit > 0 && cat.spent > cat.limit;
        return (
          <li key={cat.categoryId} className="category-list__row">
            <div className="category-list__head">
              <span className="category-list__name">{cat.name}</span>
              <span className="tabular-nums category-list__amounts">
                {formatCOP(cat.spent)} <span className="category-list__limit">/ {formatCOP(cat.limit)}</span>
              </span>
            </div>
            <div className="category-list__bar">
              <div
                className="category-list__bar-fill"
                style={{
                  width: `${pct}%`,
                  background: overLimit ? 'var(--loss-500)' : 'var(--ink-600)',
                }}
              />
            </div>
            {overLimit && (
              <span className="category-list__alert">Presupuesto excedido este mes</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
