import type { ReactNode } from 'react';
import './PageHeader.css';

export type MoneyTone = 'gain' | 'loss' | 'neutral';

interface PageHeaderProps {
  /** Título de la página: es el único h1. */
  title: string;
  /** Cifra protagonista. Siempre con etiqueta que diga qué es ("Disponible", "Te deben"…). */
  figure?: {
    label: string;
    value: ReactNode;
    tone?: MoneyTone;
  };
  /** Dato secundario bajo la cifra (ej. "Fondo del proyecto: $450.000"). */
  meta?: ReactNode;
  /** Acción principal de la página. */
  action?: ReactNode;
  /**
   * En el celular (< 1024 px) la acción queda fija justo encima de la barra inferior, al
   * alcance del pulgar; AppLayout deja libre ese alto en el contenido y en los avisos.
   * Solo para páginas dentro de AppLayout. En escritorio no cambia nada.
   */
  fixedActionOnMobile?: boolean;
}

/**
 * Encabezado de página: título, una sola cifra protagonista con su etiqueta y la acción
 * principal. Cierra con una línea fina, como el pie de un bloque del libro mayor.
 */
export function PageHeader({ title, figure, meta, action, fixedActionOnMobile }: PageHeaderProps) {
  return (
    <header className={`sf-page-header${fixedActionOnMobile && action ? ' sf-page-header--fixed-action' : ''}`}>
      <div className="sf-page-header__main">
        <h1 className="sf-page-header__title">{title}</h1>
        {figure && (
          <div className="sf-page-header__figure">
            <p className="sf-page-header__figure-label">{figure.label}</p>
            <p
              className={`sf-page-header__figure-value tabular-nums sf-page-header__figure-value--${figure.tone ?? 'neutral'}`}
            >
              {figure.value}
            </p>
          </div>
        )}
        {meta && <div className="sf-page-header__meta">{meta}</div>}
      </div>
      {action && <div className="sf-page-header__action">{action}</div>}
    </header>
  );
}
