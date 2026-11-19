import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PersonalWalletPage } from '../pages/PersonalWalletPage';
import { SharedProjectsPage } from '../pages/SharedProjectsPage';
import { SharedProjectDetailPage } from '../pages/SharedProjectDetailPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { HomeRedirect } from './HomeRedirect';

/**
 * Catálogo de componentes, solo en desarrollo. En el build de producción Vite reemplaza
 * import.meta.env.DEV por false, así que la ruta no existe y su código no se empaqueta.
 */
const ComponentCatalogPage = import.meta.env.DEV
  ? lazy(() => import('../pages/dev/ComponentCatalogPage'))
  : null;
/** Demo de la estructura de la app (AppLayout), también solo en desarrollo y con sesión. */
const StructureDemoPage = import.meta.env.DEV
  ? lazy(() => import('../pages/dev/StructureDemoPage'))
  : null;

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <PersonalWalletPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <SharedProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <SharedProjectDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />
        {ComponentCatalogPage && (
          <Route
            path="/dev/componentes"
            element={
              <Suspense fallback={null}>
                <ComponentCatalogPage />
              </Suspense>
            }
          />
        )}
        {StructureDemoPage && (
          <Route
            path="/dev/componentes/estructura"
            element={
              <ProtectedRoute>
                <Suspense fallback={null}>
                  <StructureDemoPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
        )}
      </Routes>
    </BrowserRouter>
  );
}
