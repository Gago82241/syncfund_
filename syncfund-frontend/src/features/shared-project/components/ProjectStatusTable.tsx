import { formatCOP } from '../../../styles/theme';
import type { MemberBalance, ProjectBalancesResponse } from '../../../types/api';
import { HALF_CENT } from '../balance';
import { payableMember } from '../payment';
import './ProjectStatusTable.css';

/** Con más pagos sugeridos que estos, la lista del grupo se pliega. */
const FOLD_AFTER = 3;

interface Props {
  currentUserId: number;
  balances: ProjectBalancesResponse;
  /** "Pagar" en la fila de quien tiene saldo a favor: abre el panel de pago. */
  onPay: (payee: MemberBalance) => void;
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
 * Junto a quien tiene saldo a favor aparece "Pagar", solo si el usuario actual debe; el pago se
 * hace en un panel (SettleDebtForm), con revisión antes de mover el dinero.
 */
export function ProjectStatusTable({ currentUserId, balances, onPay }: Props) {
  const nameOf = (userId: number) => balances.members.find((m) => m.userId === userId)?.name ?? 'Integrante';
  const hasUnassigned = Math.abs(balances.unassigned) > HALF_CENT;
  // Tus propios pagos ya están en la línea "Para quedar al día… Pagar" del encabezado: aquí no se repiten.
  const others = balances.suggestedPayments.filter((p) => p.fromUserId !== currentUserId);
  const suggestionList = (
    <ul>
      {others.map((p) => (
        <li key={`${p.fromUserId}-${p.toUserId}`}>
          {nameOf(p.fromUserId)} le paga <span className="tabular-nums">{formatCOP(p.amount)}</span> a{' '}
          {p.toUserId === currentUserId ? 'ti' : nameOf(p.toUserId)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="status-table">
      <table className="status-table__table">
        {/* La pestaña "Situación" ya titula el panel; el caption nombra la tabla para el lector. */}
        <caption className="visually-hidden">Situación del proyecto por integrante</caption>
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
            const canPay = payableMember(balances, currentUserId, member.userId) !== null;
            return (
              <tr key={member.userId} className={isMe ? 'status-table__row status-table__row--me' : 'status-table__row'}>
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
                  {canPay && (
                    <button
                      type="button"
                      className="status-table__pay"
                      onClick={() => onPay(member)}
                      aria-label={`Pagarle a ${member.name}`}
                    >
                      Pagar
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          {hasUnassigned && (
            <tr className="status-table__row status-table__row--total">
              <th scope="row" colSpan={3}>Aportes sin aportante</th>
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

      {others.length > 0 && (
        <div className="status-table__suggestions">
          <h2 className="status-table__suggestions-title">Para quedar al día</h2>
          {others.length > FOLD_AFTER ? (
            <details className="status-table__fold">
              <summary>Ver los {others.length} pagos sugeridos entre integrantes</summary>
              {suggestionList}
            </details>
          ) : (
            suggestionList
          )}
        </div>
      )}
    </div>
  );
}
