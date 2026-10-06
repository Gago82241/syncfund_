import { apiClient } from '../../../services/apiClient';
import type { CategoryResponse, CreateCategoryRequest } from '../../../types/api';

/** Coincide con CategoryController del backend. */
export const categoryService = {
  create(data: CreateCategoryRequest) {
    return apiClient.post<CategoryResponse>('/categories', data);
  },
  getAll() {
    return apiClient.get<CategoryResponse[]>('/categories');
  },
  getExpense(categoryId: number, walletId: number, walletType: 'PERSONAL' | 'SHARED', month: string) {
    return apiClient.get<number>(`/categories/${categoryId}/expense`, {
      params: { walletId, walletType, month },
    });
  },
  isOverLimit(categoryId: number, currentAmount: number) {
    return apiClient.get<boolean>(`/categories/${categoryId}/over-limit`, {
      params: { currentAmount },
    });
  },
};
