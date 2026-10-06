import { useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { categoryService } from '../services/categoryService';

export function CategoryForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await categoryService.create({ name, monthlyLimit: Number(monthlyLimit) });
      setName('');
      setMonthlyLimit('');
      onCreated();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Nueva categoría</h3>
      <Input
        label="Nombre"
        placeholder="Mercado, Transporte, Salidas..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        label="Límite mensual (COP)"
        type="number"
        min="0"
        value={monthlyLimit}
        onChange={(e) => setMonthlyLimit(e.target.value)}
        required
      />
      <Button type="submit" loading={loading}>Crear categoría</Button>
    </form>
  );
}
