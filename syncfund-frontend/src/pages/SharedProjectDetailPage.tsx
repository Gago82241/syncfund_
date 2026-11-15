import { useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { PageColumns } from '../components/layout/PageColumns';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { LoadError } from '../components/ui/LoadError';
import { PageHeader, type MoneyTone } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { Skeleton, SkeletonGroup, SkeletonRows } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/toast/useToast';
import { useAuth } from '../context/useAuth';
import { HALF_CENT } from '../features/shared-project/balance';
import { useSharedProjectDetail } from '../features/shared-project/hooks/useSharedProjectDetail';
import { ProjectActions } from '../features/shared-project/components/ProjectActions';
import { ProjectStatusTable } from '../features/shared-project/components/ProjectStatusTable';
import { MembersList } from '../features/shared-project/components/MembersList';
import { AddMemberForm } from '../features/shared-project/components/AddMemberForm';
import { ExpenseForm } from '../features/shared-project/components/ExpenseForm';
import { ContributionForm } from '../features/shared-project/components/ContributionForm';
import { TransactionList } from '../features/transactions/components/TransactionList';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatCOP } from '../styles/theme';
import './SharedProjectDetailPage.css';

const FALLBACK_TITLE = 'Proyecto compartido';

type PanelKind = 'expense' | 'contribution';

interface PanelState {
  open: boolean;
  kind: PanelKind;
  /** Vuelve a montar el formulario en cada apertura: arranca limpio y con datos actuales. */
  formKey: number;
}

const CLOSED: PanelState = { open: false, kind: 'expense', formKey: 0 };

/** La cifra protagonista: tu situación en el proyecto, con el mismo umbral que la tabla. */
function situationFigure(net: number): { label: string; value: string; tone: MoneyTone } {
  if (net < -HALF_CENT) return { label: 'Debes', value: formatCOP(-net), tone: 'loss' };
  if (net > HALF_CENT) return { label: 'Te deben', value: formatCOP(net), tone: 'gain' };
  return { label: 'Tu situación', value: 'Estás al día', tone: 'neutral' };
}

export function SharedProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const projectId = Number(id);
  const figureRef = useRef<HTMLSpanElement>(null);

  const { project, members, balances, transactions, loading, error, refresh, refreshAfterAction } =
    useSharedProjectDetail(projectId, user!.id);
  useDocumentTitle(project ? `${project.name} · SyncFund` : `${FALLBACK_TITLE} · SyncFund`);

  const [panel, setPanel] = useState<PanelState>(CLOSED);
  // Al pasar a otro proyecto, un panel abierto del anterior se cierra y no se reabre en el nuevo.
  const [panelProjectId, setPanelProjectId] = useState(projectId);
  if (!Object.is(panelProjectId, projectId)) {
    setPanelProjectId(projectId);
    setPanel(CLOSED);
  }

  function openPanel(kind: PanelKind) {
    setPanel((current) => ({ open: true, kind, formKey: current.formKey + 1 }));
  }

  function closePanel() {
    setPanel((current) => ({ ...current, open: false }));
  }

  function finishAction(message: string) {
    closePanel();
    showToast(message);
    refreshAfterAction();
  }

  let content: ReactNode;

  if (error) {
    // Con error no se muestran los datos anteriores: podrían no estar actualizados.
    content = (
      <>
        <PageHeader title={project?.name ?? FALLBACK_TITLE} />
        <LoadError
          message={error.message}
          onRetry={error.canRetry ? refresh : undefined}
          retrying={loading}
          // Si el proyecto no existe o ya no es tuyo, reintentar no sirve: se ofrece volver.
          action={error.canRetry ? undefined : <Link to="/projects">Volver a tus proyectos</Link>}
        />
      </>
    );
  } else if (!project || !balances) {
    content = (
      <>
        <PageHeader
          title={FALLBACK_TITLE}
          figure={{ label: 'Tu situación', value: <Skeleton variant="figure" /> }}
          meta={<Skeleton width="14rem" />}
        />
        {/* El anuncio va solo: si envolviera las hojas, el lector leería también sus títulos. */}
        <SkeletonGroup label="Cargando el proyecto…">{null}</SkeletonGroup>
        <SkeletonRows count={4} />
      </>
    );
  } else {
    const me = balances.members.find((m) => m.userId === user!.id);
    const figure = situationFigure(me?.netBalance ?? 0);

    content = (
      <>
        <PageHeader
          title={project.name}
          figure={{
            label: figure.label,
            // Enfocable para devolverle el foco cuando el botón que abrió un panel ya no existe.
            value: (
              <span ref={figureRef} tabIndex={-1} className="project-detail__figure">
                {figure.value}
              </span>
            ),
            tone: figure.tone,
          }}
          meta={
            <div className="project-detail__meta">
              <p>
                Fondo del proyecto{' '}
                <strong className="project-detail__fund tabular-nums">{formatCOP(project.currentBalance)}</strong>
              </p>
              {project.description && <p className="project-detail__description">{project.description}</p>}
            </div>
          }
          fixedActionOnMobile
          action={
            <Button onClick={() => openPanel('expense')}>
              <Icon name="agregar" />
              Registrar gasto
            </Button>
          }
        />

        <ProjectActions onContribute={() => openPanel('contribution')} />

        <ProjectStatusTable
          projectId={projectId}
          currentUserId={user!.id}
          balances={balances}
          onPaid={refreshAfterAction}
        />

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
    );
  }

  return (
    <AppLayout>
      {content}
      {project && balances && !error && (
        <Panel
          open={panel.open}
          onClose={closePanel}
          fallbackFocusRef={figureRef}
          title={panel.kind === 'expense' ? 'Registrar gasto' : 'Aportar al fondo'}
          description={
            panel.kind === 'expense'
              ? `Lo paga el fondo del proyecto (disponible ${formatCOP(project.currentBalance)}) y se reparte entre quienes participan.`
              : 'Sale de tu billetera personal y entra al fondo del proyecto.'
          }
        >
          {panel.kind === 'expense' ? (
            <ExpenseForm
              key={panel.formKey}
              projectId={projectId}
              payerId={user!.id}
              members={members}
              fundBalance={project.currentBalance}
              onSaved={({ amount, people }) =>
                finishAction(
                  people === 1
                    ? `Gasto registrado: ${formatCOP(amount)}`
                    : `Gasto registrado: ${formatCOP(amount)} entre ${people}`,
                )
              }
              onContributeInstead={() => openPanel('contribution')}
            />
          ) : (
            <ContributionForm
              key={panel.formKey}
              projectId={projectId}
              contributorId={user!.id}
              onSaved={(amount) => finishAction(`Aportaste ${formatCOP(amount)} al fondo`)}
            />
          )}
        </Panel>
      )}
    </AppLayout>
  );
}
