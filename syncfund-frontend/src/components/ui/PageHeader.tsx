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
}

/**
 * Encabezado de página: título, una sola cifra protagonista con su etiqueta y la acción
 * principal. Cierra con una línea fina, como el pie de un bloque del libro mayor.
 */
export function PageHeader({ title, figure, meta, action }: PageHeaderProps) {
  return (
    <header className="sf-page-header">
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
