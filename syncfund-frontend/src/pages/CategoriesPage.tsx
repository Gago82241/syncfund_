import { AppLayout } from '../components/layout/AppLayout';
import { LoadError } from '../components/ui/LoadError';
import { LoadingState } from '../components/ui/LoadingState';
import { useAuth } from '../context/useAuth';
import { useCategories } from '../features/categories/hooks/useCategories';
import { CategoryForm } from '../features/categories/components/CategoryForm';
import { CategoryList } from '../features/categories/components/CategoryList';

export function CategoriesPage() {
  const { user } = useAuth();
  const { categories, loading, error, refresh } = useCategories(user!.id);

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
      <h2>Categorías</h2>
      <p style={{ color: 'var(--ink-muted)', marginTop: '0.5rem' }}>
        Gasto de este mes en tu billetera personal, por categoría.
      </p>

      <div style={{ marginTop: '2rem' }}>
        <CategoryForm onCreated={refresh} />
      </div>

      {renderCategories()}
    </AppLayout>
  );
}
