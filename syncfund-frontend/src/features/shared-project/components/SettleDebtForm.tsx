import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MoneyInput } from '../../../components/ui/MoneyInput';
import { Button } from '../../../components/ui/Button';
import { FormError } from '../../../components/ui/FormError';
import { sharedProjectService } from '../services/sharedProjectService';
import { usePersonalWallet } from '../../personal-wallet/hooks/usePersonalWallet';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { paymentAmount } from '../../../utils/validation';
import { formatCOP, formatCOPExact } from '../../../styles/theme';
import { HALF_CENT } from '../balance';
import { debtOf } from '../payment';
import type { MemberBalance, ProjectBalancesResponse } from '../../../types/api';
import './ProjectForms.css';

interface Props {
  projectId: number;
  payerId: number;
  /** Lo que debe el usuario actual (positivo), al abrir el panel. */
  debt: number;
  payee: MemberBalance;
  suggestedAmount: number;
  /** El backend aceptó el pago: la página recarga sus datos detrás del aviso de cierre. */
  onPaid: () => void;
  /** "Listo" en el aviso de cierre. */
  onFinish: () => void;
  /** Avisa el paso actual: el panel cambia su título y su descripción según el paso. */
  onStepChange?: (step: PayStep) => void;
}

export type PayStep = 'amount' | 'review' | 'done';
type Step = PayStep;

/** Monto como en la página (sin centavos) y, si los tiene, también exacto. */
function withExact(amount: number): string {
  const rounded = formatCOP(amount);
  const exact = formatCOPExact(amount);
  return rounded === exact || Math.round(amount * 100) % 100 === 0 ? rounded : `${rounded} (exactos ${exact})`;
}

