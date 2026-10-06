import type { InputHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  return (
    <div className="sf-field">
      <label htmlFor={inputId} className="sf-field__label">{label}</label>
      <input id={inputId} className="sf-field__input" {...rest} />
      {error && <span className="sf-field__error">{error}</span>}
    </div>
  );
}
