import { LoadError } from '../../../components/ui/LoadError';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { SkeletonGroup, SkeletonRows } from '../../../components/ui/Skeleton';
import type { LoadErrorInfo } from '../../../utils/apiError';
import { formatMonthLabel } from '../../../utils/formatDate';
import type { BudgetData } from '../hooks/useDashboard';
import './BudgetAlerts.css';

interface Props {
  budget: BudgetData | null;
  error: LoadErrorInfo | null;
  loading: boolean;
  onRetry: () => void;
}

/**
 * Contenido de la hoja "Presupuesto del mes": solo las categorías cerca del límite (80 %) o
 * pasadas. Si no carga, avisa aquí mismo; la cifra del Resumen no depende de esto.
 */
export function BudgetAlerts({ budget, error, loading, onRetry }: Props) {
  if (error) {
    return <LoadError message={error.message} onRetry={error.canRetry ? onRetry : undefined} retrying={loading} />;
  }
  if (budget === null) {
    return (
      <SkeletonGroup label="Cargando tu presupuesto…">
        <SkeletonRows count={2} />
      </SkeletonGroup>
    );
  }

  const month = formatMonthLabel(budget.month);
  if (budget.limitedCount === 0) {
    return <p className="budget-alerts__note">No tienes categorías con límite mensual.</p>;
  }
  if (budget.alerts.length === 0) {
    return <p className="budget-alerts__note">Ninguna categoría está cerca de su límite en {month}.</p>;
  }

  return (
    <>
      <p className="budget-alerts__note">Categorías que van en el 80 % o más de su límite en {month}.</p>
      <ul className="budget-alerts__list">
        {budget.alerts.map((alert) => (
          <li key={alert.categoryId}>
            <ProgressBar label={alert.name} value={alert.spent} max={alert.limit} kind="budget" />
          </li>
        ))}
      </ul>
    </>
  );
}
