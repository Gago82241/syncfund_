import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion } from '../../../styles/theme';
import { Icon } from '../Icon';
import { ToastContext } from './toastContext';
import './Toast.css';

/** Tiempo visible de cada aviso. */
const DURATION = 4000;
/** Como máximo se ven tres; el más viejo sale primero. */
const MAX_VISIBLE = 3;

interface ToastData {
  id: number;
  message: string;
  leaving: boolean;
}

/**
 * Avisos breves de éxito. La región existe siempre en el DOM con role="status" para que el
 * lector de pantalla anuncie cada aviso nuevo. Cada aviso se va solo a los 4 s; el tiempo se
 * pausa con el cursor encima, con el foco dentro o con la pestaña en segundo plano.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), motion.fast);
  }, []);

  const showToast = useCallback((message: string) => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, message, leaving: false }].slice(-MAX_VISIBLE));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="sf-toast-region" role="status" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const remaining = useRef(DURATION);
  const paused = hovered || focused || hidden;

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Cuenta solo el tiempo sin pausa: al reanudar sigue desde donde iba.
  useEffect(() => {
    if (paused || toast.leaving) return;
    const startedAt = Date.now();
    const timer = window.setTimeout(() => onDismiss(toast.id), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [paused, toast.leaving, toast.id, onDismiss]);

  return (
    <div
      className={`sf-toast${toast.leaving ? ' sf-toast--leaving' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <p className="sf-toast__message">{toast.message}</p>
      <button type="button" className="sf-toast__close" aria-label="Cerrar aviso" onClick={() => onDismiss(toast.id)}>
        <Icon name="cerrar" size="1rem" />
      </button>
    </div>
  );
}
