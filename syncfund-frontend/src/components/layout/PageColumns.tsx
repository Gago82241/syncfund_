import type { HTMLAttributes, ReactNode } from 'react';
import './PageColumns.css';

interface PageColumnsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * equal: dos columnas iguales (ej. Situación y Movimientos del proyecto).
   * main-aside: principal ancha y lateral angosta (ej. Movimientos | meta y colchón).
   */
  variant?: 'equal' | 'main-aside';
  children: ReactNode;
}

/**
 * Hojas de la página en una columna (celular) o dos (cuando el contenido mide 52rem o más).
 * Decide por el ancho del contenedor de AppLayout, no por el de la ventana: con el menú
 * lateral, a 1024 px quedan unos 720 px y las dos columnas no caben.
 */
export function PageColumns({ variant = 'equal', className, children, ...rest }: PageColumnsProps) {
  return (
    <div className={['sf-columns', `sf-columns--${variant}`, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}