/** Monto para el campo: sin decimales si es entero, con 2 si tiene centavos. */
function toInputValue(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

/**
 * Cierre con la situación que devolvió el backend (no una cuenta del frontend): un titular que
 * dice cómo quedaste y un renglón con el monto pagado.
 */
function closingMessage(
  amount: number,
  payee: MemberBalance,
  after: ProjectBalancesResponse,
  payerId: number,
): { headline: string; detail: string; settled: boolean } {
  const paid = `Le pagaste ${formatCOPExact(amount)} a ${payee.name}.`;
  if (!after.members.some((m) => m.userId === payerId)) {
    return { headline: `Le pagaste a ${payee.name}`, detail: paid, settled: false };
  }
  const stillOwes = debtOf(after, payerId);
  return stillOwes > 0
    ? {
        headline: `Le pagaste a ${payee.name}`,
        detail: `${paid} Aún debes ${formatCOPExact(stillOwes)} en este proyecto.`,
        settled: false,
      }
    : { headline: `Quedaste al día con ${payee.name}`, detail: paid, settled: true };
}

/**
 * SharedProject.settleDebts(payerId, payeeId, amount) en tres pasos dentro de un Panel:
 * monto (con el sugerido ya puesto), revisión (de qué billetera a cuál; el fondo no cambia)
 * y aviso de cierre. El dinero solo se mueve al confirmar en la revisión.
 */
export function SettleDebtForm({
  projectId,
  payerId,
  debt,
  payee,
  suggestedAmount,
  onPaid,
  onFinish,
  onStepChange,
}: Props) {
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState(() => toInputValue(suggestedAmount));
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState<ReturnType<typeof closingMessage> | null>(null);
  const sending = useRef(false);
  const reviewTitleRef = useRef<HTMLHeadingElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef<Step>(step);
  const { wallet } = usePersonalWallet(payerId);
  const { fieldErrors, formError, formRef, validate, showApiError, clearField } = useFormErrors(['amount']);

  const available = wallet?.currentBalance;
  const limits = [
    { max: debt, message: `Supera lo que debes (${formatCOPExact(debt)}).` },
    { max: payee.netBalance, message: `Supera el saldo a favor de ${payee.name} (${formatCOPExact(payee.netBalance)}).` },
    { max: available, message: `Tu billetera tiene ${formatCOPExact(available ?? 0)}; no alcanza para este pago.` },
  ];
  // Aviso en vivo: los límites se revisan mientras se escribe, no solo al pulsar "Revisar pago".
  const liveError = amount === '' ? undefined : paymentAmount(amount, limits);
  const amountError = fieldErrors.amount ?? liveError;
  const value = Number(amount);
  const remaining = debt - value;

  // El foco sigue al paso: título de la revisión, aviso de cierre, o el monto al volver.
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    onStepChange?.(step);
    if (step === 'review') reviewTitleRef.current?.focus();
    if (step === 'done') doneRef.current?.focus();
    if (step === 'amount') formRef.current?.querySelector<HTMLInputElement>('input[name="amount"]')?.focus();
  }, [step, formRef, onStepChange]);

  function handleReview(e: FormEvent) {
    e.preventDefault();
    if (!validate({ amount: paymentAmount(amount, limits) })) return;
    setStep('review');
  }

  async function handleConfirm() {
    // El estado "loading" tarda un render en deshabilitar el botón: la referencia bloquea al instante.
    if (sending.current) return;
    sending.current = true;
    setLoading(true);
    try {
      const { data } = await sharedProjectService.settle(projectId, {
        payerId,
        payeeId: payee.userId,
        amount: value,
      });
      setClosing(closingMessage(value, payee, data, payerId));
      setStep('done');
      onPaid();
    } catch (err) {
      showApiError(err, 'No se pudo registrar el pago.');
    } finally {
      sending.current = false;
      setLoading(false);
    }
  }

  if (step === 'done' && closing) {
    // Sin role="status": el titular recibe el foco y se lee una sola vez.
    return (
      <div className="settle-done">
        <h3
          ref={doneRef}
          tabIndex={-1}
          className={`settle-done__title sf-enter${closing.settled ? ' settle-done__title--settled' : ''}`}
        >
          {closing.headline}
        </h3>
        <p className="settle-done__message tabular-nums">{closing.detail}</p>
        <Button onClick={onFinish}>Listo</Button>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="settle-review">
        <h3 ref={reviewTitleRef} className="settle-review__title" tabIndex={-1}>
          Revisa el pago
        </h3>
        <p className="settle-review__lead">
          Vas a pagarle <strong className="tabular-nums">{formatCOPExact(value)}</strong> a {payee.name}.
        </p>
        <dl className="settle-review__ledger">
          <div className="settle-review__row">
            <dt>Sale de</dt>
            <dd>
              Tu billetera
              {available !== undefined && (
                <span className="settle-review__note tabular-nums">Disponible {formatCOPExact(available)}</span>
              )}
            </dd>
          </div>
          <div className="settle-review__row">
            <dt>Llega a</dt>
            <dd>La billetera de {payee.name}</dd>
          </div>
          <div className="settle-review__row">
            <dt>Fondo del proyecto</dt>
            <dd>No cambia</dd>
          </div>
          <div className="settle-review__row settle-review__row--total">
            <dt>Después del pago</dt>
            <dd className="tabular-nums">
              {remaining < HALF_CENT ? 'Quedas al día' : `Aún debes ${formatCOPExact(remaining)}`}
            </dd>
          </div>
        </dl>
        {/* Un error del backend sobre el monto también se ve aquí, sin volver al paso anterior. */}
        <FormError message={formError || fieldErrors.amount} />
        <div className="settle-review__actions">
          <Button variant="ghost" onClick={() => setStep('amount')} disabled={loading}>
            Volver
          </Button>
          <Button onClick={handleConfirm} loading={loading}>
            Confirmar pago
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleReview} noValidate className="project-form">
      <p className="project-form__note">
        Debes <strong className="tabular-nums">{withExact(debt)}</strong> en el proyecto.
        {available !== undefined && (
          <>
            {' '}
            Disponible en tu billetera: <strong className="tabular-nums">{formatCOP(available)}</strong>
          </>
        )}
      </p>
      <MoneyInput
        label="Monto"
        name="amount"
        allowDecimals
        value={amount}
        onValueChange={(raw) => {
          setAmount(raw);
          clearField('amount');
        }}
        hint="Viene con el monto sugerido para quedar al día. Admite centavos con coma."
        preview={liveError ? undefined : (v) => `Vas a pagarle ${formatCOPExact(v)} a ${payee.name}`}
        error={amountError}
        required
        data-autofocus
      />
      <Button type="submit">Revisar pago</Button>
    </form>
  );
}
