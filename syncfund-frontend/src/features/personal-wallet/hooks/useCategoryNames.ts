import { useCallback, useEffect, useState } from 'react';
import { categoryService } from '../../categories/services/categoryService';

/**
 * Nombres de las categorías por id, para mostrarlos en los movimientos.
 * Es un dato de apoyo: si falla, la Billetera se ve igual, sin los nombres, y ofrece reintentar.
 */
export function useCategoryNames() {
  const [names, setNames] = useState<ReadonlyMap<number, string>>(new Map());
  const [failed, setFailed] = useState(false);
  const [retrying, setRetrying] = useState(false);

  // load no marca "reintentando": lo hace retry antes de llamarla.
  const load = useCallback(
    () =>
      categoryService
        .getAll()
        .then(({ data }) => {
          setNames(new Map(data.map((c) => [c.categoryId, c.name])));
          setFailed(false);
        })
        .catch(() => setFailed(true))
        .finally(() => setRetrying(false)),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const retry = useCallback(() => {
    setRetrying(true);
    load();
  }, [load]);

  return { names, failed, retrying, retry };
}
