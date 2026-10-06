import { useCallback, useEffect, useState } from 'react';
import { categoryService } from '../services/categoryService';
import { personalWalletService } from '../../personal-wallet/services/personalWalletService';
import type { CategoryResponse } from '../../../types/api';

export interface CategoryWithSpend extends CategoryResponse {
  spentThisMonth: number;
  overLimit: boolean;
}

/**
 * Trae todas las categorías y, para cada una, el gasto acumulado del mes
 * actual contra la PersonalWallet del usuario (Category.calculateTotalExpense
 * + Category.alertExcess). Las categorías son globales en el backend; aquí
 * las medimos contra la billetera personal como caso de uso principal.
 */
export function useCategories(userId: number) {
  const [categories, setCategories] = useState<CategoryWithSpend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: wallet } = await personalWalletService.getByUser(userId);
      const { data: rawCategories } = await categoryService.getAll();

      const month = new Date().toISOString().slice(0, 7); // "yyyy-MM"

      const withSpend = await Promise.all(
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

      setCategories(withSpend);
    } catch {
      setError('No se pudieron cargar las categorías.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { categories, loading, error, refresh };
}
