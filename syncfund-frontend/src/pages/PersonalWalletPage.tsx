import { useState, type ReactNode } from 'react';
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
import { CushionForm, type CushionResult } from '../features/personal-wallet/components/CushionForm';
import { CushionSheet } from '../features/personal-wallet/components/CushionSheet';
import { SavingsGoalForm } from '../features/personal-wallet/components/SavingsGoalForm';
import { SavingsGoalSheet } from '../features/personal-wallet/components/SavingsGoalSheet';
import { TransactionForm } from '../features/personal-wallet/components/TransactionForm';
import { WalletLedger } from '../features/personal-wallet/components/WalletLedger';
import { savedMovementMessage } from '../features/personal-wallet/movementMessage';
import { useCategoryNames } from '../features/personal-wallet/hooks/useCategoryNames';
import { usePersonalWallet } from '../features/personal-wallet/hooks/usePersonalWallet';
import { walletFigures } from '../features/personal-wallet/walletFigures';
import { TransactionList } from '../features/transactions/components/TransactionList';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatCOP } from '../styles/theme';
import './PersonalWalletPage.css';

const TITLE = 'Billetera personal';
const FIGURE_LABEL = 'Disponible';
/** Filas por tanda en Movimientos: así meta y colchón no quedan enterrados en el celular. */
const MOVEMENTS_PAGE = 20;

type MovementType = 'INGRESO' | 'GASTO';
type PanelKind = 'movement' | 'goal' | 'cushion';

const PANELS: Record<PanelKind, { title: string; description: string }> = {
  movement: { title: 'Registrar movimiento', description: 'Se registra en tu billetera personal.' },
  goal: { title: 'Meta de ahorro', description: 'Cuánto quieres ahorrar cada mes.' },
  cushion: {
    title: 'Apartar o liberar colchón',
    description: 'Mueve dinero entre tu disponible y tu colchón. Tu total no cambia.',
  },
};

interface PanelState {
  open: boolean;
  kind: PanelKind;
  /** Tipo con el que abre "Registrar movimiento". */
  type: MovementType;
  /** Vuelve a montar el formulario en cada apertura: arranca limpio y con los datos actuales. */
  formKey: number;
}

