import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadError } from '../components/ui/LoadError';
import { PageHeader } from '../components/ui/PageHeader';
import { Skeleton, SkeletonGroup } from '../components/ui/Skeleton';
import { useAuth } from '../context/useAuth';
import { DebtNotice } from '../features/dashboard/components/DebtNotice';
import { SummaryLedger } from '../features/dashboard/components/SummaryLedger';
import { useDashboard } from '../features/dashboard/hooks/useDashboard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatCOP } from '../styles/theme';
import './DashboardPage.css';

const FIGURE_LABEL = 'Tienes en total';

export function DashboardPage() {
  const { user } = useAuth();
  const { data, error, loading, refresh } = useDashboard(user!.id);
  useDocumentTitle('Resumen · SyncFund');

  // Certeza sobre cada peso: con error no se muestra ninguna cifra, ni siquiera la anterior.
  if (error) {
    return (
      <AppLayout>
        <PageHeader title="Resumen" />
        <LoadError message={error.message} onRetry={error.canRetry ? refresh : undefined} retrying={loading} />
      </AppLayout>
    );
  }

  if (data === null) {
    return (
      <AppLayout>
        <PageHeader
          title="Resumen"
          figure={{ label: FIGURE_LABEL, value: <Skeleton variant="figure" /> }}
          meta={
            <span className="dashboard__ledger-skeleton" aria-hidden="true">
              <Skeleton width="16rem" />
              <Skeleton width="13rem" />
              <Skeleton width="11rem" />
            </span>
          }
        />
        <SkeletonGroup label="Cargando tu resumen…">
          <Skeleton variant="block" height="5.5rem" />
        </SkeletonGroup>
      </AppLayout>
    );
  }

  // Usuario nuevo: en vez de una cifra en cero, el primer paso.
  if (data.isNewUser) {
    return (
      <AppLayout>
        <PageHeader title="Resumen" />
        <EmptyState
          icon="resumen"
          title="Aún no tienes movimientos ni proyectos"
          description="Registra un ingreso para empezar a llevar tu dinero, o crea un proyecto para compartir gastos con otras personas."
          action={
            <div className="dashboard__first-steps">
              <Link to="/wallet" className="sf-button sf-button--primary dashboard__link-button">
                Registra tu primer ingreso
              </Link>
              <Link to="/projects" className="sf-button sf-button--ghost dashboard__link-button">
                Crea un proyecto
              </Link>
            </div>
          }
        />
      </AppLayout>
    );
  }

  const { summary } = data;

  return (
    <AppLayout>
      <PageHeader
        title="Resumen"
        figure={{
          label: FIGURE_LABEL,
          value: formatCOP(summary.total),
          tone: summary.total < 0 ? 'loss' : 'neutral',
        }}
        meta={<SummaryLedger summary={summary} />}
      />

      {summary.debts.length > 0 && <DebtNotice debts={summary.debts} />}
      {summary.debts.length === 0 && summary.projects.length > 0 && (
        <p className="dashboard__even">Estás al día en todos tus proyectos.</p>
      )}
    </AppLayout>
  );
}
