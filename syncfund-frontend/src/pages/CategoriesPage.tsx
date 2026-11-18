import { useEffect, useRef, useState, type ReactNode } from 'react';
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
import { budgetHeadline, sortBudgetLines } from '../features/categories/budget';
import { LimitedCategoryList, UnlimitedCategoryList } from '../features/categories/components/CategoryBudgetList';
import { CreateCategoryForm } from '../features/categories/components/CreateCategoryForm';
import { useCategories } from '../features/categories/hooks/useCategories';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { capitalize, formatMonthLabel } from '../utils/formatDate';
import type { CategoryResponse } from '../types/api';
import './CategoriesPage.css';

const TITLE = 'Categorías';

export function CategoriesPage() {
  const { user } = useAuth();
  const { lines, month, loading, error, refresh, refreshAfterAction } = useCategories(user!.id);
  const { showToast } = useToast();
  // formKey vuelve a montar el formulario en cada apertura: arranca limpio.
  const [panel, setPanel] = useState({ open: false, formKey: 0 });
  const [reviewing, setReviewing] = useState(false);
  // Categoría recién creada: la lista la resalta un momento y la trae a la vista (con 0 % va al final).
  const [createdId, setCreatedId] = useState<number | null>(null);
  // La primera categoría se crea desde el estado vacío, cuyo botón desaparece con la lista nueva:
  // el foco pasa al contenido en vez de perderse en la página.
  const focusContentOnLoad = useRef(false);
  useDocumentTitle(`${TITLE} · SyncFund`);

  useEffect(() => {
    if (!focusContentOnLoad.current || !lines || lines.length === 0) return;
    focusContentOnLoad.current = false;
    document.getElementById('contenido')?.focus();
  }, [lines]);

  function openPanel() {
    setReviewing(false);
    setPanel((current) => ({ open: true, formKey: current.formKey + 1 }));
  }

  function closePanel() {
    setPanel((current) => ({ ...current, open: false }));
  }

  /** Si la recarga falla, el error dice que la categoría sí se creó (afterActionLoadError). */
  function handleCreated(category: CategoryResponse) {
    if (lines?.length === 0) focusContentOnLoad.current = true;
    setCreatedId(category.categoryId);
    closePanel();
    showToast(`Categoría «${category.name}» creada`);
    refreshAfterAction();
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
  } else if (lines === null || month === null) {
    content = (
      <>
        <PageHeader
          title={TITLE}
          className="categories__header"
          meta={
            <>
              <Skeleton width="9rem" />
              <Skeleton width="18rem" />
            </>
          }
        />
        {/* El anuncio va solo: si envolviera la hoja, el lector leería también su título. */}
        <SkeletonGroup label="Cargando tus categorías…">{null}</SkeletonGroup>
        <Sheet title="Con límite" className="categories__sheet">
          <SkeletonRows count={3} />
        </Sheet>
      </>
    );
  } else if (lines.length === 0) {
    // Sin categorías: crear pasa a ser lo principal, y la única acción de la página.
    content = (
      <>
        <PageHeader title={TITLE} />
        <EmptyState
          icon="categorias"
          title="Aún no tienes categorías"
          description="Una categoría le pone un tope de gasto mensual a un tipo de gasto (Mercado, Transporte, Salidas) y te avisa cuando te acercas. Al registrar un gasto en tu billetera, eliges su categoría."
          action={createButton('Crea tu primera categoría')}
        />
      </>
    );
  } else {
    const monthLabel = formatMonthLabel(month);
    const { limited, unlimited } = sortBudgetLines(lines);
    content = (
      <>
        <PageHeader
          title={TITLE}
          className="categories__header"
          meta={
            <>
              <p className="categories__month">{capitalize(monthLabel)}</p>
              <p className="categories__headline">{budgetHeadline(limited, unlimited.length)}</p>
              <p className="categories__scope">
                Cuenta los gastos de tu billetera personal a los que les pusiste categoría.
              </p>
            </>
          }
          fixedActionOnMobile
          action={createButton('Crear categoría')}
        />
        {limited.length > 0 && (
          <Sheet title="Con límite" className="categories__sheet">
            <LimitedCategoryList lines={limited} highlightId={createdId} month={month} />
          </Sheet>
        )}
        {unlimited.length > 0 && (
          <Sheet title="Sin límite" className="categories__sheet">
            <p className="categories__sheet-note">Lo que llevas gastado este mes, sin tope.</p>
            <UnlimitedCategoryList lines={unlimited} highlightId={createdId} />
          </Sheet>
        )}
      </>
    );
  }

  return (
    <AppLayout>
      {content}
      <Panel
        open={panel.open}
        onClose={closePanel}
        title="Crear categoría"
        description={
          reviewing ? undefined : 'Ponle un tope de gasto mensual a un tipo de gasto; la barra te avisa desde el 80 %.'
        }
      >
        <CreateCategoryForm
          key={panel.formKey}
          existingNames={lines?.map((line) => line.name) ?? []}
          onCreated={handleCreated}
          onStepChange={setReviewing}
        />
      </Panel>
    </AppLayout>
  );
}
