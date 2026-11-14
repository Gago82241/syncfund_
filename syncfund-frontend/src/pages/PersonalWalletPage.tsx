import { AppLayout } from '../components/layout/AppLayout';
import { PageColumns } from '../components/layout/PageColumns';
import { LoadError } from '../components/ui/LoadError';
import { LoadingState } from '../components/ui/LoadingState';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../context/useAuth';
import { usePersonalWallet } from '../features/personal-wallet/hooks/usePersonalWallet';
import { WalletSummaryCard } from '../features/personal-wallet/components/WalletSummaryCard';
import { TransactionForm } from '../features/personal-wallet/components/TransactionForm';
import { SavingsGoalForm } from '../features/personal-wallet/components/SavingsGoalForm';
import { CushionForm } from '../features/personal-wallet/components/CushionForm';
import { TransactionList } from '../features/transactions/components/TransactionList';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function PersonalWalletPage() {
  const { user } = useAuth();
  const { wallet, transactions, loading, error, refresh, refreshAfterAction } = usePersonalWallet(user!.id);
  useDocumentTitle('Billetera personal · SyncFund');

  return (
    <AppLayout>
      <PageHeader title="Billetera personal" />

      {/* Con error no se muestran los datos anteriores: podrían no estar actualizados. */}
      {error && (
        <LoadError
          message={error.message}
          onRetry={error.canRetry ? refresh : undefined}
          retrying={loading}
        />
      )}
      {!error && (wallet === null || transactions === null) && (
        <LoadingState message="Cargando tu billetera…" />
      )}

      {!error && wallet && transactions && (
        <>
          <WalletSummaryCard wallet={wallet} />

          <div style={{ marginBottom: '2rem' }}>
            <TransactionForm walletId={wallet.walletId} onSaved={refreshAfterAction} />
          </div>

          <PageColumns style={{ marginBottom: '2.5rem' }}>
            <SavingsGoalForm
              // El formulario copia la meta al montarse: si la meta cambia, se vuelve a montar con la nueva.
              key={wallet.monthlySavingsGoal}
              walletId={wallet.walletId}
              currentGoal={wallet.monthlySavingsGoal}
              onSaved={refreshAfterAction}
            />
            <CushionForm walletId={wallet.walletId} onSaved={refreshAfterAction} />
          </PageColumns>

          <h2 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Movimientos</h2>
          <TransactionList transactions={transactions} />
        </>
      )}
    </AppLayout>
  );
}
