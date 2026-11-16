import { AppLayout } from '../components/layout/AppLayout';
import { LoadError } from '../components/ui/LoadError';
import { LoadingState } from '../components/ui/LoadingState';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../context/useAuth';
import { useSharedProjects } from '../features/shared-project/hooks/useSharedProjects';
import { ProjectStatusList } from '../features/shared-project/components/ProjectStatusList';
import { CreateProjectForm } from '../features/shared-project/components/CreateProjectForm';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function SharedProjectsPage() {
  const { user } = useAuth();
  const { lines, loading, error, refresh } = useSharedProjects(user!.id);
  useDocumentTitle('Proyectos compartidos · SyncFund');

  function renderProjects() {
    // Con error no se muestra la lista anterior: podría no estar actualizada.
    if (error) {
      return (
        <LoadError
          message={error.message}
          onRetry={error.canRetry ? refresh : undefined}
          retrying={loading}
        />
      );
    }
    if (lines === null) return <LoadingState message="Cargando tus proyectos…" />;
    if (lines.length === 0) {
      return <p style={{ color: 'var(--ink-faint)' }}>Todavía no participas en ningún proyecto compartido.</p>;
    }
    return <ProjectStatusList projects={lines} />;
  }

  return (
    <AppLayout>
      <PageHeader title="Proyectos compartidos" />
      <CreateProjectForm adminId={user!.id} onCreated={refresh} />

      <h2 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Tus proyectos</h2>
      {renderProjects()}
    </AppLayout>
  );
}
