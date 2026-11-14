import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { PageColumns } from '../components/layout/PageColumns';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadError } from '../components/ui/LoadError';
import { PageHeader } from '../components/ui/PageHeader';
import { Sheet } from '../components/ui/Sheet';
import { Skeleton, SkeletonGroup, SkeletonRows } from '../components/ui/Skeleton';
import { useAuth } from '../context/useAuth';
import { BudgetAlerts } from '../features/dashboard/components/BudgetAlerts';
import { DebtNotice } from '../features/dashboard/components/DebtNotice';
import { ProjectStatusList } from '../features/dashboard/components/ProjectStatusList';
import { SummaryLedger } from '../features/dashboard/components/SummaryLedger';
import { useDashboard } from '../features/dashboard/hooks/useDashboard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatCOP } from '../styles/theme';
import './DashboardPage.css';

const FIGURE_LABEL = 'Tienes en total';

export function DashboardPage() {
  const { user } = useAuth();
  const { data, error, loading, refresh, budget, budgetError, budgetLoading, retryBudget } = useDashboard(
    user!.id,
  );
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
        {/* El anuncio va solo: si envolviera las hojas, el lector leería también sus títulos. */}
        <SkeletonGroup label="Cargando tu resumen…">{null}</SkeletonGroup>
        <PageColumns>
          <Sheet title="Tus proyectos">
            <SkeletonRows count={3} />
          </Sheet>
          <Sheet title="Presupuesto del mes">
            <SkeletonRows count={2} />
          </Sheet>
        </PageColumns>
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

      <PageColumns>
        <Sheet
          title="Tus proyectos"
          action={summary.projects.length > 0 && <Link to="/projects" className="dashboard__sheet-link">Ver todos</Link>}
        >
          {summary.projects.length > 0 ? (
            <ProjectStatusList projects={summary.projects} />
          ) : (
            <EmptyState
              title="Aún no participas en proyectos"
              description="Un proyecto reúne los aportes y los gastos de un grupo, y calcula quién le debe a quién."
              action={
                <Link to="/projects" className="sf-button sf-button--ghost dashboard__link-button">
                  Crea un proyecto
                </Link>
              }
            />
          )}
        </Sheet>
        <Sheet title="Presupuesto del mes" action={<Link to="/categories" className="dashboard__sheet-link">Ver categorías</Link>}>
          <BudgetAlerts budget={budget} error={budgetError} loading={budgetLoading} onRetry={retryBudget} />
        </Sheet>
      </PageColumns>
    </AppLayout>
  );
}
