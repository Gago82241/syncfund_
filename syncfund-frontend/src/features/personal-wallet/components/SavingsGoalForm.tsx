import { useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { personalWalletService } from '../services/personalWalletService';

interface Props {
  walletId: number;
  currentGoal: number;
  onSaved: () => void;
}

/** PersonalWallet.adjustPrivateBudget() parte de la meta (monthlySavingsGoal). */
export function SavingsGoalForm({ walletId, currentGoal, onSaved }: Props) {
  const [goal, setGoal] = useState(String(currentGoal));
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await personalWalletService.setSavingsGoal(walletId, { monthlySavingsGoal: Number(goal) });
      onSaved();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Meta de ahorro mensual</h3>
      <Input
        label="Monto (COP)"
        type="number"
        min="0"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />
      <Button type="submit" variant="ghost" loading={loading}>Actualizar meta</Button>
    </form>
  );
}
