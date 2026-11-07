import { useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormError } from '../../../components/ui/FormError';
import { personalWalletService } from '../services/personalWalletService';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { wholeAmountOrZero } from '../../../utils/validation';

interface Props {
  walletId: number;
  currentGoal: number;
  onSaved: () => void;
}

/** PersonalWallet.adjustPrivateBudget() parte de la meta (monthlySavingsGoal). */
export function SavingsGoalForm({ walletId, currentGoal, onSaved }: Props) {
  const [goal, setGoal] = useState(String(currentGoal));
  const [loading, setLoading] = useState(false);
  const { fieldErrors, formError, formRef, validate, showApiError, clearField } =
    useFormErrors(['monthlySavingsGoal']);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = validate({
      monthlySavingsGoal: wholeAmountOrZero(goal, {
        required: 'La meta de ahorro es obligatoria; usa 0 si no quieres definirla',
        negative: 'La meta de ahorro no puede ser negativa',
      }),
    });
    if (!valid) return;
    setLoading(true);
    try {
      await personalWalletService.setSavingsGoal(walletId, { monthlySavingsGoal: Number(goal) });
      onSaved();
    } catch (err) {
      showApiError(err, 'No se pudo actualizar la meta de ahorro.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Meta de ahorro mensual</h3>
      <Input
        label="Monto (COP)"
        type="number"
        name="monthlySavingsGoal"
        min="0"
        placeholder="Ej: 200000 (sin puntos)"
        value={goal}
        error={fieldErrors.monthlySavingsGoal}
        onChange={(e) => {
          setGoal(e.target.value);
          clearField('monthlySavingsGoal');
        }}
        required
      />
      <FormError message={formError} />
      <Button type="submit" variant="ghost" loading={loading}>Actualizar meta</Button>
    </form>
  );
}
