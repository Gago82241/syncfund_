/**
 * Validadores de formularios: devuelven el mensaje de error o undefined si el valor es válido.
 * Usan los mismos textos que los DTOs del backend, que sigue siendo la validación definitiva.
 */

const WHOLE_AMOUNT_MESSAGE = 'El monto debe ser un número entero, sin decimales';

export function required(value: string, message: string): string | undefined {
  return value.trim() === '' ? message : undefined;
}

/** Deliberadamente permisivo: los casos dudosos los decide @Email en el backend. */
export function email(value: string): string | undefined {
  if (value.trim() === '') return 'El correo es obligatorio';
  return /^[^\s@]+@[^\s@]+$/.test(value.trim()) ? undefined : 'El correo no tiene un formato válido';
}

export function minLength(value: string, min: number, message: string): string | undefined {
  return value.length < min ? message : undefined;
}

/** Monto mayor que cero, sin decimales. */
export function wholeAmount(value: string): string | undefined {
  const amount = Number(value);
  if (value.trim() === '' || !Number.isFinite(amount)) return 'El monto es obligatorio';
  if (amount <= 0) return 'El monto debe ser mayor que cero';
  return Number.isInteger(amount) ? undefined : WHOLE_AMOUNT_MESSAGE;
}

/** Monto que admite cero, sin decimales (metas y límites). */
export function wholeAmountOrZero(
  value: string,
  messages: { required: string; negative: string },
): string | undefined {
  const amount = Number(value);
  if (value.trim() === '' || !Number.isFinite(amount)) return messages.required;
  if (amount < 0) return messages.negative;
  return Number.isInteger(amount) ? undefined : WHOLE_AMOUNT_MESSAGE;
}
