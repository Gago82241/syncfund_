import { useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { personalWalletService } from '../services/personalWalletService';
import { getApiErrorMessage } from '../../../utils/apiError';

interface Props {
  walletId: number;
  onSaved: () => void;
}

/** PersonalWallet.manageCushion(amount, type). */
export function CushionForm({ walletId, onSaved }: Props) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAction(type: 'APARTAR' | 'LIBERAR') {
    if (!amount) return;
    setError('');
    setLoading(true);
    try {
      await personalWalletService.manageCushion(walletId, { amount: Number(amount), type });
      setAmount('');
      onSaved();
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo completar la operación.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e: FormEvent) => e.preventDefault()}>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Colchón de seguridad</h3>
      <Input
        label="Monto (COP)"
        type="number"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      {error && <p style={{ color: 'var(--loss-500)', fontSize: '0.8125rem', marginBottom: '1rem' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button type="button" variant="ghost" loading={loading} onClick={() => handleAction('APARTAR')}>
          Apartar
        </Button>
        <Button type="button" variant="ghost" loading={loading} onClick={() => handleAction('LIBERAR')}>
          Liberar
        </Button>
      </div>
    </form>
  );
}
