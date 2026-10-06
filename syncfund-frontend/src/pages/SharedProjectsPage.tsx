import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useSharedProjects } from '../features/shared-project/hooks/useSharedProjects';
import { ProjectCard } from '../features/shared-project/components/ProjectCard';
import { CreateProjectForm } from '../features/shared-project/components/CreateProjectForm';

export function SharedProjectsPage() {
  const { user } = useAuth();
  const { projects, loading, refresh } = useSharedProjects(user!.id);

  return (
    <AppLayout>
      <h2>Proyectos compartidos</h2>
      <div style={{ marginTop: '2rem' }}>
        <CreateProjectForm adminId={user!.id} onCreated={refresh} />
      </div>

      <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Tus proyectos</h3>
      {loading && <p style={{ color: 'var(--ink-muted)' }}>Cargando...</p>}
      {!loading && projects.length === 0 && (
        <p style={{ color: 'var(--ink-faint)' }}>Todavía no participas en ningún proyecto compartido.</p>
      )}
      {projects.map((p) => (
        <ProjectCard key={p.projectId} project={p} />
      ))}
    </AppLayout>
  );
}
