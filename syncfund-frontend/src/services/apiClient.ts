import axios from 'axios';
import { clearAuthStorage, getStoredToken } from '../utils/authStorage';

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

/** Si el backend responde 401 (token inválido o vencido), cierra la sesión local y manda al login. */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthStorage();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
