import { useCallback, useEffect, useRef, useState } from 'react';
import { sharedProjectService } from '../services/sharedProjectService';
import { afterActionLoadError, describeLoadError, type LoadErrorInfo } from '../../../utils/apiError';
import type { SharedProjectResponse } from '../../../types/api';

/**
 * Proyectos en los que participa el usuario.
 * `projects` es null hasta la primera carga exitosa: así una lista vacía solo significa
 * que el backend respondió bien y no hay proyectos, nunca que la carga falló.
 */
export function useSharedProjects(userId: number) {
  const [projects, setProjects] = useState<SharedProjectResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LoadErrorInfo | null>(null);
  // true desde que una acción se guardó hasta que una recarga sale bien: si la recarga falla,
  // el error avisa que la acción sí quedó (afterActionLoadError), también al reintentar.
  const unconfirmedAction = useRef(false);

  // load no marca "cargando": el estado inicial ya lo hace y refresh lo marca antes de recargar.
  const load = useCallback(
    () =>
      sharedProjectService
        .getByMember(userId)
        .then(({ data }) => {
          setProjects(data);
          setError(null);
          unconfirmedAction.current = false;
        })
        .catch((err) => {
          const info = describeLoadError(err, 'tus proyectos compartidos');
          setError(unconfirmedAction.current ? afterActionLoadError(info) : info);
        })
        .finally(() => setLoading(false)),
    [userId],
  );

  // El error se mantiene mientras se reintenta, para que el botón muestre "Procesando..." sin parpadeos.
  const refresh = useCallback(() => {
    setLoading(true);
    return load();
  }, [load]);

  /** Recarga después de una acción que el backend ya aceptó (guardar, crear, pagar…). */
  const refreshAfterAction = useCallback(() => {
    unconfirmedAction.current = true;
    return refresh();
  }, [refresh]);

  useEffect(() => {
    load();
  }, [load]);

  return { projects, loading, error, refresh, refreshAfterAction };
}