export function PersonalWalletPage() {
  const { user } = useAuth();
  const { wallet, transactions, loading, error, refresh, refreshAfterAction } = usePersonalWallet(user!.id);
  const { showToast } = useToast();
  const categories = useCategoryNames();
  const [panel, setPanel] = useState<PanelState>({ open: false, kind: 'movement', type: 'GASTO', formKey: 0 });
  useDocumentTitle(`${TITLE} · SyncFund`);

  function openPanel(kind: PanelKind, type: MovementType = 'GASTO') {
    setPanel((current) => ({ open: true, kind, type, formKey: current.formKey + 1 }));
  }

  function closePanel() {
    setPanel((current) => ({ ...current, open: false }));
  }

  function handleCushionSaved({ type, amount, wallet: updated }: CushionResult) {
    // Las cifras del aviso son las que devolvió el backend, no un cálculo de la pantalla.
    const { available } = walletFigures(updated);
    handleSaved(
      type === 'APARTAR'
        ? `Apartaste ${formatCOP(amount)}. Tu disponible quedó en ${formatCOP(available)}`
        : `Liberaste ${formatCOP(amount)}. Tu disponible quedó en ${formatCOP(available)}`,
    );
  }

  function handleSaved(message: string) {
    closePanel();
    showToast(message);
    refreshAfterAction();
  }

  let content: ReactNode;

  // Certeza sobre cada peso: con error no se muestra ninguna cifra, ni siquiera la anterior.
  if (error) {
    content = (
      <>
        <PageHeader title={TITLE} />
        <LoadError message={error.message} onRetry={error.canRetry ? refresh : undefined} retrying={loading} />
      </>
    );
  } else if (wallet === null || transactions === null) {
    content = (
      <>
        <PageHeader
          title={TITLE}
          figure={{ label: FIGURE_LABEL, value: <Skeleton variant="figure" /> }}
          meta={
            <span className="wallet__ledger-skeleton" aria-hidden="true">
              <Skeleton width="15rem" />
              <Skeleton width="15rem" />
              <Skeleton width="15rem" />
            </span>
          }
        />
        {/* El anuncio va solo: si envolviera las hojas, el lector leería también sus títulos. */}
        <SkeletonGroup label="Cargando tu billetera…">{null}</SkeletonGroup>
        <PageColumns variant="main-aside">
          <Sheet title="Movimientos">
            <SkeletonRows count={5} />
          </Sheet>
          <div className="wallet__aside">
            <Sheet title="Meta de ahorro">
              <SkeletonRows count={2} />
            </Sheet>
            <Sheet title="Colchón">
              <SkeletonRows count={1} />
            </Sheet>
          </div>
        </PageColumns>
      </>
    );
  } else {
    const figures = walletFigures(wallet);
    content = (
      <>
        <PageHeader
          title={TITLE}
          figure={{ label: FIGURE_LABEL, value: formatCOP(figures.available) }}
          meta={<WalletLedger figures={figures} />}
          fixedActionOnMobile
          action={
            <Button onClick={() => openPanel('movement')}>
              <Icon name="agregar" />
              Registrar movimiento
            </Button>
          }
        />

        <PageColumns variant="main-aside">
          <Sheet title="Movimientos">
            {figures.cushion > 0 && (
              // No es un movimiento: explica por qué el disponible no cuadra con la lista, sin inventar filas.
              <p className="wallet__cushion-note">
                Tienes <strong className="tabular-nums">{formatCOP(figures.cushion)}</strong> en el colchón.
                Apartar y liberar no aparecen en esta lista: mueven dinero entre tu disponible y tu colchón,
                y tu total no cambia.
              </p>
            )}
            {categories.failed && transactions.some((tx) => tx.categoryId !== null) && (
              <p className="wallet__categories-note" role="status">
                No pudimos cargar los nombres de tus categorías; los movimientos se muestran sin ellos.{' '}
                <button
                  type="button"
                  className="wallet__retry"
                  onClick={categories.retry}
                  disabled={categories.retrying}
                >
                  {categories.retrying ? 'Reintentando…' : 'Reintentar'}
                </button>
              </p>
            )}
            <TransactionList
              transactions={transactions}
              categoryNames={categories.names}
              pageSize={MOVEMENTS_PAGE}
              empty={
                <EmptyState
                  title="Aún no tienes movimientos"
                  description="Registra lo que recibes y lo que gastas, y aquí verás cada peso que entra y sale de tu billetera."
                  action={<Button onClick={() => openPanel('movement', 'INGRESO')}>Registra tu primer ingreso</Button>}
                />
              }
            />
          </Sheet>
          <div className="wallet__aside">
            <SavingsGoalSheet
              walletId={wallet.walletId}
              goal={wallet.monthlySavingsGoal}
              transactions={transactions}
              onEdit={() => openPanel('goal')}
            />
            <CushionSheet cushion={figures.cushion} onManage={() => openPanel('cushion')} />
          </div>
        </PageColumns>
      </>
    );
  }

  return (
    <AppLayout>
      {content}
      {wallet && (
        <Panel
          open={panel.open}
          onClose={closePanel}
          title={PANELS[panel.kind].title}
          description={PANELS[panel.kind].description}
        >
          {panel.kind === 'movement' && (
            <TransactionForm
              key={panel.formKey}
              walletId={wallet.walletId}
              available={walletFigures(wallet).available}
              onSaved={(saved) => handleSaved(savedMovementMessage(saved))}
              embedded
              initialType={panel.type}
            />
          )}
          {panel.kind === 'goal' && (
            <SavingsGoalForm
              key={panel.formKey}
              walletId={wallet.walletId}
              currentGoal={wallet.monthlySavingsGoal}
              onSaved={(goal) =>
                handleSaved(goal > 0 ? `Tu meta de ahorro es ${formatCOP(goal)} al mes` : 'Quitaste tu meta de ahorro')
              }
            />
          )}
          {panel.kind === 'cushion' && (
            <CushionForm
              key={panel.formKey}
              walletId={wallet.walletId}
              available={walletFigures(wallet).available}
              cushion={walletFigures(wallet).cushion}
              onSaved={handleCushionSaved}
            />
          )}
        </Panel>
      )}
    </AppLayout>
  );
}
