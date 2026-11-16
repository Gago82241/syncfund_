import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Sheet } from '../../../components/ui/Sheet';
import { formatCOP } from '../../../styles/theme';
import './WalletSheets.css';

interface Props {
  goal: number;
  onEdit: () => void;
}

/** La meta de ahorro mensual. Sin meta (0), en vez de "$ 0", la invitación a definirla. */
export function SavingsGoalSheet({ goal, onEdit }: Props) {
  if (goal <= 0) {
    return (
      <Sheet title="Meta de ahorro">
        <EmptyState
          title="Aún no tienes meta de ahorro"
          description="Define cuánto quieres ahorrar cada mes y te mostramos cómo vas."
          action={<Button variant="ghost" onClick={onEdit}>Definir meta</Button>}
        />
      </Sheet>
    );
  }

  return (
    <Sheet
      title="Meta de ahorro"
      action={
        <button type="button" className="wallet-sheet__action" onClick={onEdit}>
          Editar meta
        </button>
      }
    >
      <dl className="wallet-sheet__row">
        <dt className="wallet-sheet__term">Meta mensual</dt>
        <dd className="wallet-sheet__amount tabular-nums">{formatCOP(goal)}</dd>
      </dl>
    </Sheet>
  );
}
