import { apiClient } from '../../../services/apiClient';
import type {
  AddMemberRequest,
  CreateSharedProjectRequest,
  DistributeContributionRequest,
  NetBalanceResponse,
  ProjectBalancesResponse,
  RegisterSelectiveExpenseRequest,
  SettleDebtRequest,
  SharedProjectResponse,
  TransactionResponse,
} from '../../../types/api';

/** Coincide con SharedProjectController del backend. */
export const sharedProjectService = {
  create(data: CreateSharedProjectRequest) {
    return apiClient.post<SharedProjectResponse>('/projects', data);
  },
  getById(id: number) {
    return apiClient.get<SharedProjectResponse>(`/projects/${id}`);
  },
  getByMember(userId: number) {
    return apiClient.get<SharedProjectResponse[]>(`/projects/user/${userId}`);
  },
  addMember(projectId: number, data: AddMemberRequest) {
    return apiClient.post<SharedProjectResponse>(`/projects/${projectId}/members`, data);
  },
  registerExpense(projectId: number, data: RegisterSelectiveExpenseRequest) {
    return apiClient.post<TransactionResponse>(`/projects/${projectId}/expenses`, data);
  },
  contribute(projectId: number, data: DistributeContributionRequest) {
    return apiClient.post<SharedProjectResponse>(`/projects/${projectId}/contributions`, data);
  },
  getNetBalance(projectId: number, userId: number) {
    return apiClient.get<NetBalanceResponse>(`/projects/${projectId}/debts/${userId}`);
  },
  /** Situación de todos los integrantes (DebtCalculator.calculateBalances). */
  getBalances(projectId: number) {
    return apiClient.get<ProjectBalancesResponse>(`/projects/${projectId}/balances`);
  },
  /**
   * SharedProject.removeParticipant: el admin elimina a un integrante, o el usuario actual sale
   * (userId = el suyo). Solo si está al día; el backend responde 204 sin cuerpo.
   */
  removeMember(projectId: number, userId: number) {
    return apiClient.delete<void>(`/projects/${projectId}/members/${userId}`);
  },
  /** SharedProject.settleDebts: el usuario actual le paga a otro integrante. */
  settle(projectId: number, data: SettleDebtRequest) {
    return apiClient.post<ProjectBalancesResponse>(`/projects/${projectId}/settlements`, data);
  },
};
