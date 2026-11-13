export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

/**
 * Mes actual como "yyyy-MM" según la hora local del navegador.
 * No usar toISOString(): da el mes en UTC, y en Colombia (UTC−5) desde las 7:00 p. m. del
 * último día del mes ya sería el mes siguiente.
 */
export function currentMonthKey(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
}

/** "2026-11" → "noviembre de 2026". */
export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  );
}
