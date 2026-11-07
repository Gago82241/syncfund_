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
