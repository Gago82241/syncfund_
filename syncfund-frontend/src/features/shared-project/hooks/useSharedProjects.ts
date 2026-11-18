import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchBalance, fetchProjectList } from '../projectBalances';
import { sortProjectLines, toProjectLine, type ProjectLine } from '../projectLines';
import { describeLoadError, type LoadErrorInfo } from '../../../utils/apiError';
import type { ProjectBalancesResponse, SharedProjectResponse } from '../../../types/api';

interface ProjectsState {
  projects: SharedProjectResponse[];
  balances: Map<number, ProjectBalancesResponse>;
  /** Saldos que fallaron: el renglón dice "Saldo sin cargar". */
  failedIds: number[];
  /** Saldos que aún no llegan: el renglón dice "Cargando saldo". */
  pendingIds: number[];
}

/**
 * Proyectos en los que participa el usuario, con su saldo neto en cada uno.
 * La lista se muestra apenas llega; cada saldo se completa cuando responde su petición, sin
 * esperar al más lento (decisión del equipo, 2026-11-18). El orden por situación se aplica
 * cuando ya no queda ningún saldo pendiente, para que los renglones no salten mientras cargan.
 * `lines` es null hasta la primera carga exitosa de la lista: así una lista vacía solo significa
 * que el backend respondió bien y no hay proyectos, nunca que la carga falló.
 * Si falla la lista, `error` (y no se muestra la anterior). Si falla el saldo de algunos
 * proyectos, esos renglones quedan sin cifra (net = null) y `retryBalances` pide solo esos.
 */
export function useSharedProjects(userId: number) {
  const [state, setState] = useState<ProjectsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LoadErrorInfo | null>(null);
  const [retryingBalances, setRetryingBalances] = useState(false);
  // Cada carga lleva un número: si llega la respuesta de una carga vieja, se descarta.
  const latestLoad = useRef(0);

  /** Pide los saldos indicados, cada uno por su cuenta; uno que falle no frena a los demás. */
  const loadBalances = useCallback((ids: readonly number[], loadId: number) => {
    const settleOne = (id: number, balance: ProjectBalancesResponse | null) => {
      if (loadId !== latestLoad.current) return;
      setState((current) => {
        if (!current) return current;
        const balances = new Map(current.balances);
        if (balance) balances.set(id, balance);
        return {
          ...current,
          balances,
          failedIds: balance ? current.failedIds.filter((f) => f !== id) : [...new Set([...current.failedIds, id])],
          pendingIds: current.pendingIds.filter((p) => p !== id),
        };
      });
    };
    return Promise.all(
      ids.map((id) =>
        fetchBalance(id)
          .then((balance) => settleOne(id, balance))
          .catch(() => settleOne(id, null)),
      ),
    );
  }, []);

  // load no marca "cargando": el estado inicial ya lo hace y refresh lo marca antes de recargar.
  const load = useCallback(() => {
    const loadId = ++latestLoad.current;
    return fetchProjectList(userId)
      .then((projects) => {
        if (loadId !== latestLoad.current) return;
        const ids = projects.map((p) => p.projectId);
        setState({ projects, balances: new Map(), failedIds: [], pendingIds: ids });
        setError(null);
        setLoading(false);
        return loadBalances(ids, loadId);
      })
      .catch((err) => {
        if (loadId !== latestLoad.current) return;
        setError(describeLoadError(err, 'tus proyectos compartidos'));
        setLoading(false);
      });
  }, [userId, loadBalances]);

  // El error se mantiene mientras se reintenta, para que el botón muestre "Procesando..." sin parpadeos.
  const refresh = useCallback(() => {
    setLoading(true);
    return load();
  }, [load]);

  /** Vuelve a pedir solo los saldos que fallaron, sin recargar la lista. */
  const retryBalances = useCallback(() => {
    if (!state || state.failedIds.length === 0) return Promise.resolve();
    const ids = state.failedIds;
    setRetryingBalances(true);
    return loadBalances(ids, latestLoad.current).finally(() => setRetryingBalances(false));
  }, [state, loadBalances]);

  useEffect(() => {
    load();
  }, [load]);

  const pendingBalances = state?.pendingIds.length ?? 0;

  const lines = useMemo<ProjectLine[] | null>(() => {
    if (!state) return null;
    const pending = new Set(state.pendingIds);
    const unsorted = state.projects.map((p) => ({
      ...toProjectLine(userId, p, state.balances.get(p.projectId)),
      balanceLoading: pending.has(p.projectId),
    }));
    // Mientras llegan saldos, el orden del backend; al terminar, el de la situación.
    return pending.size > 0 ? unsorted : sortProjectLines(unsorted);
  }, [state, userId]);

  // Proyectos sin saldo: los que fallaron y, por si acaso, aquellos donde el usuario no aparece.
  const missingBalances = lines?.filter((line) => line.net === null && !line.balanceLoading).length ?? 0;

  return { lines, missingBalances, pendingBalances, loading, error, refresh, retryBalances, retryingBalances };
}
