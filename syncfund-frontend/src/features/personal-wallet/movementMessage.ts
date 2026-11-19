import { formatCOP } from '../../styles/theme';
import type { SavedMovement } from './components/TransactionForm';

/** Aviso al registrar un movimiento: dice qué quedó y por cuánto ("Gasto de $ 2.000 registrado"). */
export function savedMovementMessage({ type, amount }: SavedMovement): string {
  return `${type === 'GASTO' ? 'Gasto' : 'Ingreso'} de ${formatCOP(amount)} registrado`;
}
