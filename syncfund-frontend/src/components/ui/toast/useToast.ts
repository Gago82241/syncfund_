import { useContext } from 'react';
import { ToastContext, type ToastContextValue } from './toastContext';

/** const { showToast } = useToast(); showToast('Aporte registrado'); */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return context;
}
