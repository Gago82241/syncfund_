import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  loading?: boolean;
}

export function Button({ variant = 'primary', loading, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={`sf-button sf-button--${variant}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? 'Procesando...' : children}
    </button>
  );
}
