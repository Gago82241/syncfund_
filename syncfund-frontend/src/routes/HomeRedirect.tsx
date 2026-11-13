import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/** La raíz "/" lleva al Resumen si hay sesión y al login si no. */
export function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}
