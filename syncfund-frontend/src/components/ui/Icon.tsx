import type { ReactNode } from 'react';
import './Icon.css';

/**
 * Íconos dibujados en SVG propio (sin librería), con trazo fino de 1.5 en el color del texto,
 * coherentes con el estilo de libro mayor. Retícula de 24 × 24.
 */
const PATHS = {
  // Hoja de libro mayor con renglones y el doble filete del total.
  resumen: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M8.5 7.5h7M8.5 11h7M8.5 15.5h7M8.5 17.5h7" />
    </>
  ),
  billetera: (
    <>
      <path d="M5 7.5 15.5 4l1.2 3.5" />
      <rect x="3" y="7.5" width="18" height="12" rx="1.5" />
      <path d="M21 11.5h-4a2 2 0 0 0 0 4h4" />
    </>
  ),
  // Dos círculos entrelazados: el motivo de la marca (lo personal y lo compartido).
  proyectos: (
    <>
      <circle cx="9" cy="12" r="5.5" />
      <circle cx="15" cy="12" r="5.5" />
    </>
  ),
  categorias: (
    <>
      <path d="M4 4h7.5l8.5 8.5-7.5 7.5L4 11.5z" />
      <circle cx="8.5" cy="8.5" r="1.25" />
    </>
  ),
  agregar: <path d="M12 5v14M5 12h14" />,
  cerrar: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  flecha: <path d="M5 12h14M13 6l6 6-6 6" />,
  cuenta: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c1-3.5 3.8-5.5 7-5.5s6 2 7 5.5" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  /** Tamaño CSS (ancho y alto). Por defecto 1.25rem. */
  size?: string;
  /**
   * Texto para lectores de pantalla. Solo si el ícono va sin texto visible al lado;
   * si no se pasa, el ícono es decorativo y queda oculto (aria-hidden).
   */
  label?: string;
  className?: string;
}

export function Icon({ name, size = '1.25rem', label, className }: IconProps) {
  const accessibility = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true as const, focusable: 'false' as const };

  return (
    <svg
      className={['sf-icon', className].filter(Boolean).join(' ')}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...accessibility}
    >
      {PATHS[name]}
    </svg>
  );
}
