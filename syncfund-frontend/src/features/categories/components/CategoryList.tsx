import { formatCOP } from '../../../styles/theme';
import type { CategoryWithSpend } from '../hooks/useCategories';
import './CategoryList.css';

export function CategoryList({ categories }: { categories: CategoryWithSpend[] }) {
  if (categories.length === 0) {
    return <p style={{ color: 'var(--ink-faint)' }}>Todavía no has creado categorías.</p>;
  }

  return (
    <ul className="category-list">
      {categories.map((cat) => {
        const pct = cat.monthlyLimit > 0 ? Math.min(100, (cat.spentThisMonth / cat.monthlyLimit) * 100) : 0;
        return (
          <li key={cat.categoryId} className="category-list__row">
            <div className="category-list__head">
              <span className="category-list__name">{cat.name}</span>
              <span className="tabular-nums category-list__amounts">
                {formatCOP(cat.spentThisMonth)} <span className="category-list__limit">/ {formatCOP(cat.monthlyLimit)}</span>
              </span>
            </div>
            <div className="category-list__bar">
              <div
                className="category-list__bar-fill"
                style={{
                  width: `${pct}%`,
                  background: cat.overLimit ? 'var(--loss-500)' : 'var(--ink-600)',
                }}
              />
            </div>
            {cat.overLimit && (
              <span className="category-list__alert">Presupuesto excedido este mes</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
