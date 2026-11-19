import axios from 'axios';
import { clearAuthStorage, getStoredToken, hasStoredSession, markSessionExpired } from '../utils/authStorage';

/**
 * Cliente HTTP central hacia el backend Spring Boot.
 * Todas las llamadas a la API pasan por aquí (nunca axios suelto en un
 * componente) para tener un solo lugar donde configurar base URL,
 * headers y manejo de errores.
 */
// En desarrollo local usa localhost:8080; en producción, Vercel inyecta VITE_API_URL
// apuntando al backend real desplegado en Railway (ver .env.example).
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Adjunta el JWT guardado a cada petición saliente (excepto login/registro, que no lo necesitan). */
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Peticiones de acceso: un 401 ahí es un intento fallido de entrar, no una sesión vencida. */
const AUTH_REQUEST = /\/auth\/(login|register)\/?$/;

/**
 * Si el backend responde 401 (token inválido o vencido), cierra la sesión local y manda al login.
 * El Login dice "Tu sesión venció" solo si de verdad había una sesión guardada (se mira antes de
 * borrarla) y nunca por la respuesta de /auth/login o /auth/register.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadSession = hasStoredSession();
      const isAuthRequest = AUTH_REQUEST.test(error.config?.url ?? '');
      clearAuthStorage();
      if (window.location.pathname !== '/login') {
        if (hadSession && !isAuthRequest) markSessionExpired();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
