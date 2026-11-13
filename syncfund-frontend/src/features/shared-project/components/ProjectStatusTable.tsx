import { Fragment, useState } from 'react';
import { formatCOP } from '../../../styles/theme';
import type { MemberBalance, ProjectBalancesResponse } from '../../../types/api';
import { HALF_CENT } from '../balance';
import { SettleDebtForm } from './SettleDebtForm';
import './ProjectStatusTable.css';

interface Props {
  projectId: number;
  currentUserId: number;
  balances: ProjectBalancesResponse;
  onPaid: () => void;
}

/** El saldo siempre lleva texto, no solo color: "A favor", "Debe" o "Al día". */
function BalanceLabel({ value }: { value: number }) {
  if (value > HALF_CENT) {
    return <span className="status-table__balance amount-gain">A favor {formatCOP(value)}</span>;
  }
  if (value < -HALF_CENT) {
    return <span className="status-table__balance amount-loss">Debe {formatCOP(-value)}</span>;
  }
  return <span className="status-table__balance status-table__balance--even">Al día</span>;
}

function PaymentsNote({ member }: { member: MemberBalance }) {
  const notes = [
    member.paymentsMade > 0 && `Pagó ${formatCOP(member.paymentsMade)}`,
    member.paymentsReceived > 0 && `Recibió ${formatCOP(member.paymentsReceived)}`,
  ].filter(Boolean);
  if (notes.length === 0) return null;
  return <span className="status-table__note">{notes.join(' · ')}</span>;
}

/**
 * "Situación del proyecto": una fila por integrante (DebtCalculator.calculateBalances) y al final
 * el fondo disponible, que es igual a la suma de los saldos. Solo muestra cifras del proyecto.
 * Junto a quien tiene saldo a favor aparece "Pagar", solo si el usuario actual debe.
 */
export function ProjectStatusTable({ projectId, currentUserId, balances, onPaid }: Props) {
  const [payeeId, setPayeeId] = useState<number | null>(null);

  const me = balances.members.find((m) => m.userId === currentUserId);
  const myDebt = me && me.netBalance < -HALF_CENT ? -me.netBalance : 0;
  const nameOf = (userId: number) => balances.members.find((m) => m.userId === userId)?.name ?? 'Integrante';
  const hasUnassigned = Math.abs(balances.unassigned) > HALF_CENT;

  function suggestedAmountFor(payee: MemberBalance): number {
    const suggestion = balances.suggestedPayments.find(
      (p) => p.fromUserId === currentUserId && p.toUserId === payee.userId,
    );
    return suggestion ? suggestion.amount : Math.min(myDebt, payee.netBalance);
  }

  return (
    <section className="status-table" aria-labelledby="status-table-title">
      <h3 id="status-table-title" className="status-table__title">Situación del proyecto</h3>

      <table className="status-table__table">
        <thead>
          <tr>
            <th scope="col">Integrante</th>
            <th scope="col" className="status-table__num">Aportó</th>
            <th scope="col" className="status-table__num">Su parte de los gastos</th>
            <th scope="col" className="status-table__num">Saldo</th>
            <th scope="col"><span className="status-table__sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {balances.members.map((member) => {
            const isMe = member.userId === currentUserId;
            const canPay = myDebt > 0 && !isMe && member.netBalance > HALF_CENT;
            const formOpen = payeeId === member.userId;
            return (
              <Fragment key={member.userId}>
                <tr className={isMe ? 'status-table__row status-table__row--me' : 'status-table__row'}>
                  <th scope="row" className="status-table__name">
                    {member.name}
                    {isMe && <span className="status-table__you"> (tú)</span>}
                  </th>
                  <td className="status-table__num tabular-nums" data-label="Aportó">
                    {formatCOP(member.contributed)}
                  </td>
                  <td className="status-table__num tabular-nums" data-label="Su parte de los gastos">
                    {formatCOP(member.shareOfExpenses)}
                  </td>
                  <td className="status-table__num tabular-nums" data-label="Saldo">
                    <BalanceLabel value={member.netBalance} />
                    <PaymentsNote member={member} />
                  </td>
                  <td className="status-table__action">
                    {canPay && !formOpen && (
                      <button
                        type="button"
                        className="status-table__pay"
                        onClick={() => setPayeeId(member.userId)}
                        aria-label={`Pagarle a ${member.name}`}
                      >
                        Pagar
                      </button>
                    )}
                  </td>
                </tr>
                {canPay && formOpen && (
                  <tr className="status-table__form-row">
                    <td colSpan={5}>
                      <SettleDebtForm
                        projectId={projectId}
                        payerId={currentUserId}
                        debt={myDebt}
                        payee={member}
                        suggestedAmount={suggestedAmountFor(member)}
                        onCancel={() => setPayeeId(null)}
                        onSaved={() => {
                          setPayeeId(null);
                          onPaid();
                        }}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
        <tfoot>
          {hasUnassigned && (
            <tr className="status-table__row status-table__row--total">
              <th scope="row" colSpan={3}>Aportes antiguos sin aportante</th>
              <td className="status-table__num tabular-nums" data-label="Monto">{formatCOP(balances.unassigned)}</td>
              <td />
            </tr>
          )}
          <tr className="status-table__row status-table__row--total">
            <th scope="row" colSpan={3}>
              Fondo disponible
              <span className="status-table__note">
                {hasUnassigned
                  ? 'Suma de los saldos más los aportes sin aportante'
                  : 'Igual a la suma de los saldos de todos los integrantes'}
              </span>
            </th>
            <td className="status-table__num status-table__fund tabular-nums" data-label="Fondo">
              {formatCOP(balances.fund)}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>

      {balances.suggestedPayments.length > 0 && (
        <div className="status-table__suggestions">
          <p className="status-table__suggestions-title">Para quedar al día</p>
          <ul>
            {balances.suggestedPayments.map((p) => (
              <li key={`${p.fromUserId}-${p.toUserId}`}>
                {p.fromUserId === currentUserId ? 'Tú le pagas' : `${nameOf(p.fromUserId)} le paga`}{' '}
                <span className="tabular-nums">{formatCOP(p.amount)}</span> a{' '}
                {p.toUserId === currentUserId ? 'ti' : nameOf(p.toUserId)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
