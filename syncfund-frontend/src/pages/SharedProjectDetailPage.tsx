import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';
import { LoadError } from '../components/ui/LoadError';
import { PageHeader, type MoneyTone } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { Skeleton, SkeletonGroup, SkeletonRows } from '../components/ui/Skeleton';
import { Tabs } from '../components/ui/Tabs';
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
import { SettleDebtForm } from '../features/shared-project/components/SettleDebtForm';
import { debtOf, payableMember, paymentsToSettle, suggestedAmount } from '../features/shared-project/payment';
import { TransactionList } from '../features/transactions/components/TransactionList';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatCOP } from '../styles/theme';
import type { MemberBalance } from '../types/api';
import './SharedProjectDetailPage.css';

const FALLBACK_TITLE = 'Proyecto compartido';

type PanelKind = 'expense' | 'contribution' | 'member' | 'pay';

const PANEL_TITLES: Record<PanelKind, string> = {
  expense: 'Registrar gasto',
  contribution: 'Aportar al fondo',
  member: 'Agregar integrante',
  pay: 'Pagar',
};

const TABS = [
  { id: 'situacion', label: 'Situación' },
  { id: 'movimientos', label: 'Movimientos' },
  { id: 'integrantes', label: 'Integrantes' },
] as const;

type TabId = (typeof TABS)[number]['id'];

/** La pestaña vive en la URL (?pestana=…): recargar o compartir el enlace abre la misma. */
const TAB_PARAM = 'pestana';
const DEFAULT_TAB: TabId = 'situacion';

/** Intención de pago desde el Resumen: /projects/{id}?pagar={id de a quién}. */
const PAY_PARAM = 'pagar';

function tabFromParam(value: string | null): TabId {
  return TABS.find((tab) => tab.id === value)?.id ?? DEFAULT_TAB;
}

interface PanelState {
  open: boolean;
  kind: PanelKind;
  /** Vuelve a montar el formulario en cada apertura: arranca limpio y con datos actuales. */
  formKey: number;
  /** Solo para 'pay': a quién y cuánto, fijado al abrir (los saldos se recargan detrás). */
  payment?: { payee: MemberBalance; debt: number; suggested: number };
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

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = tabFromParam(searchParams.get(TAB_PARAM));

  // replace: cambiar de pestaña no llena el historial; "Atrás" sale de la página.
  function changeTab(tab: TabId) {
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);
        if (tab === DEFAULT_TAB) next.delete(TAB_PARAM);
        else next.set(TAB_PARAM, tab);
        return next;
      },
      { replace: true },
    );
  }

  function openPanel(kind: PanelKind) {
    setPanel((current) => ({ open: true, kind, formKey: current.formKey + 1 }));
  }

  function openPay(payee: MemberBalance) {
    if (!balances) return;
    const payment = {
      payee,
      debt: debtOf(balances, user!.id),
      suggested: suggestedAmount(balances, user!.id, payee),
    };
    setPanel((current) => ({ open: true, kind: 'pay', formKey: current.formKey + 1, payment }));
  }

  // Intención de pago (?pagar=): se atiende una sola vez por proyecto, cuando ya hay saldos.
  // Solo abre el pago si es una deuda real del usuario (misma regla que la tabla); si no, se
  // ignora en silencio. En los dos casos el parámetro se quita de la URL (efecto de abajo),
  // para que recargar o cerrar el panel no lo vuelva a abrir.
  const payParam = searchParams.get(PAY_PARAM);
  const payIntentKey = payParam === null ? null : `${projectId}:${payParam}`;
  const [handledPayIntent, setHandledPayIntent] = useState<string | null>(null);
  if (payIntentKey !== null && project && balances && !error && handledPayIntent !== payIntentKey) {
    setHandledPayIntent(payIntentKey);
    const payee = /^\d+$/.test(payParam!) ? payableMember(balances, user!.id, Number(payParam)) : null;
    if (payee) openPay(payee);
  }

  useEffect(() => {
    if (payIntentKey === null || handledPayIntent !== payIntentKey) return;
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);
        next.delete(PAY_PARAM);
        return next;
      },
      { replace: true },
    );
  }, [payIntentKey, handledPayIntent, setSearchParams]);

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
    const isAdmin = project.adminId === user!.id;

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

        <ProjectActions
          payments={paymentsToSettle(balances, user!.id)}
          onPay={openPay}
          onContribute={() => openPanel('contribution')}
        />

        <Tabs label="Secciones del proyecto" tabs={TABS} active={activeTab} onChange={changeTab}>
          {activeTab === 'situacion' && (
            <ProjectStatusTable currentUserId={user!.id} balances={balances} onPay={openPay} />
          )}

          {activeTab === 'movimientos' &&
            (transactions.length > 0 ? (
              <TransactionList transactions={transactions} />
            ) : (
              <EmptyState
                title="Aún no hay movimientos"
                description="Primero aporten al fondo; después registren los gastos y el sistema los divide."
                action={
                  <Button variant="ghost" className="project-detail__inline-button" onClick={() => openPanel('contribution')}>
                    Aportar al fondo
                  </Button>
                }
              />
            ))}

          {activeTab === 'integrantes' && (
            <div className="project-detail__members">
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
              {isAdmin ? (
                <Button variant="ghost" className="project-detail__inline-button" onClick={() => openPanel('member')}>
                  <Icon name="agregar" />
                  Agregar integrante
                </Button>
              ) : (
                <p className="project-detail__note">Solo el administrador puede agregar integrantes.</p>
              )}
            </div>
          )}
        </Tabs>
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
          title={panel.payment && panel.kind === 'pay' ? `Pagarle a ${panel.payment.payee.name}` : PANEL_TITLES[panel.kind]}
          description={
            panel.kind === 'pay'
              ? `Sale de tu billetera personal y llega a la de ${panel.payment?.payee.name ?? 'la otra persona'}; el fondo del proyecto no cambia.`
              : panel.kind === 'expense'
              ? `Lo paga el fondo del proyecto (disponible ${formatCOP(project.currentBalance)}) y se reparte entre quienes participan.`
              : panel.kind === 'contribution'
                ? 'Sale de tu billetera personal y entra al fondo del proyecto.'
                : 'Escribe el correo con el que la persona se registró.'
          }
        >
          {panel.kind === 'pay' && panel.payment ? (
            <SettleDebtForm
              key={panel.formKey}
              projectId={projectId}
              payerId={user!.id}
              debt={panel.payment.debt}
              payee={panel.payment.payee}
              suggestedAmount={panel.payment.suggested}
              onPaid={refreshAfterAction}
              onFinish={closePanel}
            />
          ) : panel.kind === 'member' ? (
            <AddMemberForm
              key={panel.formKey}
              projectId={projectId}
              onSaved={(email) => finishAction(`Agregaste a ${email} al proyecto`)}
            />
          ) : panel.kind === 'expense' ? (
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
