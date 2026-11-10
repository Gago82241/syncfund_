import { useCallback, useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { describeLoadError, type LoadErrorInfo } from '../../../utils/apiError';

/**
 * Saldo general del usuario (User.getGeneralSummary), siempre recalculado en el backend.
 * No arranca con el valor guardado del login: ese dato puede tener días y el frontend no
 * sabe su antigüedad, así que `summary` es null hasta que llega la respuesta.
 */
export function useGeneralSummary(userId: number | undefined) {
  const [summary, setSummary] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LoadErrorInfo | null>(null);

  // load no marca "cargando": el estado inicial ya lo hace y refresh lo marca antes de recargar.
  const load = useCallback(() => {
    if (userId === undefined) return Promise.resolve();
    return userService
      .getSummary(userId)
      .then(({ data }) => {
        setSummary(data);
        setError(null);
      })
      .catch((err) => setError(describeLoadError(err, 'tu saldo')))
      .finally(() => setLoading(false));
  }, [userId]);

  // El error se mantiene mientras se reintenta, para que el botón muestre "Procesando..." sin parpadeos.
  const refresh = useCallback(() => {
    setLoading(true);
    return load();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  return { summary, loading, error, refresh };
}
