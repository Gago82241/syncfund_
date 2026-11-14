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
  ink950: '#0B1A33',   // presionado del botón principal
  ink900: '#13294B',   // azul tinta profundo — marca, títulos, navegación
  ink700: '#1F3A5F',
  ink600: '#2C5F8A',   // azul acero — estados interactivos/hover
  ink100: '#E4EAF1',   // azul muy claro — fondos de estados activos sutiles

  ledger50: '#F6F4EF', // papel cálido — fondo de página (no blanco puro)
  ledger100: '#EEEAE0',
  paper: '#FFFFFF',    // superficies elevadas puntuales (inputs, modales)

  ink: '#1C1C1A',       // texto principal (casi negro, con calidez)
  inkMuted: '#5B5A54',  // texto secundario
  inkFaint: '#6A6860',  // fechas y metadatos — 5.1:1 sobre papel, 4.6:1 sobre ink100
  hairline: '#DEDAD0',  // líneas divisorias finas
  fieldBorder: '#8F8B80', // borde de campos — 3.4:1 sobre blanco (controles: 3:1)

  gain700: '#1E7259',  // texto de montos a favor e ingresos (5.3:1)
  gain500: '#2F9E7D',  // esmeralda apagado — solo bordes y rellenos
  gain100: '#E1F3EC',

  loss800: '#8A3823',  // presionado del botón de peligro
  loss700: '#A8452D',  // texto de montos en contra, gastos y errores (5.4:1)
  loss500: '#C65D43',  // terracota quemado — solo bordes y rellenos
  loss100: '#F7E6E0',

  warn700: '#86620F',  // texto "Cerca del límite" (5.1:1)
  warn500: '#C9971F',  // ámbar — solo el relleno de la barra de presupuesto

  scrim: 'rgb(19 41 75 / 0.4)', // velo azul tinta detrás de paneles
} as const;

export const typography = {
  display: "'Fraunces', Georgia, 'Times New Roman', serif",
  body: "'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  /** Escala por rol; display es fluida (2rem en el celular → 2.75rem en escritorio). */
  scale: {
    display: 'clamp(2rem, 1.6rem + 1.6vw, 2.75rem)',
    headline: 'clamp(1.5rem, 1.3rem + 0.8vw, 2rem)',
    title: '1.125rem',
    body: '1rem',
    small: '0.9375rem',
    label: '0.8125rem',
  },
  leading: {
    tight: 1.15,
    body: 1.55,
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

/** Única sombra: paneles laterales, hojas inferiores y menús. */
export const shadow = {
  float: '0 12px 32px -8px rgb(19 41 75 / 0.28), 0 2px 6px rgb(19 41 75 / 0.12)',
} as const;

export const motion = {
  /** Respuesta al toque y al pasar el cursor. */
  fast: 150,
  /** Abrir y cerrar paneles. */
  panel: 200,
  easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
} as const;

/**
 * Puntos de quiebre en px. Las media queries de CSS no pueden leer variables,
 * así que el valor se escribe en cada @media y se documenta aquí.
 */
export const breakpoints = {
  desktop: 1024,
} as const;

/** Área táctil mínima en px. */
export const tapTarget = 44;

/** Estructura de la app con sesión (en px). */
export const layout = {
  /** Ancho del menú lateral (desde breakpoints.desktop). */
  sidebarWidth: 240,
  /** Alto de la barra inferior del celular, sin el área segura. */
  navBarHeight: 56,
  /** Ancho máximo del contenido. */
  contentMax: 1200,
  /** Franja de la acción principal fija en el celular: 44 + 2 × 12 + 1 de línea. */
  actionBarHeight: 69,
} as const;

/** Capas: la navegación y el menú de cuenta van debajo de los avisos. */
export const zIndex = {
  nav: 50,
  menu: 60,
  toast: 100,
} as const;

/** Formato de pesos colombianos: $1.234.567, sin decimales. */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}
