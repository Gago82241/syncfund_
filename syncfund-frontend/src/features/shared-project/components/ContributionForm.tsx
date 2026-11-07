import { useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormError } from '../../../components/ui/FormError';
import { sharedProjectService } from '../services/sharedProjectService';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { wholeAmount } from '../../../utils/validation';

interface Props {
  projectId: number;
  contributorId: number;
  onSaved: () => void;
}

/** SharedProject.distributeContribution(amount, contributorId). */
export function ContributionForm({ projectId, contributorId, onSaved }: Props) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { fieldErrors, formError, formRef, validate, showApiError, clearField } =
    useFormErrors(['amount']);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate({ amount: wholeAmount(amount) })) return;
    setLoading(true);
    try {
      await sharedProjectService.contribute(projectId, {
        amount: Number(amount),
        contributorId,
        description: 'Aporte al fondo',
      });
      setAmount('');
      onSaved();
    } catch (err) {
      showApiError(err, 'No se pudo registrar el aporte.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Aportar al fondo</h3>
      <Input
        label="Monto (COP)"
        type="number"
        name="amount"
        min="1"
        placeholder="Ej: 50000 (sin puntos)"
        value={amount}
        error={fieldErrors.amount}
        onChange={(e) => {
          setAmount(e.target.value);
          clearField('amount');
        }}
        required
      />
      <FormError message={formError} />
      <Button type="submit" variant="ghost" loading={loading}>Aportar</Button>
    </form>
  );
}
