import { useCallback, useEffect, useRef, useState } from 'react';
import { sharedProjectService } from '../services/sharedProjectService';
import { transactionService } from '../../transactions/services/transactionService';
import { userService } from '../../users/services/userService';
import { describeLoadError, notFoundLoadError, type LoadErrorInfo } from '../../../utils/apiError';
import type {
  NetBalanceResponse,
  ProjectBalancesResponse,
  SharedProjectResponse,
  TransactionResponse,
  UserResponse,
} from '../../../types/api';

const WHAT = 'este proyecto compartido';
/** Se lanza cuando el id de la URL no es un entero positivo (ej. /projects/abc): no se pide al backend. */
const INVALID_ID = new Error('id de proyecto inválido');

async function fetchProjectDetail(projectId: number) {
  if (!Number.isInteger(projectId) || projectId <= 0) throw INVALID_ID;
  const { data: project } = await sharedProjectService.getById(projectId);
  const memberResponses = await Promise.all(project.memberIds.map((id) => userService.getById(id)));
  const { data: balances } = await sharedProjectService.getBalances(projectId);
  const { data: txData } = await transactionService.getByWallet(projectId, 'SHARED');
  // Un pago deja un ABONO y un COBRO con la misma descripción: basta mostrar el ABONO.
  const transactions = txData
    .filter((tx) => tx.type !== 'COBRO')
    .sort((a, b) => b.dateTime.localeCompare(a.dateTime));
  return { project, members: memberResponses.map((r) => r.data), balances, transactions };
}

/**
 * Orquesta todo lo que necesita la pantalla de detalle de un SharedProject:
 * el proyecto, los nombres de sus miembros (el backend solo da memberIds),
 * la situación de todos los integrantes (DebtCalculator.calculateBalances), de la que sale
 * el saldo neto del usuario actual, y el historial de movimientos del proyecto.
 * Todo se guarda junto solo si todas las peticiones llegan bien: una falla parcial
 * no deja la pantalla a medias (ej. proyecto con "sin movimientos").
 */
export function useSharedProjectDetail(projectId: number, currentUserId: number) {
  const [project, setProject] = useState<SharedProjectResponse | null>(null);
  const [members, setMembers] = useState<UserResponse[]>([]);
  const [balances, setBalances] = useState<ProjectBalancesResponse | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LoadErrorInfo | null>(null);
  const [loadedProjectId, setLoadedProjectId] = useState(projectId);
  // Número de la última carga pedida. Solo esa puede escribir el estado: una respuesta que llega
  // tarde (de otro proyecto, o de una recarga anterior del mismo) se descarta.
  const latestRequest = useRef(0);

  // La ruta reutiliza esta pantalla al cambiar de proyecto: se borran los datos del anterior
  // para no mostrarlos mientras carga el nuevo, y se vuelve a marcar "cargando".
  // Object.is porque un id no numérico en la URL da NaN, y con !== esto nunca dejaría de renderizar.
  if (!Object.is(loadedProjectId, projectId)) {
    setLoadedProjectId(projectId);
    setProject(null);
    setMembers([]);
    setBalances(null);
    setTransactions([]);
    setLoading(true);
    setError(null);
  }

  // load no marca "cargando": el estado inicial ya lo hace y refresh lo marca antes de recargar.
  const load = useCallback(() => {
    const requestId = ++latestRequest.current;
    const isLatest = () => latestRequest.current === requestId;

    return fetchProjectDetail(projectId)
      .then((data) => {
        if (!isLatest()) return;
        setProject(data.project);
        setMembers(data.members);
        setBalances(data.balances);
        setTransactions(data.transactions);
        setError(null);
      })
      .catch((err) => {
        if (!isLatest()) return;
        setError(err === INVALID_ID ? notFoundLoadError(WHAT) : describeLoadError(err, WHAT));
      })
      .finally(() => {
        if (isLatest()) setLoading(false);
      });
  }, [projectId]);

  // El error se mantiene mientras se reintenta, para que el botón muestre "Procesando..." sin parpadeos.
  const refresh = useCallback(() => {
    setLoading(true);
    return load();
  }, [load]);

  useEffect(() => {
    load();
    // Al cambiar de proyecto o salir de la pantalla, la carga en curso queda obsoleta.
    return () => {
      latestRequest.current += 1;
    };
  }, [load]);

  // Saldo del usuario actual para la tarjeta resumen: el mismo cálculo de la tabla de situación.
  const myBalance = balances?.members.find((m) => m.userId === currentUserId);
  const netBalance: NetBalanceResponse | null = myBalance
    ? { userId: currentUserId, projectId, netBalance: myBalance.netBalance }
    : null;

  return { project, members, balances, netBalance, transactions, loading, error, refresh };
}
