import { HALF_CENT } from '../../features/shared-project/balance';
import { formatCOP } from '../../styles/theme';
import './MoneyStatus.css';

interface MoneyStatusProps {
  /** Saldo neto: positivo = a favor, negativo = en contra. */
  amount: number;
  /**
   * you: habla al usuario ("Te deben", "Debes").
   * other: describe a otro integrante ("A favor", "Debe"), como en la tabla de situación.
   */
  subject?: 'you' | 'other';
}

/**
 * Estado de un saldo con su monto. Siempre en texto, nunca solo con color.
 * Menos de medio centavo cuenta como "Al día" (mismo criterio que el backend y la tabla).
 */
export function MoneyStatus({ amount, subject = 'you' }: MoneyStatusProps) {
  if (Math.abs(amount) < HALF_CENT) {
    return <span className="sf-money-status sf-money-status--even">Al día</span>;
  }

  const inFavor = amount > 0;
  const label = subject === 'you' ? (inFavor ? 'Te deben' : 'Debes') : inFavor ? 'A favor' : 'Debe';

  return (
    <span className={`sf-money-status sf-money-status--${inFavor ? 'gain' : 'loss'}`}>
      {label} <span className="tabular-nums">{formatCOP(Math.abs(amount))}</span>
    </span>
  );
}
