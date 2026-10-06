import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AuthResponse, UserResponse } from '../types/api';
import { clearAuthStorage, getStoredUser, setAuthStorage } from '../utils/authStorage';

interface AuthContextValue {
  user: UserResponse | null;
  login: (auth: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
