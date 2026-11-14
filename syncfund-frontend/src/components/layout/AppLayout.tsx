import { useRef, type MouseEvent, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Button } from '../ui/Button';
import { Icon, type IconName } from '../ui/Icon';
import { AccountMenu } from './AccountMenu';
import './AppLayout.css';

/** Los 4 destinos. Etiquetas cortas para que quepan en la barra inferior a 320 px. */
const DESTINATIONS: { to: string; label: string; icon: IconName }[] = [
  { to: '/dashboard', label: 'Resumen', icon: 'resumen' },
  { to: '/wallet', label: 'Billetera', icon: 'billetera' },
  { to: '/projects', label: 'Proyectos', icon: 'proyectos' },
  { to: '/categories', label: 'Categorías', icon: 'categorias' },
];

/**
 * Esqueleto de la app con sesión. Desde 1024 px: menú lateral fijo con la marca, los destinos
 * y la cuenta al pie. Por debajo: barra superior delgada (marca + menú de cuenta) y los mismos
 * destinos en una barra inferior fija. Hay un solo <nav>: el CSS decide dónde va.
 */
export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const mainRef = useRef<HTMLElement>(null);

  // El enlace funciona sin JavaScript (#contenido); con él, se evita dejar el ancla en la URL.
  function skipToContent(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    mainRef.current?.focus();
  }

  return (
    <div className="app-layout">
      <a className="app-layout__skip" href="#contenido" onClick={skipToContent}>
        Saltar al contenido
      </a>

      <header className="app-layout__side">
        <Link to="/dashboard" className="app-layout__wordmark">SyncFund</Link>

        <nav className="app-layout__nav" aria-label="Principal">
          <ul className="app-layout__nav-list">
            {DESTINATIONS.map((destination) => (
              <li key={destination.to}>
                {/* NavLink marca la página activa con aria-current="page" (también en /projects/:id). */}
                <NavLink to={destination.to} className="app-layout__nav-link">
                  <Icon name={destination.icon} />
                  <span className="app-layout__nav-label">{destination.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {user && (
          <>
            {/* Escritorio: la cuenta a la vista, al pie del menú lateral. */}
            <div className="app-layout__account">
              <p className="app-layout__account-name">{user.name}</p>
              <p className="app-layout__account-email">{user.email}</p>
              <Button variant="ghost" onClick={logout}>Cerrar sesión</Button>
            </div>
            {/* Celular: la cuenta dentro de un menú en la barra superior. */}
            <div className="app-layout__account-menu">
              <AccountMenu name={user.name} email={user.email} onLogout={logout} />
            </div>
          </>
        )}
      </header>

      <main id="contenido" ref={mainRef} className="app-layout__main" tabIndex={-1}>
        <div className="app-layout__content">{children}</div>
      </main>
    </div>
  );
}
