/**
 * Conversión entre lo que se ve en un campo de monto ("50.000" o "12.345,67", formato es-CO)
 * y el valor crudo que usan los formularios y los validadores ("50000" o "12345.67").
 */

/** Hasta 15 cifras enteras: por encima, un número de JavaScript pierde precisión. */
const MAX_INTEGER_DIGITS = 15;

/**
 * Del texto escrito al valor crudo. Los puntos son separadores de miles y se ignoran;
 * con decimales, la primera coma es el separador decimal (máximo 2 cifras).
 */
export function parseAmountInput(display: string, allowDecimals = false): string {
  const allowed = allowDecimals ? display.replace(/[^\d,]/g, '') : display.replace(/\D/g, '');
  const [rawInteger, ...rest] = allowed.split(',');
  const integer = rawInteger.replace(/^0+(?=\d)/, '').slice(0, MAX_INTEGER_DIGITS);

  if (!allowDecimals || rest.length === 0) return integer;

  const decimals = rest.join('').slice(0, 2);
  return `${integer || '0'}.${decimals}`;
}

/** Del valor crudo al texto con puntos de miles y coma decimal. */
export function formatAmountInput(raw: string): string {
  if (raw === '') return '';
  const [integer, decimals] = raw.split('.');
  const withThousands = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return decimals === undefined ? withThousands : `${withThousands},${decimals}`;
}
