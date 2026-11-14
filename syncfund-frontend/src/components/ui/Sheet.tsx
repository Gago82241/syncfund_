import { useId, type ReactNode } from 'react';
import './Sheet.css';

interface SheetProps {
  title: string;
  /** Nivel del título: h2 por defecto; h3 si la hoja va dentro de otra sección. */
  headingLevel?: 2 | 3;
  /** Acción secundaria a la derecha del título (ej. "Ver todo"). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Hoja de papel blanco con título de sección y línea fina. Sin sombra: es plana. */
export function Sheet({ title, headingLevel = 2, action, children, className }: SheetProps) {
  const titleId = useId();
  const Heading = headingLevel === 3 ? 'h3' : 'h2';

  return (
    <section className={['sf-sheet', className].filter(Boolean).join(' ')} aria-labelledby={titleId}>
      <div className="sf-sheet__header">
        <Heading id={titleId} className="sf-sheet__title">{title}</Heading>
        {action && <div className="sf-sheet__action">{action}</div>}
      </div>
      <div className="sf-sheet__body">{children}</div>
    </section>
  );
}
