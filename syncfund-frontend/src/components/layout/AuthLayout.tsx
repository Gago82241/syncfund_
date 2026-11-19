import type { ReactNode } from 'react';
import './AuthLayout.css';

/**
 * Layout de login y registro. En escritorio, pantalla dividida: panel de marca a la izquierda
 * (el único momento "de autor" del diseño) y formulario a la derecha. En el celular, el panel se
 * reduce a una franja con el nombre y una línea, para que el formulario quede a la vista sin
 * desplazarse: quien vuelve a registrar un gasto no tiene que pasar el eslogan cada vez.
 * El h1 de cada página es el título del formulario; el eslogan es un párrafo.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout">
      <aside className="auth-layout__brand">
        <span className="auth-layout__wordmark">SyncFund</span>
        <p className="auth-layout__tagline">Tu billetera y tus proyectos, en un solo lugar.</p>
        <p className="auth-layout__headline">
          Tu billetera y tus proyectos,<br />un solo saldo real.
        </p>
        <p className="auth-layout__sub">
          Registra tus ingresos y gastos, aporta al fondo de tus proyectos
          compartidos y mira quién le debe a quién, sin hacer cuentas a mano.
        </p>
        {/* Dos círculos entrelazados en tonos de tinta: la billetera y el fondo común. */}
        <svg className="auth-layout__motif" viewBox="0 0 200 120" aria-hidden="true">
          <circle className="auth-layout__ring auth-layout__ring--a" cx="70" cy="60" r="46" />
          <circle className="auth-layout__ring auth-layout__ring--b" cx="130" cy="60" r="46" />
        </svg>
      </aside>
      <main className="auth-layout__panel">
        <div className="auth-layout__panel-inner">{children}</div>
      </main>
    </div>
  );
}
