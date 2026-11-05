import { useState, type ReactNode } from 'react';
import type { AuthResponse, UserResponse } from '../types/api';
import { clearAuthStorage, getStoredUser, setAuthStorage } from '../utils/authStorage';
import { AuthContext } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(() => getStoredUser());

  function login(auth: AuthResponse) {
    setAuthStorage(auth.user, auth.token);
    setUser(auth.user);
  }

  function logout() {
    clearAuthStorage();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
