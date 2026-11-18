import { useId } from 'react';
import { formatCOP } from '../../styles/theme';
import { budgetPercent, budgetStatus, budgetUsedPercent } from '../../utils/budget';
import './ProgressBar.css';

interface ProgressBarProps {
  /** Nombre visible de lo que se mide (ej. "Mercado", "Meta de noviembre"). */
  label: string;
  value: number;
  max: number;
  /**
   * budget: presupuesto de categoría ("Cerca del límite" desde 80 %, "Llegaste al límite" justo en
   *         el límite y "Te pasaste" al superarlo), con lo que te queda o cuánto te pasaste.
   * goal: meta de ahorro (avanza en esmeralda; "Meta cumplida" al llegar al 100 %).
   */
  kind?: 'budget' | 'goal';
  /** Formato de los montos. Por defecto pesos colombianos. */
  format?: (n: number) => string;
}

type Status = 'normal' | 'warn' | 'limit' | 'over' | 'done';

/**
 * Barra de progreso accesible: el estado se dice en texto (porcentaje y aviso), no solo con
 * el color, y el lector de pantalla recibe el mismo resumen por aria-valuetext.
 */
export function ProgressBar({ label, value, max, kind = 'budget', format = formatCOP }: ProgressBarProps) {
  const labelId = useId();
  const isBudget = kind === 'budget';
  const percent = isBudget ? budgetUsedPercent(value, max) : budgetPercent(value, max);
  const status: Status = isBudget ? budgetStatus(value, max) : percent >= 100 ? 'done' : 'normal';

  let alert: string | null = null;
  let detail: string | null = null;
  if (isBudget) {
    if (status === 'over') alert = `Te pasaste por ${format(value - max)}`;
    else {
      if (status === 'warn') alert = 'Cerca del límite';
      if (status === 'limit') alert = 'Llegaste al límite';
      if (max > 0) detail = `Te quedan ${format(Math.max(max - value, 0))}`;
    }
  } else if (status === 'done') {
    alert = 'Meta cumplida';
  }

  const percentText = isBudget ? `${percent} % usado` : `${percent} % de la meta`;
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
        aria-valuetext={[percentText, amounts, alert, detail].filter(Boolean).join(', ')}
      >
        <span className="sf-progress__fill" style={{ width: `${fill}%` }} />
      </div>
      <p className="sf-progress__status">
        <span className="sf-progress__state">
          <span className="tabular-nums">{percentText}</span>
          {alert && <strong className="sf-progress__alert tabular-nums">{alert}</strong>}
        </span>
        {detail && <span className="sf-progress__detail tabular-nums">{detail}</span>}
      </p>
    </div>
  );
}
