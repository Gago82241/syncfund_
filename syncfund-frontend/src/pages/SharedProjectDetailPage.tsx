import { useParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useSharedProjectDetail } from '../features/shared-project/hooks/useSharedProjectDetail';
import { ProjectSummaryCard } from '../features/shared-project/components/ProjectSummaryCard';
import { MembersList } from '../features/shared-project/components/MembersList';
import { AddMemberForm } from '../features/shared-project/components/AddMemberForm';
import { ExpenseForm } from '../features/shared-project/components/ExpenseForm';
import { ContributionForm } from '../features/shared-project/components/ContributionForm';
import { TransactionList } from '../features/transactions/components/TransactionList';

export function SharedProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const projectId = Number(id);

  const { project, members, netBalance, transactions, loading, error, refresh } =
    useSharedProjectDetail(projectId, user!.id);

  return (
    <AppLayout>
      {loading && <p style={{ color: 'var(--ink-muted)' }}>Cargando...</p>}
      {error && <p style={{ color: 'var(--loss-500)' }}>{error}</p>}

      {project && netBalance && (
        <>
          <h2>{project.name}</h2>
          {project.description && (
            <p style={{ color: 'var(--ink-muted)', marginTop: '0.25rem' }}>{project.description}</p>
          )}

          <div style={{ marginTop: '1.5rem' }}>
            <ProjectSummaryCard project={project} netBalance={netBalance} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
            <ExpenseForm
              projectId={projectId}
              payerId={user!.id}
              members={members}
              onSaved={refresh}
            />
            <ContributionForm projectId={projectId} contributorId={user!.id} onSaved={refresh} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Integrantes</h3>
              <MembersList members={members} adminId={project.adminId} />
            </div>
            <AddMemberForm projectId={projectId} onSaved={refresh} />
          </div>

          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Movimientos del proyecto</h3>
          <TransactionList transactions={transactions} />
        </>
      )}
    </AppLayout>
  );
}
