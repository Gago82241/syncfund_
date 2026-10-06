import { apiClient } from '../../../services/apiClient';
import type {
  AddMemberRequest,
  CreateSharedProjectRequest,
  DistributeContributionRequest,
  NetBalanceResponse,
  RegisterSelectiveExpenseRequest,
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
};
