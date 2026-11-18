import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';
import { LoadError } from '../components/ui/LoadError';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { Sheet } from '../components/ui/Sheet';
import { Skeleton, SkeletonGroup, SkeletonRows } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/toast/useToast';
import { useAuth } from '../context/useAuth';
import { CreateProjectForm } from '../features/shared-project/components/CreateProjectForm';
import { ProjectStatusList } from '../features/shared-project/components/ProjectStatusList';
import { useSharedProjects } from '../features/shared-project/hooks/useSharedProjects';
import { projectsHeadline } from '../features/shared-project/projectLines';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { SharedProjectResponse } from '../types/api';
import './SharedProjectsPage.css';

const TITLE = 'Proyectos compartidos';
const LIST_TITLE = 'Tus proyectos';

/** Nota cuando faltan saldos: la lista se muestra, pero esos renglones van sin cifra. */
function missingBalancesMessage(count: number): string {
  return count === 1
    ? 'No pudimos cargar tu saldo en 1 proyecto; ese renglón va sin cifra.'
    : `No pudimos cargar tu saldo en ${count} proyectos; esos renglones van sin cifra.`;
}

export function SharedProjectsPage() {
  const { user } = useAuth();
  const { lines, missingBalances, pendingBalances, loading, error, refresh, retryBalances, retryingBalances } =
    useSharedProjects(user!.id);
  const { showToast } = useToast();
  const navigate = useNavigate();
  // formKey vuelve a montar el formulario en cada apertura: arranca limpio.
  const [panel, setPanel] = useState({ open: false, formKey: 0 });
  useDocumentTitle(`${TITLE} · SyncFund`);

  function openPanel() {
    setPanel((current) => ({ open: true, formKey: current.formKey + 1 }));
  }

  function closePanel() {
    setPanel((current) => ({ ...current, open: false }));
  }

  /**
   * El siguiente paso lógico es agregar a los integrantes: se abre el Detalle en esa pestaña.
   * `created` hace que, si esa primera carga falla, el error diga que el proyecto sí se creó.
   */
  function handleCreated(project: SharedProjectResponse) {
    closePanel();
    showToast(`Proyecto «${project.name}» creado. Ahora agrega a los integrantes`);
    navigate(`/projects/${project.projectId}?pestana=integrantes`, { state: { created: true } });
  }

  const createButton = (label: string) => (
    <Button onClick={openPanel}>
      <Icon name="agregar" />
      {label}
    </Button>
  );

  let content: ReactNode;

  // Con error no se muestra la lista anterior: podría no estar actualizada.
  if (error) {
    content = (
      <>
        <PageHeader title={TITLE} />
        <LoadError message={error.message} onRetry={error.canRetry ? refresh : undefined} retrying={loading} />
      </>
    );
  } else if (lines === null) {
    content = (
      <>
        <PageHeader title={TITLE} meta={<Skeleton width="16rem" />} className="projects__header" />
        {/* El anuncio va solo: si envolviera la hoja, el lector leería también su título. */}
        <SkeletonGroup label="Cargando tus proyectos…">{null}</SkeletonGroup>
        <Sheet title={LIST_TITLE} titleHidden className="projects__sheet">
          <SkeletonRows count={4} />
        </Sheet>
      </>
    );
  } else if (lines.length === 0) {
    // Sin proyectos: crear pasa a ser lo principal, y la única acción de la página.
    content = (
      <>
        <PageHeader title={TITLE} />
        <EmptyState
          icon="proyectos"
          title="Aún no tienes proyectos compartidos"
          description="Un proyecto reúne los aportes de un grupo en un fondo común y calcula quién le debe a quién. Si alguien te agrega por correo, aparecerá aquí."
          action={createButton('Crea tu primer proyecto')}
        />
      </>
    );
  } else {
    content = (
      <>
        <PageHeader
          title={TITLE}
          className="projects__header"
          meta={
            // La línea espera a que lleguen todos los saldos: antes no puede decir dónde debes.
            pendingBalances > 0 ? (
              <Skeleton width="16rem" />
            ) : (
              <p className="projects__headline">{projectsHeadline(lines)}</p>
            )
          }
          fixedActionOnMobile
          action={createButton('Crear proyecto')}
        />
        {/* Nota neutra (no alerta): la lista sí cargó; solo faltan algunas cifras. */}
        {missingBalances > 0 && (
          <div className="projects__notice sf-enter" role="status">
            <p>{missingBalancesMessage(missingBalances)}</p>
            <Button variant="ghost" loading={retryingBalances} onClick={retryBalances}>
              Reintentar
            </Button>
          </div>
        )}
        <Sheet title={LIST_TITLE} titleHidden className="projects__sheet">
          <ProjectStatusList projects={lines} showPayees />
        </Sheet>
      </>
    );
  }

  return (
    <AppLayout>
      {content}
      <Panel
        open={panel.open}
        onClose={closePanel}
        title="Crear proyecto"
        description="Serás el administrador; después agregas a los integrantes por su correo."
      >
        <CreateProjectForm key={panel.formKey} adminId={user!.id} onCreated={handleCreated} />
      </Panel>
    </AppLayout>
  );
}
