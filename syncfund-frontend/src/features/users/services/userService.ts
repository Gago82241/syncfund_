import { apiClient } from '../../../services/apiClient';
import type { UserResponse } from '../../../types/api';

/** Coincide con UserController del backend. */
export const userService = {
  getById(id: number) {
    return apiClient.get<UserResponse>(`/users/${id}`);
  },
};
