import { Button } from '../../../components/ui/Button';
import { formatCOP } from '../../../styles/theme';
import type { MemberBalance } from '../../../types/api';
import type { PaymentOption } from '../payment';
import './ProjectActions.css';

interface Props {
  /** Pagos sugeridos para que el usuario quede al día; vacío si no debe. */
  payments: PaymentOption[];
  onPay: (payee: MemberBalance) => void;
  onContribute: () => void;
}

/**
 * Fila de acciones bajo el encabezado del proyecto. "Registrar gasto" es la acción principal
 * (en el encabezado, fija en el celular); aquí van las secundarias. Si el usuario debe, primero
 * dice a quién pagarle y cuánto, con "Pagar" al lado: es la otra mitad de "¿cómo estoy?".
 */
export function ProjectActions({ payments, onPay, onContribute }: Props) {
  return (
    <div className="project-actions">
      {payments.length > 0 && (
        <ul className="project-actions__payments">
          {payments.map(({ payee, amount }) => (
            <li key={payee.userId} className="project-actions__payment">
              <p className="project-actions__payment-text">
                Para quedar al día, le pagas{' '}
                <strong className="tabular-nums">{formatCOP(amount)}</strong> a {payee.name}.
              </p>
              <Button
                variant="ghost"
                onClick={() => onPay(payee)}
                aria-label={`Pagarle ${formatCOP(amount)} a ${payee.name}`}
              >
                Pagar
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="project-actions__buttons">
        <Button variant="ghost" onClick={onContribute}>
          Aportar al fondo
        </Button>
      </div>
    </div>
  );
}
