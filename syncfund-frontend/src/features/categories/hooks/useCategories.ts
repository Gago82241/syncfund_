import { useCallback, useEffect, useState } from 'react';
import { categoryService } from '../services/categoryService';
import { personalWalletService } from '../../personal-wallet/services/personalWalletService';
import { describeLoadError, type LoadErrorInfo } from '../../../utils/apiError';
import type { CategoryResponse } from '../../../types/api';

export interface CategoryWithSpend extends CategoryResponse {
  spentThisMonth: number;
  overLimit: boolean;
}

async function fetchCategoriesWithSpend(userId: number): Promise<CategoryWithSpend[]> {
  const { data: wallet } = await personalWalletService.getByUser(userId);
  const { data: rawCategories } = await categoryService.getAll();

  const month = new Date().toISOString().slice(0, 7); // "yyyy-MM"

  return Promise.all(
    rawCategories.map(async (cat) => {
      const { data: spent } = await categoryService.getExpense(
        cat.categoryId,
        wallet.walletId,
        'PERSONAL',
        month,
      );
      const { data: overLimit } = await categoryService.isOverLimit(cat.categoryId, spent);
      return { ...cat, spentThisMonth: spent, overLimit };
    }),
  );
}

/**
 * Trae las categorías del usuario y, para cada una, el gasto acumulado del mes
 * actual contra su PersonalWallet (Category.calculateTotalExpense
 * + Category.alertExcess). Cada categoría pertenece a un usuario; aquí
 * las medimos contra la billetera personal como caso de uso principal.
 */
export function useCategories(userId: number) {
  // null hasta la primera carga exitosa: una lista vacía solo significa "no hay categorías".
  const [categories, setCategories] = useState<CategoryWithSpend[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LoadErrorInfo | null>(null);

  // load no marca "cargando": el estado inicial ya lo hace y refresh lo marca antes de recargar.
  const load = useCallback(
    () =>
      fetchCategoriesWithSpend(userId)
        .then((withSpend) => {
          setCategories(withSpend);
          setError(null);
        })
        .catch((err) => setError(describeLoadError(err, 'tus categorías')))
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

  return { categories, loading, error, refresh };
}
