import { AppLayout } from '../components/layout/AppLayout';
import { LoadError } from '../components/ui/LoadError';
import { LoadingState } from '../components/ui/LoadingState';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../context/useAuth';
import { useGeneralSummary } from '../features/users/hooks/useGeneralSummary';
import { formatCOP } from '../styles/theme';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function DashboardPage() {
  const { user } = useAuth();
  const { summary, loading, error, refresh } = useGeneralSummary(user?.id);
  useDocumentTitle('Resumen · SyncFund');

  if (!user) return null;

  return (
    <AppLayout>
      {/* Primer nombre, aunque el nombre guardado empiece con espacios o tenga varios seguidos. */}
      <PageHeader
        title={`Hola, ${user.name.trim().split(/\s+/)[0]}`}
        meta="Este es tu saldo general en SyncFund."
      />

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
