import type { UserResponse } from '../types/api';

const USER_KEY = 'syncfund.user';
const TOKEN_KEY = 'syncfund.token';

export function getStoredUser(): UserResponse | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as UserResponse) : null;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthStorage(user: UserResponse, token: string): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
}

/** Hay una sesión guardada (token o usuario), aunque el backend ya no la acepte. */
export function hasStoredSession(): boolean {
  return localStorage.getItem(TOKEN_KEY) !== null || localStorage.getItem(USER_KEY) !== null;
}

/*
 * Aviso de sesión vencida: el cliente HTTP lo marca al cerrar una sesión que el backend rechazó
 * (401) y el Login lo muestra una vez. sessionStorage: dura solo en esta pestaña. Puede no estar
 * disponible (navegación privada estricta); entonces simplemente no hay aviso.
 */
const SESSION_EXPIRED_KEY = 'sf-session-expired';

export function markSessionExpired(): void {
  try {
    sessionStorage.setItem(SESSION_EXPIRED_KEY, '1');
  } catch {
    // Sin almacenamiento de sesión: se entra al Login sin el aviso.
  }
}

export function isSessionExpiredMarked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_EXPIRED_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearSessionExpired(): void {
  try {
    sessionStorage.removeItem(SESSION_EXPIRED_KEY);
  } catch {
    // Nada que borrar.
  }
}

export function clearAuthStorage(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}
