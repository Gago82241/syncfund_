import { useId, type InputHTMLAttributes } from 'react';
import { FieldError } from './FieldError';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Texto de ayuda bajo el campo (ej. el saldo disponible). */
  hint?: string;
}

export function Input({ label, error, hint, id, className, ...rest }: InputProps) {
  // Una misma página puede tener dos campos con el mismo name (ej. dos "amount").
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ');
  const inputClassName = ['sf-field__input', error && 'sf-field__input--error', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="sf-field">
      <label htmlFor={inputId} className="sf-field__label">{label}</label>
      <input
        id={inputId}
        className={inputClassName}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...rest}
      />
      {hint && <span id={hintId} className="sf-field__hint">{hint}</span>}
      <FieldError id={errorId} message={error} />
    </div>
  );
}
