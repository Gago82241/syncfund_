import { AppLayout } from '../components/layout/AppLayout';
import { LoadError } from '../components/ui/LoadError';
import { LoadingState } from '../components/ui/LoadingState';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../context/useAuth';
import { useSharedProjects } from '../features/shared-project/hooks/useSharedProjects';
import { ProjectCard } from '../features/shared-project/components/ProjectCard';
import { CreateProjectForm } from '../features/shared-project/components/CreateProjectForm';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function SharedProjectsPage() {
  const { user } = useAuth();
  const { projects, loading, error, refresh, refreshAfterAction } = useSharedProjects(user!.id);
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
    if (projects === null) return <LoadingState message="Cargando tus proyectos…" />;
    if (projects.length === 0) {
      return <p style={{ color: 'var(--ink-faint)' }}>Todavía no participas en ningún proyecto compartido.</p>;
    }
    return projects.map((p) => <ProjectCard key={p.projectId} project={p} />);
  }

  return (
    <AppLayout>
      <PageHeader title="Proyectos compartidos" />
      <CreateProjectForm adminId={user!.id} onCreated={refreshAfterAction} />

      <h2 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Tus proyectos</h2>
      {renderProjects()}
    </AppLayout>
  );
}
