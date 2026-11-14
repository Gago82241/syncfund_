import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { PageColumns } from '../components/layout/PageColumns';
import { LoadError } from '../components/ui/LoadError';
import { LoadingState } from '../components/ui/LoadingState';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../context/useAuth';
import { useSharedProjectDetail } from '../features/shared-project/hooks/useSharedProjectDetail';
import { ProjectSummaryCard } from '../features/shared-project/components/ProjectSummaryCard';
import { ProjectStatusTable } from '../features/shared-project/components/ProjectStatusTable';
import { MembersList } from '../features/shared-project/components/MembersList';
import { AddMemberForm } from '../features/shared-project/components/AddMemberForm';
import { ExpenseForm } from '../features/shared-project/components/ExpenseForm';
import { ContributionForm } from '../features/shared-project/components/ContributionForm';
import { TransactionList } from '../features/transactions/components/TransactionList';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function SharedProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const projectId = Number(id);

  const {
    project,
    members,
    balances,
    netBalance,
    transactions,
    loading,
    error,
    refresh,
    refreshAfterAction,
  } = useSharedProjectDetail(projectId, user!.id);
  // Un pago cambia la billetera personal: se vuelve a montar el formulario de aporte para que
  // muestre y valide el saldo disponible actualizado.
  const [paymentsMade, setPaymentsMade] = useState(0);
  useDocumentTitle(project ? `${project.name} · SyncFund` : 'Proyecto compartido · SyncFund');

  return (
    <AppLayout>
      {/* El título existe desde el principio (también con error o cargando): siempre hay un h1. */}
      <PageHeader title={project?.name ?? 'Proyecto compartido'} meta={project?.description || undefined} />

      {/* Con error no se muestran los datos anteriores: podrían no estar actualizados. */}
      {error && (
        <LoadError
          message={error.message}
          onRetry={error.canRetry ? refresh : undefined}
          retrying={loading}
          // Si el proyecto no existe o ya no es tuyo, reintentar no sirve: se ofrece volver.
          action={error.canRetry ? undefined : <Link to="/projects">Volver a tus proyectos</Link>}
        />
      )}
      {!error && project === null && <LoadingState message="Cargando el proyecto…" />}

      {!error && project && balances && netBalance && (
        <>
          <ProjectSummaryCard project={project} netBalance={netBalance} />

          <ProjectStatusTable
            projectId={projectId}
            currentUserId={user!.id}
            balances={balances}
            onPaid={() => {
              setPaymentsMade((n) => n + 1);
              refreshAfterAction();
            }}
          />

          <PageColumns style={{ marginBottom: '2.5rem' }}>
            <ExpenseForm
              projectId={projectId}
              payerId={user!.id}
              members={members}
              fundBalance={project.currentBalance}
              onSaved={refreshAfterAction}
            />
            <ContributionForm
              key={paymentsMade}
              projectId={projectId}
              contributorId={user!.id}
              onSaved={refreshAfterAction}
            />
          </PageColumns>

          <PageColumns style={{ marginBottom: '2.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Integrantes</h2>
              <MembersList
                projectId={projectId}
                projectName={project.name}
                members={members}
                adminId={project.adminId}
                currentUserId={user!.id}
                onRemoved={refreshAfterAction}
                // Quien sale ya no puede ver el proyecto: vuelve a la lista de sus proyectos.
                onLeft={() => navigate('/projects', { replace: true })}
              />
            </div>
            <AddMemberForm projectId={projectId} onSaved={refreshAfterAction} />
          </PageColumns>

          <h2 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Movimientos del proyecto</h2>
          <TransactionList transactions={transactions} />
        </>
      )}
    </AppLayout>
  );
}
