import type { ReactNode } from 'react';

interface Props {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}

/** Sección del catálogo con ancla, para poder saltar a ella desde el índice. */
export function CatalogSection({ id, title, description, children }: Props) {
  return (
    <section id={id} className="catalog__section" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="catalog__section-title">{title}</h2>
      {description && <p className="catalog__section-description">{description}</p>}
      {children}
    </section>
  );
}

/** Un caso dentro de una sección: etiqueta corta + el componente en ese estado. */
export function CatalogCase({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="catalog__case">
      <p className="catalog__case-label">{label}</p>
      <div className="catalog__case-body">{children}</div>
    </div>
  );
}
