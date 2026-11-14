import { AppLayout } from '../components/layout/AppLayout';
import { LoadError } from '../components/ui/LoadError';
import { LoadingState } from '../components/ui/LoadingState';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../context/useAuth';
import { useCategories } from '../features/categories/hooks/useCategories';
import { CategoryForm } from '../features/categories/components/CategoryForm';
import { CategoryList } from '../features/categories/components/CategoryList';
import { formatMonthLabel } from '../utils/formatDate';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function CategoriesPage() {
  const { user } = useAuth();
  const { categories, month, loading, error, refresh, refreshAfterAction } = useCategories(user!.id);
  useDocumentTitle('Categorías · SyncFund');

  function renderCategories() {
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
    if (categories === null) return <LoadingState message="Cargando tus categorías…" />;
    // CategoryList muestra el mensaje de "sin categorías" cuando la lista llega vacía.
    return <CategoryList categories={categories} />;
  }

  return (
    <AppLayout>
      <PageHeader
        title="Categorías"
        // Se nombra el mes consultado; antes de la primera carga todavía no se sabe.
        meta={`Gasto de ${month ? formatMonthLabel(month) : 'este mes'} en tu billetera personal, por categoría.`}
      />

      <CategoryForm onCreated={refreshAfterAction} />

      {renderCategories()}
    </AppLayout>
  );
}
