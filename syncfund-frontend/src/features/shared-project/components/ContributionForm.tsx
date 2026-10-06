import { useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { sharedProjectService } from '../services/sharedProjectService';

interface Props {
  projectId: number;
  contributorId: number;
  onSaved: () => void;
}

/** SharedProject.distributeContribution(amount, contributorId). */
export function ContributionForm({ projectId, contributorId, onSaved }: Props) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await sharedProjectService.contribute(projectId, {
        amount: Number(amount),
        contributorId,
        description: 'Aporte al fondo',
      });
      setAmount('');
      onSaved();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Aportar al fondo</h3>
      <Input
        label="Monto (COP)"
        type="number"
        min="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <Button type="submit" variant="ghost" loading={loading}>Aportar</Button>
    </form>
  );
}
