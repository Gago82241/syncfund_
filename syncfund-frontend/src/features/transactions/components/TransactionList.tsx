import { formatCOP } from '../../../styles/theme';
import { formatDate } from '../../../utils/formatDate';
import type { TransactionResponse } from '../../../types/api';
import './TransactionList.css';

export function TransactionList({ transactions }: { transactions: TransactionResponse[] }) {
  if (transactions.length === 0) {
    return <p className="tx-list__empty">Todavía no hay movimientos registrados.</p>;
  }

  return (
    <ul className="tx-list">
      {transactions.map((tx) => (
        <li key={tx.transactionId} className="tx-list__row">
          <div>
            <p className="tx-list__description">{tx.description}</p>
            <span className="tx-list__date">{formatDate(tx.dateTime)}</span>
          </div>
          <span className={`tabular-nums ${tx.type === 'INGRESO' ? 'amount-gain' : 'amount-loss'}`}>
            {tx.type === 'INGRESO' ? '+' : '−'} {formatCOP(tx.amount)}
          </span>
        </li>
      ))}
    </ul>
  );
}
