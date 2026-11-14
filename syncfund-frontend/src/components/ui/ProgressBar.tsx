import { useId } from 'react';
import { formatCOP } from '../../styles/theme';
import './ProgressBar.css';

/** Desde este porcentaje un presupuesto pasa a "Cerca del límite". */
const WARN_FROM = 80;

interface ProgressBarProps {
  /** Nombre visible de lo que se mide (ej. "Mercado", "Meta de noviembre"). */
  label: string;
  value: number;
  max: number;
  /**
   * budget: presupuesto de categoría (normal, "Cerca del límite" desde 80 %, "Te pasaste" desde 100 %).
   * goal: meta de ahorro (avanza en esmeralda; "Meta cumplida" al llegar al 100 %).
   */
  kind?: 'budget' | 'goal';
  /** Formato de los montos. Por defecto pesos colombianos. */
  format?: (n: number) => string;
}

type Status = 'normal' | 'warn' | 'over' | 'done';

function statusFor(kind: 'budget' | 'goal', percent: number): Status {
  if (kind === 'goal') return percent >= 100 ? 'done' : 'normal';
  if (percent >= 100) return 'over';
  if (percent >= WARN_FROM) return 'warn';
  return 'normal';
}

const STATUS_TEXT: Record<Status, string | null> = {
  normal: null,
  warn: 'Cerca del límite',
  over: 'Te pasaste',
  done: 'Meta cumplida',
};

/**
 * Barra de progreso accesible: el estado se dice en texto (porcentaje y aviso), no solo con
 * el color, y el lector de pantalla recibe el mismo resumen por aria-valuetext.
 */
export function ProgressBar({ label, value, max, kind = 'budget', format = formatCOP }: ProgressBarProps) {
  const labelId = useId();
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  const status = statusFor(kind, percent);
  const statusText = STATUS_TEXT[status];
  const percentText = kind === 'goal' ? `${percent} % de la meta` : `${percent} % usado`;
  const amounts = `${format(value)} de ${format(max)}`;
  // La barra se llena hasta 100 %; el texto dice el porcentaje real (ej. 130 %).
  const fill = Math.min(Math.max(percent, 0), 100);

  return (
    <div className={`sf-progress sf-progress--${status}`}>
      <div className="sf-progress__header">
        <span id={labelId} className="sf-progress__label">{label}</span>
        <span className="sf-progress__amounts tabular-nums">{amounts}</span>
      </div>
      <div
        className="sf-progress__track"
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={fill}
        aria-valuetext={[percentText, amounts, statusText].filter(Boolean).join(', ')}
      >
        <span className="sf-progress__fill" style={{ width: `${fill}%` }} />
      </div>
      <p className="sf-progress__status">
        <span className="tabular-nums">{percentText}</span>
        {statusText && <strong className="sf-progress__alert">{statusText}</strong>}
      </p>
    </div>
  );
}
