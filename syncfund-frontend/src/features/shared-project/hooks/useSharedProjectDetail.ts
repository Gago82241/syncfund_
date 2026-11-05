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
  const [loadedProjectId, setLoadedProjectId] = useState(projectId);

  // La ruta reutiliza esta pantalla al cambiar de proyecto: se vuelve a marcar "cargando".
  // Object.is porque un id no numérico en la URL da NaN, y con !== esto nunca dejaría de renderizar.
  if (!Object.is(loadedProjectId, projectId)) {
    setLoadedProjectId(projectId);
    setLoading(true);
    setError('');
  }

  // load no marca "cargando": el estado inicial ya lo hace y refresh lo marca antes de recargar.
  const load = useCallback(
    () =>
      sharedProjectService
        .getById(projectId)
        .then(({ data: projectData }) => {
          setProject(projectData);
          return Promise.all(projectData.memberIds.map((id) => userService.getById(id)));
        })
        .then((memberResponses) => {
          setMembers(memberResponses.map((r) => r.data));
          return sharedProjectService.getNetBalance(projectId, currentUserId);
        })
        .then(({ data: balanceData }) => {
          setNetBalance(balanceData);
          return transactionService.getByWallet(projectId, 'SHARED');
        })
        .then(({ data: txData }) => {
          setTransactions(txData.slice().sort((a, b) => b.dateTime.localeCompare(a.dateTime)));
        })
        .catch(() => setError('No se pudo cargar el proyecto compartido.'))
        .finally(() => setLoading(false)),
    [projectId, currentUserId],
  );

  const refresh = useCallback(() => {
    setLoading(true);
    setError('');
    return load();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  return { project, members, netBalance, transactions, loading, error, refresh };
}
