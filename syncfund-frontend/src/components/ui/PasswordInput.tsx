import { useId, useState, type InputHTMLAttributes } from 'react';
import { FieldError } from './FieldError';
import './Input.css';
import './PasswordInput.css';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  hint?: string;
}

/**
 * Campo de contraseña con botón "Mostrar" / "Ocultar", para revisar lo escrito en el celular.
 * Pasa autoComplete ("current-password" o "new-password") para que el gestor de contraseñas complete.
 */
export function PasswordInput({ label, error, hint, id, className, ...rest }: PasswordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const [visible, setVisible] = useState(false);

  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ');
  const inputClassName = ['sf-field__input', 'sf-password__input', error && 'sf-field__input--error', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="sf-field">
      <label htmlFor={inputId} className="sf-field__label">{label}</label>
      <div className="sf-password">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={inputClassName}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          {...rest}
        />
        <button
          type="button"
          className="sf-password__toggle"
          aria-controls={inputId}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      {hint && <span id={hintId} className="sf-field__hint">{hint}</span>}
      <FieldError id={errorId} message={error} />
    </div>
  );
}
