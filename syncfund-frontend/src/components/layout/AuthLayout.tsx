import type { ReactNode } from 'react';
import './AuthLayout.css';

/**
 * Layout split-screen para login/registro: panel editorial a la izquierda
 * (voz de marca), formulario a la derecha. Es el único momento "de autor"
 * del diseño — el resto de la app, ya autenticada, se mantiene silenciosa.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout">
      <aside className="auth-layout__brand">
        <span className="auth-layout__wordmark">SyncFund</span>
        <h1 className="auth-layout__headline">
          Dos cuentas,<br />un solo saldo real.
        </h1>
        <p className="auth-layout__sub">
          Lleva tus finanzas personales y los gastos compartidos con tus
          proyectos en un mismo lugar, sincronizados al instante.
        </p>
        <svg className="auth-layout__motif" viewBox="0 0 200 120" aria-hidden="true">
          <circle cx="70" cy="60" r="46" fill="none" stroke="#2C5F8A" strokeWidth="1.5" opacity="0.55" />
          <circle cx="130" cy="60" r="46" fill="none" stroke="#2F9E7D" strokeWidth="1.5" opacity="0.7" />
        </svg>
      </aside>
      <main className="auth-layout__panel">
        <div className="auth-layout__panel-inner">{children}</div>
      </main>
    </div>
  );
}
