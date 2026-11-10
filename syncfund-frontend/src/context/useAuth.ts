import { createContext, useContext } from 'react';
import type { AuthResponse, UserResponse } from '../types/api';

interface AuthContextValue {
  user: UserResponse | null;
  login: (auth: AuthResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
