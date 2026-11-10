import { useCallback, useEffect, useState } from 'react';
import { personalWalletService } from '../services/personalWalletService';
import { transactionService } from '../../transactions/services/transactionService';
import { describeLoadError, type LoadErrorInfo } from '../../../utils/apiError';
import type { PersonalWalletResponse, TransactionResponse } from '../../../types/api';

async function fetchWalletWithTransactions(userId: number) {
  const { data: wallet } = await personalWalletService.getByUser(userId);
  const { data: txData } = await transactionService.getByWallet(wallet.walletId, 'PERSONAL');
  const transactions = txData.slice().sort((a, b) => b.dateTime.localeCompare(a.dateTime));
  return { wallet, transactions };
}

/**
 * Orquesta la carga de la PersonalWallet del usuario + su historial de
 * transacciones, y expone un refresh() para recargar después de cada
 * acción (registrar movimiento, cambiar meta, mover el colchón).
 * Billetera y movimientos se guardan juntos solo si ambos llegan bien: si fallan los
 * movimientos no queda una billetera con una lista vacía que parezca "sin movimientos".
 */
export function usePersonalWallet(userId: number) {
  const [wallet, setWallet] = useState<PersonalWalletResponse | null>(null);
  // null hasta la primera carga exitosa: una lista vacía solo significa "no hay movimientos".
  const [transactions, setTransactions] = useState<TransactionResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LoadErrorInfo | null>(null);

  // load no marca "cargando": el estado inicial ya lo hace y refresh lo marca antes de recargar.
  const load = useCallback(
    () =>
      fetchWalletWithTransactions(userId)
        .then((data) => {
          setWallet(data.wallet);
          setTransactions(data.transactions);
          setError(null);
        })
        .catch((err) => setError(describeLoadError(err, 'tu billetera personal')))
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

  return { wallet, transactions, loading, error, refresh };
}
