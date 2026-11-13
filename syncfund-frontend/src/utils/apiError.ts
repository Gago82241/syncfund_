import axios from 'axios';
import type { ApiErrorResponse } from '../types/api';

export interface ParsedApiError {
  fieldErrors: Record<string, string>;
  formError: string;
}

/**
 * Separa los errores que van debajo de un campo del mensaje general del formulario.
 * Los de campos que el formulario no muestra (ej. payerId) van al mensaje general para no perderlos.
 */
export function parseApiError(
  err: unknown,
  fallback: string,
  visibleFields: readonly string[],
): ParsedApiError {
  if (!axios.isAxiosError<ApiErrorResponse>(err)) return { fieldErrors: {}, formError: fallback };
  const data = err.response?.data;
  const fieldErrors: Record<string, string> = {};
  const hiddenMessages: string[] = [];
  for (const [field, message] of Object.entries(data?.errors ?? {})) {
    if (visibleFields.includes(field)) fieldErrors[field] = message;
    else hiddenMessages.push(message);
  }
  if (hiddenMessages.length > 0) return { fieldErrors, formError: hiddenMessages.join('. ') };
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, formError: '' };
  return { fieldErrors, formError: data?.message || fallback };
}

export interface LoadErrorInfo {
  message: string;
  /** false cuando reintentar no cambia nada (no existe o no hay acceso). */
  canRetry: boolean;
}

/** Lo que se cargaba no existe o no es del usuario: reintentar no cambia nada. */
export function notFoundLoadError(what: string): LoadErrorInfo {
  return { message: `No encontramos ${what} o no tienes acceso.`, canRetry: false };
}

/**
 * Error de la recarga que sigue a una acción que el backend ya aceptó (guardar, pagar, aportar…).
 * La página no muestra datos viejos, pero deja claro que la acción sí quedó, para que el usuario
 * no la repita.
 */
export function afterActionLoadError(info: LoadErrorInfo): LoadErrorInfo {
  return { ...info, message: `Tu cambio se guardó. ${info.message}` };
}

/**
 * Mensaje para una carga de datos que falló, sin detalles técnicos.
 * `what` nombra lo que se cargaba, ej. "tus proyectos" o "este proyecto compartido".
 * El 401 no llega a mostrarse: apiClient cierra la sesión y manda al login.
 */
export function describeLoadError(err: unknown, what: string): LoadErrorInfo {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    if (status === undefined) {
      return {
        message: 'No pudimos conectar con SyncFund. Revisa tu conexión e inténtalo de nuevo.',
        canRetry: true,
      };
    }
    if (status === 403 || status === 404) {
      return notFoundLoadError(what);
    }
    if (status >= 500) {
      return {
        message: `No pudimos cargar ${what} en este momento. Inténtalo de nuevo en unos minutos.`,
        canRetry: true,
      };
    }
  }
  return { message: `No pudimos cargar ${what}.`, canRetry: true };
}
