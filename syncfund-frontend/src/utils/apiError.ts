import axios from 'axios';
import type { ApiErrorResponse } from '../types/api';

/** Prioriza los errores por campo, luego el mensaje general y por último el texto de respaldo. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorResponse>(err)) return fallback;
  const data = err.response?.data;
  const fieldMessages = Object.values(data?.errors ?? {});
  if (fieldMessages.length > 0) return fieldMessages.join('. ');
  return data?.message || fallback;
}
