import { apiClient } from '../../../services/apiClient';
import type {
  ManageCushionRequest,
  PersonalWalletResponse,
  SetSavingsGoalRequest,
} from '../../../types/api';

/** Coincide con PersonalWalletController del backend. */
export const personalWalletService = {
  getByUser(userId: number) {
    return apiClient.get<PersonalWalletResponse>(`/wallets/personal/user/${userId}`);
  },
  setSavingsGoal(walletId: number, data: SetSavingsGoalRequest) {
    return apiClient.put<PersonalWalletResponse>(`/wallets/personal/${walletId}/goal`, data);
  },
  manageCushion(walletId: number, data: ManageCushionRequest) {
    return apiClient.post<PersonalWalletResponse>(`/wallets/personal/${walletId}/cushion`, data);
  },
  adjustPrivateBudget(walletId: number, frequency: string) {
    return apiClient.get<number>(`/wallets/personal/${walletId}/budget`, { params: { frequency } });
  },
};
