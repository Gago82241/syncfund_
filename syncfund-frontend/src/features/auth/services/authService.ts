import { apiClient } from '../../../services/apiClient';
import type { AuthResponse, LoginRequest, RegisterUserRequest } from '../../../types/api';

/** User.login() / registro — coincide con AuthController del backend (ya devuelve token + user). */
export const authService = {
  register(data: RegisterUserRequest) {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },
  login(data: LoginRequest) {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },
};
