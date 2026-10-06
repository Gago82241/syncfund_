import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { usePersonalWallet } from '../features/personal-wallet/hooks/usePersonalWallet';
import { WalletSummaryCard } from '../features/personal-wallet/components/WalletSummaryCard';
import { TransactionForm } from '../features/personal-wallet/components/TransactionForm';
import { SavingsGoalForm } from '../features/personal-wallet/components/SavingsGoalForm';
import { CushionForm } from '../features/personal-wallet/components/CushionForm';
import { TransactionList } from '../features/transactions/components/TransactionList';

export function PersonalWalletPage() {
  const { user } = useAuth();
  const { wallet, transactions, loading, error, refresh } = usePersonalWallet(user!.id);

  return (
    <AppLayout>
      <h2>Billetera personal</h2>

      {loading && <p style={{ color: 'var(--ink-muted)', marginTop: '1rem' }}>Cargando...</p>}
      {error && <p style={{ color: 'var(--loss-500)', marginTop: '1rem' }}>{error}</p>}

      {wallet && (
        <>
          <WalletSummaryCard wallet={wallet} />

          <div style={{ marginBottom: '2rem' }}>
            <TransactionForm walletId={wallet.walletId} onSaved={refresh} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              marginBottom: '2.5rem',
            }}
          >
            <SavingsGoalForm
              walletId={wallet.walletId}
              currentGoal={wallet.monthlySavingsGoal}
              onSaved={refresh}
            />
            <CushionForm walletId={wallet.walletId} onSaved={refresh} />
          </div>

          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Movimientos</h3>
          <TransactionList transactions={transactions} />
        </>
      )}
    </AppLayout>
  );
}
