import axios from 'axios';
import { clearAuthStorage, getStoredToken } from '../utils/authStorage';

/**
 * Cliente HTTP central hacia el backend Spring Boot.
 * Todas las llamadas a la API pasan por aquí (nunca axios suelto en un
 * componente) para tener un solo lugar donde configurar base URL,
 * headers y manejo de errores.
 */
export const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
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
