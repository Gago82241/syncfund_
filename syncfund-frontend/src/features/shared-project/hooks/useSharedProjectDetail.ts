import { useCallback, useEffect, useState } from 'react';
import { sharedProjectService } from '../services/sharedProjectService';
import { transactionService } from '../../transactions/services/transactionService';
import { userService } from '../../users/services/userService';
import type { NetBalanceResponse, SharedProjectResponse, TransactionResponse, UserResponse } from '../../../types/api';

/**
 * Orquesta todo lo que necesita la pantalla de detalle de un SharedProject:
 * el proyecto, los nombres de sus miembros (el backend solo da memberIds),
 * el saldo neto del usuario actual (DebtCalculator.determineNetBalance) y
 * el historial de movimientos del proyecto.
 */
export function useSharedProjectDetail(projectId: number, currentUserId: number) {
  const [project, setProject] = useState<SharedProjectResponse | null>(null);
  const [members, setMembers] = useState<UserResponse[]>([]);
  const [netBalance, setNetBalance] = useState<NetBalanceResponse | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: projectData } = await sharedProjectService.getById(projectId);
      setProject(projectData);

      const memberResponses = await Promise.all(
        projectData.memberIds.map((id) => userService.getById(id)),
      );
      setMembers(memberResponses.map((r) => r.data));

      const { data: balanceData } = await sharedProjectService.getNetBalance(projectId, currentUserId);
      setNetBalance(balanceData);

      const { data: txData } = await transactionService.getByWallet(projectId, 'SHARED');
      setTransactions(txData.slice().sort((a, b) => b.dateTime.localeCompare(a.dateTime)));
    } catch {
      setError('No se pudo cargar el proyecto compartido.');
    } finally {
      setLoading(false);
    }
  }, [projectId, currentUserId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { project, members, netBalance, transactions, loading, error, refresh };
}
