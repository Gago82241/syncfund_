import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * Para /login y /register: quien ya inició sesión va al Resumen en lugar de ver el formulario.
 * Si el token guardado está vencido, la primera petición del Resumen recibe 401 y apiClient
 * borra la sesión antes de volver a /login, así que no hay ciclo entre las dos rutas.
 */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
