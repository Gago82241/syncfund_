import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** danger: acciones destructivas (eliminar, salir), en terracota. */
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
  /** Texto mientras envía, con la acción en curso (ej. "Entrando…"). */
  loadingText?: string;
}

export function Button({ variant = 'primary', loading, loadingText = 'Procesando...', children, disabled, className, ...rest }: ButtonProps) {
  return (
    <button
      className={['sf-button', `sf-button--${variant}`, className].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? loadingText : children}
    </button>
  );
}
