import { useId, useLayoutEffect, useRef, type ChangeEvent, type InputHTMLAttributes } from 'react';
import { formatAmountInput, parseAmountInput } from '../../utils/money';
import { FieldError } from './FieldError';
import './Input.css';
import './MoneyInput.css';

type NativeProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'inputMode'>;

interface MoneyInputProps extends NativeProps {
  label: string;
  /** Valor crudo, sin puntos de miles: "50000" o, con decimales, "12345.67". */
  value: string;
  onValueChange: (raw: string) => void;
  error?: string;
  hint?: string;
  /** Permite hasta 2 decimales con coma (pagos entre integrantes, que pueden tener centavos). */
  allowDecimals?: boolean;
  /** Frase en vivo con el monto ya leído, ej. (v) => `Vas a aportar ${formatCOP(v)}`. */
  preview?: (amount: number) => string;
  /** Borde según el tipo de movimiento: esmeralda para ingreso, terracota para gasto. */
  tone?: 'gain' | 'loss';
}

/** Cuenta los caracteres que forman el número (cifras y coma) antes de una posición. */
function significantBefore(text: string, position: number): number {
  return text.slice(0, position).replace(/[^\d,]/g, '').length;
}

/** Posición en el texto formateado que deja `count` caracteres significativos a la izquierda. */
function positionAfter(text: string, count: number): number {
  if (count === 0) return 0;
  let seen = 0;
  for (let i = 0; i < text.length; i++) {
    if (/[\d,]/.test(text[i])) seen++;
    if (seen === count) return i + 1;
  }
  return text.length;
}

/**
 * Campo de monto que acepta puntos de miles ("50.000") y los pone mientras se escribe,
 * sin que el cursor salte. Así "50.000" nunca se lee como 50.
 */
export function MoneyInput({
  label,
  value,
  onValueChange,
  error,
  hint,
  allowDecimals = false,
  preview,
  tone,
  id,
  className,
  ...rest
}: MoneyInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const previewId = `${inputId}-preview`;
  const errorId = `${inputId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCaret = useRef<number | null>(null);

  const display = formatAmountInput(value);
  const amount = value === '' ? 0 : Number(value);
  const previewText = preview && amount > 0 ? preview(amount) : undefined;

  // Tras reformatear, devuelve el cursor al mismo punto del número (no al final).
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (pendingCaret.current === null || !input || document.activeElement !== input) return;
    const position = positionAfter(input.value, pendingCaret.current);
    input.setSelectionRange(position, position);
    pendingCaret.current = null;
  });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const typed = input.value;
    const caret = significantBefore(typed, input.selectionStart ?? typed.length);
    const raw = parseAmountInput(typed, allowDecimals);

    if (raw === value) {
      // Nada cambió (una letra, o un punto de miles borrado): React no vuelve a renderizar,
      // pero repone el texto y dejaría el cursor al final. Se coloca después de esa reposición.
      queueMicrotask(() => {
        const position = positionAfter(input.value, caret);
        input.setSelectionRange(position, position);
      });
      return;
    }

    pendingCaret.current = caret;
    onValueChange(raw);
  }

  const describedBy = [hint && hintId, previewText && previewId, error && errorId].filter(Boolean).join(' ');
  const inputClassName = [
    'sf-field__input',
    'sf-money-input__input',
    'tabular-nums',
    tone && `sf-money-input__input--${tone}`,
    error && 'sf-field__input--error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="sf-field">
      <label htmlFor={inputId} className="sf-field__label">{label}</label>
      <div className="sf-money-input">
        <span className="sf-money-input__prefix" aria-hidden="true">$</span>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode={allowDecimals ? 'decimal' : 'numeric'}
          autoComplete="off"
          className={inputClassName}
          value={display}
          onChange={handleChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          {...rest}
        />
      </div>
      {hint && <span id={hintId} className="sf-field__hint">{hint}</span>}
      {previewText && (
        <span id={previewId} className="sf-money-input__preview tabular-nums">{previewText}</span>
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
}
