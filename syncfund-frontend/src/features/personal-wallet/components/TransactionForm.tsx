import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { transactionService } from '../../transactions/services/transactionService';
import { categoryService } from '../../categories/services/categoryService';
import type { CategoryResponse } from '../../../types/api';
import './TransactionForm.css';

interface Props {
  walletId: number;
  onSaved: () => void;
}

/** Transaction.execute() vía POST /api/transactions, para la PersonalWallet. */
export function TransactionForm({ walletId, onSaved }: Props) {
  const [type, setType] = useState<'INGRESO' | 'GASTO'>('GASTO');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    categoryService.getAll().then(({ data }) => setCategories(data));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await transactionService.create({
        amount: Number(amount),
        description,
        type,
        originWalletId: walletId,
        originWalletType: 'PERSONAL',
        categoryId: categoryId ? Number(categoryId) : undefined,
      });
      setAmount('');
      setDescription('');
      setCategoryId('');
      onSaved();
    } catch {
      setError('No se pudo registrar el movimiento. Revisa que el monto no exceda tu saldo disponible.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="tx-form">
      <h3>Registrar movimiento</h3>
      <div className="tx-form__toggle">
        <button
          type="button"
          className={type === 'GASTO' ? 'is-active' : ''}
          onClick={() => setType('GASTO')}
        >
          Gasto
        </button>
        <button
          type="button"
          className={type === 'INGRESO' ? 'is-active' : ''}
          onClick={() => setType('INGRESO')}
        >
          Ingreso
        </button>
      </div>
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
      {type === 'GASTO' && categories.length > 0 && (
        <div className="sf-field">
          <label className="sf-field__label" htmlFor="tx-category">Categoría (opcional)</label>
          <select
            id="tx-category"
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
      {error && <p className="tx-form__error">{error}</p>}
      <Button type="submit" loading={loading}>Guardar</Button>
    </form>
  );
}
