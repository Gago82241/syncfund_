import { createContext } from 'react';

export interface ToastContextValue {
  /** Muestra un aviso breve de éxito (ej. "Gasto registrado") y lo anuncia al lector de pantalla. */
  showToast: (message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
