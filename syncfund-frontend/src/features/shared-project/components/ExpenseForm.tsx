import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { sharedProjectService } from '../services/sharedProjectService';
import { categoryService } from '../../categories/services/categoryService';
import type { CategoryResponse, UserResponse } from '../../../types/api';

interface Props {
  projectId: number;
  payerId: number;
  members: UserResponse[];
  onSaved: () => void;
}

/** SharedProject.registerSelectiveExpense(amount, payerId, involvedIdsList). */
export function ExpenseForm({ projectId, payerId, members, onSaved }: Props) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [involved, setInvolved] = useState<number[]>(members.map((m) => m.id));
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    categoryService.getAll().then(({ data }) => setCategories(data));
  }, []);

  function toggleMember(id: number) {
    setInvolved((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (involved.length === 0) return;
    setLoading(true);
    try {
      await sharedProjectService.registerExpense(projectId, {
        amount: Number(amount),
        payerId,
        involvedIdsList: involved,
        description,
        categoryId: categoryId ? Number(categoryId) : undefined,
      });
      setAmount('');
      setDescription('');
      setCategoryId('');
      onSaved();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Registrar gasto (tú pagas)</h3>
      <Input
        label="Monto (COP)"
        type="number"
        min="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <Input
        label="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <div style={{ marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink-muted)' }}>
          ¿Quiénes participan de este gasto?
        </span>
        <div style={{ marginTop: '0.5rem' }}>
          {members.map((m) => (
            <label key={m.id} style={{ display: 'block', fontSize: '0.9375rem', marginBottom: '0.35rem' }}>
              <input
                type="checkbox"
                checked={involved.includes(m.id)}
                onChange={() => toggleMember(m.id)}
                style={{ marginRight: '0.5rem' }}
              />
              {m.name}
            </label>
          ))}
        </div>
      </div>
      {categories.length > 0 && (
        <div className="sf-field">
          <label className="sf-field__label" htmlFor="expense-category">Categoría (opcional)</label>
          <select
            id="expense-category"
            className="sf-field__input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
            ))}
          </select>
        </div>
      )}
      <Button type="submit" loading={loading} disabled={involved.length === 0}>
        Registrar gasto
      </Button>
    </form>
  );
}
