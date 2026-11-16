import { useState, type FormEvent } from 'react';
import { MoneyInput } from '../../../components/ui/MoneyInput';
import { Button } from '../../../components/ui/Button';
import { FormError } from '../../../components/ui/FormError';
import { personalWalletService } from '../services/personalWalletService';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { wholeAmountOrZero } from '../../../utils/validation';
import { formatCOP } from '../../../styles/theme';

interface Props {
  walletId: number;
  currentGoal: number;
  /** Recibe la meta guardada (0 = sin meta), para el aviso de éxito. */
  onSaved: (goal: number) => void;
}

/** Valor inicial del campo: la meta actual, o vacío si no hay meta (no obliga a borrar un 0). */
function initialValue(goal: number): string {
  return goal > 0 && Number.isInteger(goal) ? String(goal) : '';
}

/**
 * Meta de ahorro mensual (monthlySavingsGoal). Se monta de nuevo en cada apertura del panel,
 * así siempre arranca con la meta actual.
 */
export function SavingsGoalForm({ walletId, currentGoal, onSaved }: Props) {
  const [goal, setGoal] = useState(() => initialValue(currentGoal));
  const [loading, setLoading] = useState(false);
  const { fieldErrors, formError, formRef, validate, showApiError, clearField } =
    useFormErrors(['monthlySavingsGoal']);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = validate({
      monthlySavingsGoal: wholeAmountOrZero(goal, {
        required: 'Escribe la meta; usa 0 si no quieres tener una',
        negative: 'La meta de ahorro no puede ser negativa',
      }),
    });
    if (!valid) return;
    setLoading(true);
    try {
      await personalWalletService.setSavingsGoal(walletId, { monthlySavingsGoal: Number(goal) });
      onSaved(Number(goal));
    } catch (err) {
      showApiError(err, 'No se pudo actualizar la meta de ahorro.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <MoneyInput
        label="Meta mensual"
        name="monthlySavingsGoal"
        value={goal}
        onValueChange={(raw) => {
          setGoal(raw);
          clearField('monthlySavingsGoal');
        }}
        hint="Escribe 0 para quitar la meta."
        preview={(value) => `Quieres ahorrar ${formatCOP(value)} al mes`}
        error={fieldErrors.monthlySavingsGoal}
        data-autofocus
        required
      />
      <FormError message={formError} />
      <Button type="submit" loading={loading}>Guardar meta</Button>
    </form>
  );
}
