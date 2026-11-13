import { AppLayout } from '../components/layout/AppLayout';
import { LoadError } from '../components/ui/LoadError';
import { LoadingState } from '../components/ui/LoadingState';
import { useAuth } from '../context/useAuth';
import { useGeneralSummary } from '../features/users/hooks/useGeneralSummary';
import { formatCOP } from '../styles/theme';

export function DashboardPage() {
  const { user } = useAuth();
  const { summary, loading, error, refresh } = useGeneralSummary(user?.id);

  if (!user) return null;

  return (
    <AppLayout>
      <title>Resumen · SyncFund</title>
      <h2>Hola, {user.name.split(' ')[0]}</h2>
      <p style={{ color: 'var(--ink-muted)', marginTop: '0.5rem' }}>
        Este es tu saldo general en SyncFund.
      </p>

      {/* Ninguna cifra hasta tener la del backend: un saldo viejo se leería como real. */}
      {error && (
        <LoadError
          message={error.message}
          onRetry={error.canRetry ? refresh : undefined}
          retrying={loading}
        />
      )}
      {!error && summary === null && <LoadingState message="Cargando tu saldo…" />}
      {!error && summary !== null && (
        <p
          className="tabular-nums"
          style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginTop: '1.5rem' }}
        >
          {formatCOP(summary)}
        </p>
      )}
    </AppLayout>
  );
}
