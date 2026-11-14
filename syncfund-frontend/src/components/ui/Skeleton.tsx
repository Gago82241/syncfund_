import type { ReactNode } from 'react';
import './Skeleton.css';

interface SkeletonProps {
  /** line: renglón de texto · figure: cifra protagonista · block: bloque libre. */
  variant?: 'line' | 'figure' | 'block';
  /** Ancho CSS. Por defecto 100 %. */
  width?: string;
  /** Alto CSS; solo para variant="block". */
  height?: string;
}

/** Bloque gris con la forma del contenido que está por llegar. Oculto para lectores de pantalla. */
export function Skeleton({ variant = 'line', width, height }: SkeletonProps) {
  return (
    <span
      className={`sf-skeleton sf-skeleton--${variant}`}
      style={{ width, height: variant === 'block' ? height : undefined }}
      aria-hidden="true"
    />
  );
}

interface SkeletonGroupProps {
  /** Lo que anuncia el lector de pantalla mientras carga. */
  label?: string;
  children: ReactNode;
}

/** Agrupa los bloques de una carga y la anuncia una sola vez (role="status"). */
export function SkeletonGroup({ label = 'Cargando…', children }: SkeletonGroupProps) {
  return (
    <div className="sf-skeleton-group" role="status">
      <span className="visually-hidden">{label}</span>
      {children}
    </div>
  );
}

/** Atajo para listas: n renglones de libro mayor (descripción + monto). */
export function SkeletonRows({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="sf-skeleton-row" aria-hidden="true">
          <span className="sf-skeleton-row__text">
            <Skeleton width={i % 2 === 0 ? '60%' : '45%'} />
            <Skeleton width="30%" />
          </span>
          <Skeleton width="5rem" />
        </span>
      ))}
    </>
  );
}
