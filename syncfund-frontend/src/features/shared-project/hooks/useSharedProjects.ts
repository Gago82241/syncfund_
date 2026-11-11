import { useCallback, useEffect, useState } from 'react';
import { sharedProjectService } from '../services/sharedProjectService';
import { describeLoadError, type LoadErrorInfo } from '../../../utils/apiError';
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

  // load no marca "cargando": el estado inicial ya lo hace y refresh lo marca antes de recargar.
  const load = useCallback(
    () =>
      sharedProjectService
        .getByMember(userId)
        .then(({ data }) => {
          setProjects(data);
          setError(null);
        })
        .catch((err) => setError(describeLoadError(err, 'tus proyectos compartidos')))
        .finally(() => setLoading(false)),
    [userId],
  );

  // El error se mantiene mientras se reintenta, para que el botón muestre "Procesando..." sin parpadeos.
  const refresh = useCallback(() => {
    setLoading(true);
    return load();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  return { projects, loading, error, refresh };
}
