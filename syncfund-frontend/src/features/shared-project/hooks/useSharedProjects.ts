import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchBalances, fetchProjectsWithBalances } from '../projectBalances';
import { sortProjectLines, toProjectLine, type ProjectLine } from '../projectLines';
import { describeLoadError, type LoadErrorInfo } from '../../../utils/apiError';
import type { ProjectBalancesResponse, SharedProjectResponse } from '../../../types/api';

interface ProjectsState {
  projects: SharedProjectResponse[];
  balances: Map<number, ProjectBalancesResponse>;
  failedIds: number[];
}

/**
 * Proyectos en los que participa el usuario, con su saldo neto en cada uno.
 * `lines` es null hasta la primera carga exitosa de la lista: así una lista vacía solo significa
 * que el backend respondió bien y no hay proyectos, nunca que la carga falló.
 * Si falla la lista, `error` (y no se muestra la anterior). Si falla el saldo de algunos
 * proyectos, la lista sí se muestra: esos renglones quedan sin cifra (net = null) y
 * `retryBalances` vuelve a pedir solo esos saldos.
 */
export function useSharedProjects(userId: number) {
  const [state, setState] = useState<ProjectsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LoadErrorInfo | null>(null);
  const [retryingBalances, setRetryingBalances] = useState(false);
  // Cada carga lleva un número: si llega la respuesta de una carga vieja, se descarta.
  const latestLoad = useRef(0);

  // load no marca "cargando": el estado inicial ya lo hace y refresh lo marca antes de recargar.
  const load = useCallback(() => {
    const loadId = ++latestLoad.current;
    return fetchProjectsWithBalances(userId)
      .then(({ projects, balances, failedIds }) => {
        if (loadId !== latestLoad.current) return;
        setState({ projects, balances, failedIds });
        setError(null);
      })
      .catch((err) => {
        if (loadId !== latestLoad.current) return;
        setError(describeLoadError(err, 'tus proyectos compartidos'));
      })
      .finally(() => {
        if (loadId === latestLoad.current) setLoading(false);
      });
  }, [userId]);

  // El error se mantiene mientras se reintenta, para que el botón muestre "Procesando..." sin parpadeos.
  const refresh = useCallback(() => {
    setLoading(true);
    return load();
  }, [load]);

  /** Vuelve a pedir solo los saldos que fallaron, sin recargar la lista. */
  const retryBalances = useCallback(() => {
    if (!state || state.failedIds.length === 0) return Promise.resolve();
    const loadId = latestLoad.current;
    setRetryingBalances(true);
    return fetchBalances(state.failedIds)
      .then(({ balances, failedIds }) => {
        // Si mientras tanto empezó una recarga completa, esa respuesta manda.
        if (loadId !== latestLoad.current) return;
        setState((current) =>
          current && {
            ...current,
            balances: new Map([...current.balances, ...balances]),
            failedIds,
          },
        );
      })
      .finally(() => setRetryingBalances(false));
  }, [state]);

  useEffect(() => {
    load();
  }, [load]);

  const lines = useMemo<ProjectLine[] | null>(
    () =>
      state &&
      sortProjectLines(state.projects.map((p) => toProjectLine(userId, p, state.balances.get(p.projectId)))),
    [state, userId],
  );

  // Proyectos sin saldo: los que fallaron y, por si acaso, aquellos donde el usuario no aparece.
  const missingBalances = lines?.filter((line) => line.net === null).length ?? 0;

  return { lines, missingBalances, loading, error, refresh, retryBalances, retryingBalances };
}
