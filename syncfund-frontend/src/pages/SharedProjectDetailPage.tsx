import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { LoadError } from '../components/ui/LoadError';
import { LoadingState } from '../components/ui/LoadingState';
import { useAuth } from '../context/useAuth';
import { useSharedProjectDetail } from '../features/shared-project/hooks/useSharedProjectDetail';
import { ProjectSummaryCard } from '../features/shared-project/components/ProjectSummaryCard';
import { ProjectStatusTable } from '../features/shared-project/components/ProjectStatusTable';
import { MembersList } from '../features/shared-project/components/MembersList';
import { AddMemberForm } from '../features/shared-project/components/AddMemberForm';
import { ExpenseForm } from '../features/shared-project/components/ExpenseForm';
import { ContributionForm } from '../features/shared-project/components/ContributionForm';
import { TransactionList } from '../features/transactions/components/TransactionList';

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

  return (
    <AppLayout>
      {/* React 19 lleva el <title> al <head>; su contenido debe ser un solo texto. */}
      <title>{project ? `${project.name} · SyncFund` : 'Proyecto compartido · SyncFund'}</title>
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
          <h2>{project.name}</h2>
          {project.description && (
            <p style={{ color: 'var(--ink-muted)', marginTop: '0.25rem' }}>{project.description}</p>
          )}

          <div style={{ marginTop: '1.5rem' }}>
            <ProjectSummaryCard project={project} netBalance={netBalance} />
          </div>

          <ProjectStatusTable
            projectId={projectId}
            currentUserId={user!.id}
            balances={balances}
            onPaid={() => {
              setPaymentsMade((n) => n + 1);
              refreshAfterAction();
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Integrantes</h3>
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
          </div>

          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Movimientos del proyecto</h3>
          <TransactionList transactions={transactions} />
        </>
      )}
    </AppLayout>
  );
}
