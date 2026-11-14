import { useCallback, useEffect, useRef, useState } from 'react';
import { personalWalletService } from '../../personal-wallet/services/personalWalletService';
import { sharedProjectService } from '../../shared-project/services/sharedProjectService';
import { categoryService } from '../../categories/services/categoryService';
import { transactionService } from '../../transactions/services/transactionService';
import { afterActionLoadError, describeLoadError, type LoadErrorInfo } from '../../../utils/apiError';
import { currentMonthKey } from '../../../utils/formatDate';
import {
  computeDashboardSummary,
  isNewUser,
  needsHistoryCheck,
  selectBudgetAlerts,
  type BudgetAlert,
  type DashboardSummary,
} from '../summary';
import type { CategoryResponse, PersonalWalletResponse, ProjectBalancesResponse } from '../../../types/api';

export interface DashboardData {
  walletId: number;
  isNewUser: boolean;
  summary: DashboardSummary;
}

export interface BudgetData {
  /** Mes medido ("yyyy-MM"), guardado con los datos para que el texto y las cifras coincidan. */
  month: string;
  /** Cuántas categorías tienen límite mensual (0: no hay nada que vigilar). */
  limitedCount: number;
  alerts: BudgetAlert[];
}

async function fetchSummary(
  userId: number,
  walletPromise: Promise<PersonalWalletResponse>,
): Promise<DashboardData> {
  const [wallet, projects] = await Promise.all([
    walletPromise,
    sharedProjectService.getByMember(userId).then((r) => r.data),
  ]);

  // Segunda ronda, en paralelo: la situación de cada proyecto y, solo si podría ser un usuario
  // nuevo, su historial (para no confundir "nuevo" con "gastó todo lo que tenía").
  const checkHistory = needsHistoryCheck(wallet, projects);
  const [balances, transactionCount] = await Promise.all([
    Promise.all(projects.map((p) => sharedProjectService.getBalances(p.projectId).then((r) => r.data))),
    checkHistory
      ? transactionService.getByWallet(wallet.walletId, 'PERSONAL').then((r) => r.data.length)
      : Promise.resolve(null),
  ]);

  const balancesByProject = new Map<number, ProjectBalancesResponse>(balances.map((b) => [b.projectId, b]));
  return {
    walletId: wallet.walletId,
    isNewUser: isNewUser(wallet, projects, transactionCount),
    summary: computeDashboardSummary(userId, wallet, projects, balancesByProject),
  };
}

async function fetchBudget(
  walletPromise: Promise<PersonalWalletResponse>,
  categoriesPromise: Promise<CategoryResponse[]>,
): Promise<BudgetData> {
  const month = currentMonthKey();
  const [wallet, categories] = await Promise.all([walletPromise, categoriesPromise]);
  const limited = categories.filter((c) => c.monthlyLimit > 0);
  const spent = await Promise.all(
    limited.map((c) =>
      categoryService
        .getExpense(c.categoryId, wallet.walletId, 'PERSONAL', month)
        .then((r) => [c.categoryId, r.data] as const),
    ),
  );
  return { month, limitedCount: limited.length, alerts: selectBudgetAlerts(limited, new Map(spent)) };
}

/**
 * Datos del Resumen. Hace las peticiones en dos rondas en paralelo:
 *   1. billetera, proyectos y categorías;
 *   2. la situación de cada proyecto y el gasto del mes de cada categoría con límite.
 * La cifra es todo o nada: si falla cualquiera de sus peticiones, `data` queda en null y se
 * muestra el error (nunca un total parcial). El presupuesto tiene su propio error, porque no
 * cambia cuánto tienes.
 */
export function useDashboard(userId: number) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<LoadErrorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [budgetError, setBudgetError] = useState<LoadErrorInfo | null>(null);
  const [budgetLoading, setBudgetLoading] = useState(true);
  // true desde que una acción se guardó hasta que una recarga sale bien (ver afterActionLoadError).
  const unconfirmedAction = useRef(false);
  // Cada carga lleva un número: si llega la respuesta de una carga vieja, se descarta.
  const latestLoad = useRef(0);
  const latestBudgetLoad = useRef(0);

  const applyBudget = useCallback((promise: Promise<BudgetData>) => {
    const loadId = ++latestBudgetLoad.current;
    return promise
      .then((result) => {
        if (loadId !== latestBudgetLoad.current) return;
        setBudget(result);
        setBudgetError(null);
      })
      .catch((err) => {
        if (loadId !== latestBudgetLoad.current) return;
        setBudgetError(describeLoadError(err, 'tu presupuesto del mes'));
      })
      .finally(() => {
        if (loadId === latestBudgetLoad.current) setBudgetLoading(false);
      });
  }, []);

  // load no marca "cargando": el estado inicial ya lo hace y refresh lo marca antes de recargar.
  const load = useCallback(() => {
    const loadId = ++latestLoad.current;
    const walletPromise = personalWalletService.getByUser(userId).then((r) => r.data);
    const categoriesPromise = categoryService.getAll().then((r) => r.data);

    const summaryDone = fetchSummary(userId, walletPromise)
      .then((result) => {
        if (loadId !== latestLoad.current) return;
        setData(result);
        setError(null);
        unconfirmedAction.current = false;
      })
      .catch((err) => {
        if (loadId !== latestLoad.current) return;
        const info = describeLoadError(err, 'tu resumen');
        // Sin cifra parcial: con error no queda el total anterior en pantalla.
        setData(null);
        setError(unconfirmedAction.current ? afterActionLoadError(info) : info);
      })
      .finally(() => {
        if (loadId === latestLoad.current) setLoading(false);
      });

    return Promise.all([summaryDone, applyBudget(fetchBudget(walletPromise, categoriesPromise))]);
  }, [userId, applyBudget]);

  // El error se mantiene mientras se reintenta, para que el botón muestre "Procesando..." sin parpadeos.
  const refresh = useCallback(() => {
    setLoading(true);
    setBudgetLoading(true);
    return load();
  }, [load]);

  /** Recarga después de una acción que el backend ya aceptó (registrar un movimiento). */
  const refreshAfterAction = useCallback(() => {
    unconfirmedAction.current = true;
    return refresh();
  }, [refresh]);

  /** Reintenta solo el presupuesto, sin volver a pedir la cifra. */
  const retryBudget = useCallback(() => {
    setBudgetLoading(true);
    const walletPromise = personalWalletService.getByUser(userId).then((r) => r.data);
    return applyBudget(fetchBudget(walletPromise, categoryService.getAll().then((r) => r.data)));
  }, [userId, applyBudget]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, loading, refresh, refreshAfterAction, budget, budgetError, budgetLoading, retryBudget };
}
