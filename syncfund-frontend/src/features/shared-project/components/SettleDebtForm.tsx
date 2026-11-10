import { useRef, useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormError } from '../../../components/ui/FormError';
import { sharedProjectService } from '../services/sharedProjectService';
import { usePersonalWallet } from '../../personal-wallet/hooks/usePersonalWallet';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { paymentAmount } from '../../../utils/validation';
import { formatCOP } from '../../../styles/theme';
import type { MemberBalance } from '../../../types/api';

interface Props {
  projectId: number;
  payerId: number;
  /** Lo que debe el usuario actual (positivo). */
  debt: number;
  payee: MemberBalance;
  suggestedAmount: number;
  onCancel: () => void;
  onSaved: () => void;
}

/** Monto para el campo: sin decimales si es entero, con 2 si tiene centavos. */
function toInputValue(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

/**
 * SharedProject.settleDebts(payerId, payeeId, amount): el usuario actual le paga a un integrante
 * con saldo a favor. Sale de su billetera personal y entra en la del otro; el fondo no cambia.
 * El botón se deshabilita mientras se envía para evitar pagos duplicados por doble clic.
 */
export function SettleDebtForm({ projectId, payerId, debt, payee, suggestedAmount, onCancel, onSaved }: Props) {
  const [amount, setAmount] = useState(() => toInputValue(suggestedAmount));
  const [loading, setLoading] = useState(false);
  const sending = useRef(false);
  const { wallet, refresh: refreshWallet } = usePersonalWallet(payerId);
  const { fieldErrors, formError, formRef, validate, showApiError, clearField } = useFormErrors(['amount']);

  const available = wallet?.currentBalance;
  const hint =
    available === undefined
      ? 'Sale de tu billetera personal; el fondo del proyecto no cambia.'
      : `Sale de tu billetera personal (disponible: ${formatCOP(available)}); el fondo no cambia.`;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // El estado "loading" tarda un render en deshabilitar el botón: la referencia bloquea al instante.
    if (sending.current) return;
    const error = paymentAmount(amount, [
      { max: debt, message: `El monto supera lo que debes (${formatCOP(debt)}).` },
      { max: payee.netBalance, message: `El monto supera el saldo a favor de ${payee.name} (${formatCOP(payee.netBalance)}).` },
      { max: available, message: 'Saldo insuficiente en tu billetera personal para este pago.' },
    ]);
    if (!validate({ amount: error })) return;

    sending.current = true;
    setLoading(true);
    try {
      await sharedProjectService.settle(projectId, { payerId, payeeId: payee.userId, amount: Number(amount) });
      refreshWallet();
      onSaved();
    } catch (err) {
      showApiError(err, 'No se pudo registrar el pago.');
    } finally {
      sending.current = false;
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="settle-form">
      <p className="settle-form__title">Pagarle a {payee.name}</p>
      <Input
        label="Monto (COP)"
        type="number"
        name="amount"
        min="0.01"
        step="0.01"
        value={amount}
        hint={hint}
        error={fieldErrors.amount}
        onChange={(e) => {
          setAmount(e.target.value);
          clearField('amount');
        }}
        required
      />
      <FormError message={formError} />
      <div className="settle-form__actions">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>Cancelar</Button>
        <Button type="submit" loading={loading}>Pagar</Button>
      </div>
    </form>
  );
}
