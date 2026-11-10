import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormError } from '../../../components/ui/FormError';
import { transactionService } from '../../transactions/services/transactionService';
import { categoryService } from '../../categories/services/categoryService';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { required, wholeAmount } from '../../../utils/validation';
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
  const [loading, setLoading] = useState(false);
  const { fieldErrors, formError, formRef, validate, showApiError, clearField, clearErrors } =
    useFormErrors(['amount', 'description']);

  useEffect(() => {
    categoryService.getAll().then(({ data }) => setCategories(data));
  }, []);

  function handleTypeChange(next: 'INGRESO' | 'GASTO') {
    if (next === type) return;
    setType(next);
    setAmount('');
    setDescription('');
    setCategoryId('');
    clearErrors();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = validate({
      amount: wholeAmount(amount),
      description: required(description, 'La descripción es obligatoria'),
    });
    if (!valid) return;
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
    } catch (err) {
      showApiError(err, 'No se pudo registrar el movimiento.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="tx-form" noValidate>
      <h3>Registrar movimiento</h3>
      <div className="tx-form__toggle">
        <button
          type="button"
          className={type === 'GASTO' ? 'is-active' : ''}
          onClick={() => handleTypeChange('GASTO')}
        >
          Gasto
        </button>
        <button
          type="button"
          className={type === 'INGRESO' ? 'is-active' : ''}
          onClick={() => handleTypeChange('INGRESO')}
        >
          Ingreso
        </button>
      </div>
      <Input
        label="Monto (COP)"
        type="number"
        name="amount"
        min="1"
        placeholder="Ej: 50000 (sin puntos)"
        // El color por tipo tiene más especificidad: con error debe mandar el estilo de error.
        className={fieldErrors.amount ? undefined : `tx-form__amount--${type === 'GASTO' ? 'gasto' : 'ingreso'}`}
        value={amount}
        error={fieldErrors.amount}
        onChange={(e) => {
          setAmount(e.target.value);
          clearField('amount');
        }}
        required
      />
      <Input
        label="Descripción"
        name="description"
        placeholder={type === 'GASTO' ? 'Ej: Almuerzo con amigos' : 'Ej: Pago de nómina'}
        value={description}
        error={fieldErrors.description}
        onChange={(e) => {
          setDescription(e.target.value);
          clearField('description');
        }}
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
      <FormError message={formError} />
      <Button type="submit" loading={loading}>Guardar</Button>
    </form>
  );
}
