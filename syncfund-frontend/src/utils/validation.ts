/**
 * Validadores de formularios: devuelven el mensaje de error o undefined si el valor es válido.
 * Usan los mismos textos que los DTOs del backend, que sigue siendo la validación definitiva.
 */

const WHOLE_AMOUNT_MESSAGE = 'El monto debe ser un número entero, sin decimales';
const INVALID_EMAIL_MESSAGE = 'El correo no tiene un formato válido';

export function required(value: string, message: string): string | undefined {
  return value.trim() === '' ? message : undefined;
}

/** Para buscar cuentas existentes: permisivo para no bloquear las antiguas; el resto lo decide @Email. */
export function email(value: string): string | undefined {
  if (value.trim() === '') return 'El correo es obligatorio';
  return /^[^\s@]+@[^\s@]+$/.test(value.trim()) ? undefined : INVALID_EMAIL_MESSAGE;
}

/** Para correos que se crean o se cambian: exige punto en el dominio y terminación de 2 letras o más (EmailFormat en el backend). */
export function newEmail(value: string): string | undefined {
  const error = email(value);
  if (error) return error;
  return /\.[A-Za-z]{2,}$/.test(value.trim()) ? undefined : INVALID_EMAIL_MESSAGE;
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

/**
 * Monto válido (wholeAmount) que además no supera lo disponible.
 * Si aún no se conoce lo disponible (undefined), solo valida el monto: el backend decide.
 */
export function amountWithin(
  value: string,
  available: number | undefined,
  message: string,
): string | undefined {
  const error = wholeAmount(value);
  if (error || available === undefined) return error;
  return Number(value) > available ? message : undefined;
}

/**
 * Monto de un pago entre integrantes: mayor que cero y con máximo 2 decimales, porque una deuda
 * puede tener centavos (un gasto de 100.000 entre 3). Cada límite se revisa en orden y se compara
 * con medio centavo de tolerancia, igual que el backend.
 */
export function paymentAmount(
  value: string,
  limits: { max: number | undefined; message: string }[],
): string | undefined {
  const amount = Number(value);
  if (value.trim() === '' || !Number.isFinite(amount)) return 'El monto es obligatorio';
  if (amount <= 0) return 'El monto debe ser mayor que cero';
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return 'El monto admite máximo 2 decimales';
  return limits.find(({ max }) => max !== undefined && amount > max + 0.005)?.message;
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
