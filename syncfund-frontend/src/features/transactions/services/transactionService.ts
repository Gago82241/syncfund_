import { apiClient } from '../../../services/apiClient';
import type { CategorizeTransactionRequest, CreateTransactionRequest, TransactionResponse } from '../../../types/api';

/** Coincide con TransactionController del backend. */
export const transactionService = {
  create(data: CreateTransactionRequest) {
    return apiClient.post<TransactionResponse>('/transactions', data);
  },
  getByWallet(walletId: number, walletType: 'PERSONAL' | 'SHARED') {
    return apiClient.get<TransactionResponse[]>(`/transactions/wallet/${walletId}`, {
      params: { walletType },
    });
  },
  categorize(transactionId: number, data: CategorizeTransactionRequest) {
    return apiClient.put<TransactionResponse>(`/transactions/${transactionId}/category`, data);
  },
};
