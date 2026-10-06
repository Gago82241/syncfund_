import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../features/categories/hooks/useCategories';
import { CategoryForm } from '../features/categories/components/CategoryForm';
import { CategoryList } from '../features/categories/components/CategoryList';

export function CategoriesPage() {
  const { user } = useAuth();
  const { categories, loading, error, refresh } = useCategories(user!.id);

  return (
    <AppLayout>
      <h2>Categorías</h2>
      <p style={{ color: 'var(--ink-muted)', marginTop: '0.5rem' }}>
        Gasto de este mes en tu billetera personal, por categoría.
      </p>

      <div style={{ marginTop: '2rem' }}>
        <CategoryForm onCreated={refresh} />
      </div>

      {loading && <p style={{ color: 'var(--ink-muted)' }}>Cargando...</p>}
      {error && <p style={{ color: 'var(--loss-500)' }}>{error}</p>}
      {!loading && <CategoryList categories={categories} />}
    </AppLayout>
  );
}
