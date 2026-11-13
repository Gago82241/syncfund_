import { useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormError } from '../../../components/ui/FormError';
import { personalWalletService } from '../services/personalWalletService';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { wholeAmount } from '../../../utils/validation';

interface Props {
  walletId: number;
  onSaved: () => void;
}

/** PersonalWallet.manageCushion(amount, type). */
export function CushionForm({ walletId, onSaved }: Props) {
  const [amount, setAmount] = useState('');
  // Acción en curso: solo su botón dice "Procesando..."; mientras tanto los dos quedan deshabilitados.
  const [pending, setPending] = useState<'APARTAR' | 'LIBERAR' | null>(null);
  const { fieldErrors, formError, formRef, validate, showApiError, clearField } =
    useFormErrors(['amount']);

  async function handleAction(type: 'APARTAR' | 'LIBERAR') {
    if (!validate({ amount: wholeAmount(amount) })) return;
    setPending(type);
    try {
      await personalWalletService.manageCushion(walletId, { amount: Number(amount), type });
      setAmount('');
      onSaved();
    } catch (err) {
      showApiError(err, 'No se pudo completar la operación.');
    } finally {
      setPending(null);
    }
  }

  return (
    <form ref={formRef} onSubmit={(e: FormEvent) => e.preventDefault()} noValidate>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Colchón de seguridad</h3>
      <Input
        label="Monto (COP)"
        type="number"
        name="amount"
        min="1"
        placeholder="Ej: 100000 (sin puntos)"
        value={amount}
        error={fieldErrors.amount}
        onChange={(e) => {
          setAmount(e.target.value);
          clearField('amount');
        }}
        required
      />
      <FormError message={formError} />
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button
          type="button"
          variant="ghost"
          loading={pending === 'APARTAR'}
          disabled={pending !== null}
          onClick={() => handleAction('APARTAR')}
        >
          Apartar
        </Button>
        <Button
          type="button"
          variant="ghost"
          loading={pending === 'LIBERAR'}
          disabled={pending !== null}
          onClick={() => handleAction('LIBERAR')}
        >
          Liberar
        </Button>
      </div>
    </form>
  );
}
