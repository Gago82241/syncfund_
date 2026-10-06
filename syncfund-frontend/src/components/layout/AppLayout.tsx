import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AppLayout.css';

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-layout">
      <header className="app-layout__header">
        <Link to="/dashboard" className="app-layout__wordmark">SyncFund</Link>
        <nav className="app-layout__nav">
          <Link to="/dashboard">Resumen</Link>
          <Link to="/wallet">Billetera personal</Link>
          <Link to="/projects">Proyectos compartidos</Link>
          <Link to="/categories">Categorías</Link>
        </nav>
        <div className="app-layout__user">
          <span>{user?.name}</span>
          <button onClick={logout}>Cerrar sesión</button>
        </div>
      </header>
      <main className="app-layout__content">{children}</main>
    </div>
  );
}
