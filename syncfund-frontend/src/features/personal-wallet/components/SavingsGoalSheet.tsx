import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { Sheet } from '../../../components/ui/Sheet';
import { formatCOP } from '../../../styles/theme';
import type { TransactionResponse } from '../../../types/api';
import { currentMonthKey, formatMonthLabel } from '../../../utils/formatDate';
import { personalWalletService } from '../services/personalWalletService';
import { monthSavings, type SavingsLine } from '../walletFigures';
import './WalletLedger.css';
import './WalletSheets.css';

interface Props {
  walletId: number;
  goal: number;
  transactions: TransactionResponse[];
  onEdit: () => void;
}

interface Quota {
  biweekly: number;
  daily: number;
}

/**
 * Cuota que calcula el backend (PersonalWallet.adjustPrivateBudget): meta / 2 por quincena y
 * meta / 30 por día. La semanal no se pide: hoy el backend la devuelve igual a la mensual.
 * Si falla, la línea no aparece y nada más se bloquea: es un dato de apoyo.
 */
function useQuota(walletId: number, goal: number): Quota | null {
  const [quota, setQuota] = useState<{ goal: number; value: Quota } | null>(null);

  useEffect(() => {
    if (goal <= 0) return;
    let active = true;
    Promise.all([
      personalWalletService.adjustPrivateBudget(walletId, 'quincenal'),
      personalWalletService.adjustPrivateBudget(walletId, 'diaria'),
    ])
      .then(([biweekly, daily]) => {
        if (active) setQuota({ goal, value: { biweekly: biweekly.data, daily: daily.data } });
      })
      .catch(() => {
        if (active) setQuota(null);
      });
    return () => {
      active = false;
    };
  }, [walletId, goal]);

  // Una cuota de otra meta (antes de que llegue la nueva) no se muestra.
  return quota && quota.goal === goal ? quota.value : null;
}

/** "noviembre de 2026" → "Noviembre de 2026". */
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function LineTerm({ line, first }: { line: SavingsLine; first: boolean }) {
  // El primer renglón no lleva signo si suma; los demás dicen si suman o restan.
  const adds = line.amount >= 0;
  if (first && adds) return <>{line.label}</>;
  return (
    <>
      <span className="wallet-ledger__op" aria-hidden="true">{adds ? '+' : '−'}</span>
      <span className="visually-hidden">{adds ? 'más ' : 'menos '}</span>
      {line.label}
    </>
  );
}

/**
 * La meta de ahorro mensual y cómo vas este mes.
 * Ahorro del mes = todo lo que entró − todo lo que salió de la billetera en el mes, con la cuenta
 * a la vista. El colchón no cuenta: apartar no es un movimiento.
 */
export function SavingsGoalSheet({ walletId, goal, transactions, onEdit }: Props) {
  const quota = useQuota(walletId, goal);

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

  const monthKey = currentMonthKey();
  const savings = monthSavings(transactions, monthKey);

  return (
    <Sheet
      title="Meta de ahorro"
      action={
        <button type="button" className="wallet-sheet__action" onClick={onEdit}>
          Editar meta
        </button>
      }
    >
      <ProgressBar
        label={capitalize(formatMonthLabel(monthKey))}
        value={Math.max(savings.total, 0)}
        max={goal}
        kind="goal"
      />

      {savings.total < 0 && (
        <p className="wallet-sheet__against">
          Este mes salió <span className="tabular-nums">{formatCOP(-savings.total)}</span> más de lo que entró.
        </p>
      )}

      {savings.lines.length > 0 ? (
        <dl className="wallet-ledger wallet-sheet__ledger">
          {savings.lines.map((line, index) => (
            <div key={line.kind} className="wallet-ledger__item">
              <dt className="wallet-ledger__term">
                <LineTerm line={line} first={index === 0} />
              </dt>
              <dd className="wallet-ledger__amount tabular-nums">{formatCOP(Math.abs(line.amount))}</dd>
            </div>
          ))}
          <div className="wallet-ledger__item wallet-ledger__item--total">
            <dt className="wallet-ledger__term">
              <span className="wallet-ledger__op" aria-hidden="true">=</span>
              <span className="visually-hidden">igual a </span>
              Ahorro del mes
            </dt>
            <dd className="wallet-ledger__amount tabular-nums">
              {savings.total < 0 ? `−${formatCOP(-savings.total)}` : formatCOP(savings.total)}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="wallet-sheet__note">Aún no hay movimientos este mes.</p>
      )}

      <p className="wallet-sheet__note">
        Cuenta todo lo que entró y salió de tu billetera este mes. El colchón no cuenta: no es un movimiento.
      </p>
      {quota && (
        <p className="wallet-sheet__note tabular-nums">
          Para lograrla: {formatCOP(quota.biweekly)} por quincena · {formatCOP(quota.daily)} por día.
        </p>
      )}
    </Sheet>
  );
}
