import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { PageColumns } from '../components/layout/PageColumns';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';
import { LoadError } from '../components/ui/LoadError';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { Sheet } from '../components/ui/Sheet';
import { Skeleton, SkeletonGroup, SkeletonRows } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/toast/useToast';
import { useAuth } from '../context/useAuth';
import { BudgetAlerts } from '../features/dashboard/components/BudgetAlerts';
import { DebtNotice } from '../features/dashboard/components/DebtNotice';
import { ProjectStatusList } from '../features/shared-project/components/ProjectStatusList';
import { SummaryLedger } from '../features/dashboard/components/SummaryLedger';
import { savedMovementMessage } from '../features/personal-wallet/movementMessage';
import { useDashboard } from '../features/dashboard/hooks/useDashboard';
import { TransactionForm, type SavedMovement } from '../features/personal-wallet/components/TransactionForm';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatCOP } from '../styles/theme';
import './DashboardPage.css';

const FIGURE_LABEL = 'Tienes en total';

type MovementType = 'INGRESO' | 'GASTO';

export function DashboardPage() {
  const { user } = useAuth();
  const { data, error, loading, refresh, refreshAfterAction, budget, budgetError, budgetLoading, retryBudget } =
    useDashboard(user!.id);
  const { showToast } = useToast();
  // formKey vuelve a montar el formulario en cada apertura: arranca limpio y con el tipo pedido.
  const [panel, setPanel] = useState<{ open: boolean; type: MovementType; formKey: number }>({
    open: false,
    type: 'GASTO',
    formKey: 0,
  });
  useDocumentTitle('Resumen · SyncFund');

  // Recién registrado (ver RegisterPage): confirma la cuenta una sola vez y limpia el estado,
  // para que recargar o volver no repita el aviso. El ref evita el doble aviso del StrictMode.
  const location = useLocation();
  const navigate = useNavigate();
  const welcomed = useRef(false);
  useEffect(() => {
    if (welcomed.current || (location.state as { welcome?: boolean } | null)?.welcome !== true) return;
    welcomed.current = true;
    showToast('Tu cuenta quedó creada.');
    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate, showToast]);

  function openPanel(type: MovementType) {
    setPanel((current) => ({ open: true, type, formKey: current.formKey + 1 }));
  }

  function closePanel() {
    setPanel((current) => ({ ...current, open: false }));
  }

  function handleSaved(saved: SavedMovement) {
    closePanel();
    showToast(savedMovementMessage(saved));
    refreshAfterAction();
  }

  let content: ReactNode;

  // Certeza sobre cada peso: con error no se muestra ninguna cifra, ni siquiera la anterior.
  if (error) {
    content = (
      <>
        <PageHeader title="Resumen" />
        <LoadError message={error.message} onRetry={error.canRetry ? refresh : undefined} retrying={loading} />
      </>
    );
  } else if (data === null) {
    content = (
      <>
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
      </>
    );
  } else if (data.isNewUser) {
    // Usuario nuevo: en vez de una cifra en cero, el primer paso.
    content = (
      <>
        <PageHeader title="Resumen" />
        <EmptyState
          icon="resumen"
          title="Aún no tienes movimientos ni proyectos"
          description="Registra un ingreso para empezar a llevar tu dinero, o crea un proyecto para compartir gastos con otras personas."
          action={
            <div className="dashboard__first-steps">
              <Button onClick={() => openPanel('INGRESO')}>Registra tu primer ingreso</Button>
              <Link to="/projects" className="sf-button sf-button--ghost dashboard__link-button">
                Crea un proyecto
              </Link>
            </div>
          }
        />
      </>
    );
  } else {
    const { summary } = data;
    content = (
      <>
        <div className="dashboard__top">
          <PageHeader
            title="Resumen"
            figure={{
              label: FIGURE_LABEL,
              value: formatCOP(summary.total),
              tone: summary.total < 0 ? 'loss' : 'neutral',
            }}
            meta={<SummaryLedger summary={summary} />}
            fixedActionOnMobile
            action={
              <Button onClick={() => openPanel('GASTO')}>
                <Icon name="agregar" />
                Registrar movimiento
              </Button>
            }
          />

          {summary.debts.length > 0 && <DebtNotice debts={summary.debts} />}
          {/* "Al día" solo si todo está en cero; con saldo a favor, no debes nada pero tampoco estás al día. */}
          {summary.debts.length === 0 && summary.projects.length > 0 && (
            <p className="dashboard__even">
              {summary.inYourFavor > 0 ? 'No debes nada en tus proyectos.' : 'Estás al día en todos tus proyectos.'}
            </p>
          )}
        </div>

        <PageColumns>
          <Sheet
            title="Tus proyectos"
            action={
              summary.projects.length > 0 && (
                <Link to="/projects" className="dashboard__sheet-link">Ver todos</Link>
              )
            }
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
          <Sheet
            title="Presupuesto del mes"
            action={<Link to="/categories" className="dashboard__sheet-link">Ver categorías</Link>}
          >
            <BudgetAlerts budget={budget} error={budgetError} loading={budgetLoading} onRetry={retryBudget} />
          </Sheet>
        </PageColumns>
      </>
    );
  }

  return (
    <AppLayout>
      {content}
      {data && (
        <Panel
          open={panel.open}
          onClose={closePanel}
          title="Registrar movimiento"
          description="Se registra en tu billetera personal."
        >
          <TransactionForm
            key={panel.formKey}
            walletId={data.walletId}
            available={data.available}
            onSaved={handleSaved}
            embedded
            initialType={panel.type}
          />
        </Panel>
      )}
    </AppLayout>
  );
}
