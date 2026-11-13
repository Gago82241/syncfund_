import { useEffect } from 'react';

/**
 * Cambia el texto del único <title> del documento (el de index.html).
 * No se usa <title> dentro de los componentes: React 19 lo agrega al <head> junto al de
 * index.html y quedarían dos, cuando el estándar HTML admite uno solo.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
