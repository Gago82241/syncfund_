import { useState, type FormEvent } from 'react';
import { MoneyInput } from '../../../components/ui/MoneyInput';
import { Button } from '../../../components/ui/Button';
import { FormError } from '../../../components/ui/FormError';
import { sharedProjectService } from '../services/sharedProjectService';
import { usePersonalWallet } from '../../personal-wallet/hooks/usePersonalWallet';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { amountWithin } from '../../../utils/validation';
import { formatCOP } from '../../../styles/theme';
import './ProjectForms.css';

interface Props {
  projectId: number;
  contributorId: number;
  onSaved: (amount: number) => void;
}

function overWalletMessage(available: number): string {
  return `Tu billetera tiene ${formatCOP(available)}; no alcanza para este aporte.`;
}

/**
 * SharedProject.distributeContribution(amount, contributorId).
 * El aporte sale de la billetera personal de quien aporta y entra al fondo del proyecto.
 * Se monta de nuevo en cada apertura del panel: así consulta la billetera actualizada.
 */
export function ContributionForm({ projectId, contributorId, onSaved }: Props) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { wallet, error: walletError } = usePersonalWallet(contributorId);
  const { fieldErrors, formError, formRef, validate, showApiError, clearField } =
    useFormErrors(['amount']);

  const available = wallet?.currentBalance;
  // Aviso en vivo: si ya se sabe lo disponible, se avisa mientras se escribe.
  const exceedsWallet = available !== undefined && amount !== '' && Number(amount) > available;
  const amountError = fieldErrors.amount ?? (exceedsWallet ? overWalletMessage(available) : undefined);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const message = available === undefined ? '' : overWalletMessage(available);
    if (!validate({ amount: amountWithin(amount, available, message) })) return;
    setLoading(true);
    try {
      await sharedProjectService.contribute(projectId, {
        amount: Number(amount),
        contributorId,
        description: 'Aporte al fondo',
      });
      onSaved(Number(amount));
    } catch (err) {
      showApiError(err, 'No se pudo registrar el aporte.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="project-form">
      <p className="project-form__note" aria-live="polite">
        {available !== undefined ? (
          <>
            Disponible en tu billetera: <strong className="tabular-nums">{formatCOP(available)}</strong>
          </>
        ) : walletError ? (
          'No pudimos consultar tu billetera. Al aportar se revisa que el saldo alcance.'
        ) : (
          'Consultando tu billetera…'
        )}
      </p>
      <MoneyInput
        label="Monto"
        name="amount"
        value={amount}
        onValueChange={(raw) => {
          setAmount(raw);
          clearField('amount');
        }}
        preview={(value) => `Vas a aportar ${formatCOP(value)} de tu billetera`}
        error={amountError}
        required
        data-autofocus
        // Si el panel ya estaba abierto (se llegó desde "fondo en cero" del gasto), el panel no
        // vuelve a enfocar: autoFocus actúa al montar. Con el panel cerrado no tiene efecto.
        autoFocus
      />
      <FormError message={formError} />
      <Button type="submit" loading={loading}>Aportar</Button>
    </form>
  );
}
