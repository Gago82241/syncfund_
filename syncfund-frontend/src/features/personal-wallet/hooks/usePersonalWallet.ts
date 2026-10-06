import { useCallback, useEffect, useState } from 'react';
import { personalWalletService } from '../services/personalWalletService';
import { transactionService } from '../../transactions/services/transactionService';
import type { PersonalWalletResponse, TransactionResponse } from '../../../types/api';

/**
 * Orquesta la carga de la PersonalWallet del usuario + su historial de
 * transacciones, y expone un refresh() para recargar después de cada
 * acción (registrar movimiento, cambiar meta, mover el colchón).
 */
export function usePersonalWallet(userId: number) {
  const [wallet, setWallet] = useState<PersonalWalletResponse | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: walletData } = await personalWalletService.getByUser(userId);
      setWallet(walletData);

      const { data: txData } = await transactionService.getByWallet(walletData.walletId, 'PERSONAL');
      setTransactions(txData.slice().sort((a, b) => b.dateTime.localeCompare(a.dateTime)));
    } catch {
      setError('No se pudo cargar tu billetera personal.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { wallet, transactions, loading, error, refresh };
}
