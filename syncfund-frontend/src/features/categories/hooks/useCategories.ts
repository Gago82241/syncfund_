import { useCallback, useEffect, useRef, useState } from 'react';
import { categoryService } from '../services/categoryService';
import { personalWalletService } from '../../personal-wallet/services/personalWalletService';
import { fetchMonthSpend, toBudgetLines, type BudgetLine } from '../budget';
import { afterActionLoadError, describeLoadError, type LoadErrorInfo } from '../../../utils/apiError';
import { currentMonthKey } from '../../../utils/formatDate';

/**
 * Peticiones en dos rondas en paralelo (N + 2 en total):
 *   1. billetera y categorías;
 *   2. el gasto del mes de cada categoría (Category.calculateTotalExpense).
 * El estado de cada categoría lo calcula el frontend con lo gastado y el límite (ver budget.ts).
 */
async function fetchBudgetLines(userId: number, month: string): Promise<BudgetLine[]> {
  const [wallet, categories] = await Promise.all([
    personalWalletService.getByUser(userId).then((r) => r.data),
    categoryService.getAll().then((r) => r.data),
  ]);
  const spent = await fetchMonthSpend(wallet.walletId, categories, month);
  return toBudgetLines(categories, spent);
}

/**
 * Las categorías del usuario con su gasto del mes actual en la billetera personal.
 * `lines` en el orden del backend; la página las ordena con sortBudgetLines.
 */
export function useCategories(userId: number) {
  // null hasta la primera carga exitosa: una lista vacía solo significa "no hay categorías".
  const [lines, setLines] = useState<BudgetLine[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LoadErrorInfo | null>(null);
  // Mes de los datos mostrados ("yyyy-MM"): se guarda con ellos para que el texto y las cifras coincidan.
  const [month, setMonth] = useState<string | null>(null);
  // true desde que una acción se guardó hasta que una recarga sale bien: si la recarga falla,
  // el error avisa que la acción sí quedó (afterActionLoadError), también al reintentar.
  const unconfirmedAction = useRef(false);
  // Cada carga lleva un número: si llega la respuesta de una carga vieja, se descarta.
  const latestLoad = useRef(0);

  // load no marca "cargando": el estado inicial ya lo hace y refresh lo marca antes de recargar.
  const load = useCallback(() => {
    const loadId = ++latestLoad.current;
    const monthToLoad = currentMonthKey();
    return fetchBudgetLines(userId, monthToLoad)
      .then((result) => {
        if (loadId !== latestLoad.current) return;
        setLines(result);
        setMonth(monthToLoad);
        setError(null);
        unconfirmedAction.current = false;
      })
      .catch((err) => {
        if (loadId !== latestLoad.current) return;
        const info = describeLoadError(err, 'tus categorías');
        setError(unconfirmedAction.current ? afterActionLoadError(info) : info);
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

  /** Recarga después de una acción que el backend ya aceptó (crear una categoría). */
  const refreshAfterAction = useCallback(() => {
    unconfirmedAction.current = true;
    return refresh();
  }, [refresh]);

  useEffect(() => {
    load();
  }, [load]);

  return { lines, month, loading, error, refresh, refreshAfterAction };
}
