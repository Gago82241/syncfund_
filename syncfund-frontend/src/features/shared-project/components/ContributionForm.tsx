import { useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormError } from '../../../components/ui/FormError';
import { sharedProjectService } from '../services/sharedProjectService';
import { usePersonalWallet } from '../../personal-wallet/hooks/usePersonalWallet';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { amountWithin } from '../../../utils/validation';
import { formatCOP } from '../../../styles/theme';

interface Props {
  projectId: number;
  contributorId: number;
  onSaved: () => void;
}

const SALDO_INSUFICIENTE = 'Saldo insuficiente en tu billetera personal para este aporte.';

/**
 * SharedProject.distributeContribution(amount, contributorId).
 * El aporte sale de la billetera personal de quien aporta y entra al fondo del proyecto.
 */
export function ContributionForm({ projectId, contributorId, onSaved }: Props) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { wallet, refresh: refreshWallet } = usePersonalWallet(contributorId);
  const { fieldErrors, formError, formRef, validate, showApiError, clearField } =
    useFormErrors(['amount']);

  const available = wallet?.currentBalance;
  const hint =
    available === undefined
      ? 'Se descontará de tu billetera personal.'
      : `Se descontará de tu billetera personal (disponible: ${formatCOP(available)}).`;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate({ amount: amountWithin(amount, available, SALDO_INSUFICIENTE) })) return;
    setLoading(true);
    try {
      await sharedProjectService.contribute(projectId, {
        amount: Number(amount),
        contributorId,
        description: 'Aporte al fondo',
      });
      setAmount('');
      refreshWallet();
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
        hint={hint}
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
