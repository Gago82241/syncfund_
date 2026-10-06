/**
 * Design tokens de SyncFund.
 *
 * Concepto: "Libro mayor, no dashboard". El color nunca decora:
 * ink = estructura de marca, gain = dinero a favor, loss = dinero en contra.
 * Se exportan también como objeto JS para usarlos en lógica (ej. colorear
 * un monto según su signo), además de existir como CSS custom properties
 * en globals.css para el resto de los estilos.
 */

export const colors = {
  ink900: '#13294B',   // azul tinta profundo — marca, títulos, navegación
  ink700: '#1F3A5F',
  ink600: '#2C5F8A',   // azul acero — estados interactivos/hover
  ink100: '#E4EAF1',   // azul muy claro — fondos de estados activos sutiles

  ledger50: '#F6F4EF', // papel cálido — fondo de página (no blanco puro)
  ledger100: '#EEEAE0',
  paper: '#FFFFFF',    // superficies elevadas puntuales (inputs, modales)

  ink: '#1C1C1A',       // texto principal (casi negro, con calidez)
  inkMuted: '#5B5A54',  // texto secundario
  inkFaint: '#8C8A82',  // texto terciario / placeholders
  hairline: '#DEDAD0',  // líneas divisorias finas

  gain500: '#2F9E7D',  // verde esmeralda apagado — montos positivos
  gain100: '#E1F3EC',

  loss500: '#C65D43',  // terracota quemado — montos negativos/gastos
  loss100: '#F7E6E0',

  warn500: '#C9971F',  // ámbar — alertas de presupuesto (alertExcess)
} as const;

export const typography = {
  display: "'Fraunces', Georgia, 'Times New Roman', serif",
  body: "'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  scale: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.375rem',
    '2xl': '1.75rem',
    '3xl': '2.25rem',
    '4xl': '3rem',
  },
} as const;

export const spacing = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2.5rem',
  '2xl': '4rem',
} as const;

export const radius = {
  sm: '4px',
  md: '8px',
  lg: '14px',
} as const;

/** Formato de pesos colombianos: $1.234.567, sin decimales. */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}
