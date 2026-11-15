import { formatCOP } from '../../../styles/theme';
import { formatDate } from '../../../utils/formatDate';
import type { TransactionResponse } from '../../../types/api';
import './TransactionList.css';

interface Props {
  transactions: TransactionResponse[];
  /**
   * Solo en un proyecto: nombres de los integrantes por id, para decir quién aportó, quién pagó
   * y entre cuántos se dividió cada gasto (sale de involvedIdsList). La Billetera no lo pasa.
   */
  memberNames?: ReadonlyMap<number, string>;
}

/**
 * Detalle de un movimiento del proyecto a partir de involvedIdsList. Nunca supone un autor:
 * si el dato no está (aportes antiguos sin aportante) o la persona ya no es integrante, se
 * dice solo qué fue ("Aporte"), sin nombre.
 */
function projectDetail(tx: TransactionResponse, names: ReadonlyMap<number, string>): string | null {
  const ids = tx.involvedIdsList ?? [];
  const firstName = ids.length > 0 ? names.get(ids[0]) : undefined;

  if (tx.type === 'INGRESO') return firstName ? `Aporte de ${firstName}` : 'Aporte';
  if (tx.type === 'ABONO') return firstName ? `Pago de ${firstName}` : null;
  if (tx.type === 'GASTO') {
    if (ids.length === 0) return null;
    if (ids.length === 1) return firstName ? `A cargo de ${firstName}` : 'A cargo de 1 persona';
    // Igual que DebtCalculator.splitBill: monto / participantes; si no es exacta, "≈".
    const share = tx.amount / ids.length;
    const sign = Number.isInteger(share) ? '' : '≈ ';
    return `Entre ${ids.length} · ${sign}${formatCOP(share)} c/u`;
  }
  return null;
}

export function TransactionList({ transactions, memberNames }: Props) {
  if (transactions.length === 0) {
    return <p className="tx-list__empty">Todavía no hay movimientos registrados.</p>;
  }

  return (
    <ul className="tx-list">
      {transactions.map((tx) => {
        const detail = memberNames ? projectDetail(tx, memberNames) : null;
        return (
          <li key={tx.transactionId} className="tx-list__row">
            <div className="tx-list__text">
              <p className="tx-list__description">{tx.description}</p>
              <span className="tx-list__date">
                {formatDate(tx.dateTime)}
                {detail && <span className="tx-list__detail tabular-nums"> · {detail}</span>}
              </span>
            </div>
            {tx.type === 'ABONO' || tx.type === 'COBRO' ? (
              // Pago entre integrantes: va de billetera a billetera y no mueve el fondo, por eso no lleva signo.
              <span className="tabular-nums tx-list__amount tx-list__neutral">
                {formatCOP(tx.amount)}
                <span className="tx-list__neutral-note">Pago entre integrantes</span>
              </span>
            ) : (
              <span className={`tabular-nums tx-list__amount ${tx.type === 'INGRESO' ? 'amount-gain' : 'amount-loss'}`}>
                {tx.type === 'INGRESO' ? '+' : '−'} {formatCOP(tx.amount)}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
