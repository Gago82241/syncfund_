import { useEffect, useId, useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FieldError } from '../../../components/ui/FieldError';
import { FormError } from '../../../components/ui/FormError';
import { sharedProjectService } from '../services/sharedProjectService';
import { categoryService } from '../../categories/services/categoryService';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { required, wholeAmount } from '../../../utils/validation';
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
  const { fieldErrors, formError, formRef, validate, showApiError, clearField } =
    useFormErrors(['amount', 'description', 'involvedIdsList']);
  const groupId = useId();
  const groupErrorId = `${groupId}-error`;

  useEffect(() => {
    categoryService.getAll().then(({ data }) => setCategories(data));
  }, []);

  function toggleMember(id: number) {
    setInvolved((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
    clearField('involvedIdsList');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = validate({
      amount: wholeAmount(amount),
      description: required(description, 'La descripción es obligatoria'),
      involvedIdsList: involved.length === 0 ? 'Debes seleccionar al menos un participante' : undefined,
    });
    if (!valid) return;
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
    } catch (err) {
      showApiError(err, 'No se pudo registrar el gasto.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Registrar gasto (tú pagas)</h3>
      <Input
        label="Monto (COP)"
        type="number"
        name="amount"
        min="1"
        placeholder="Ej: 80000 (sin puntos)"
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
        placeholder="Ej: Cena del sábado"
        value={description}
        error={fieldErrors.description}
        onChange={(e) => {
          setDescription(e.target.value);
          clearField('description');
        }}
        required
      />
      <div
        role="group"
        aria-labelledby={groupId}
        aria-describedby={fieldErrors.involvedIdsList ? groupErrorId : undefined}
        style={{ marginBottom: '1.25rem' }}
      >
        <span id={groupId} style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink-muted)' }}>
          ¿Quiénes participan de este gasto?
        </span>
        <div style={{ marginTop: '0.5rem' }}>
          {members.map((m) => (
            <label key={m.id} style={{ display: 'block', fontSize: '0.9375rem', marginBottom: '0.35rem' }}>
              <input
                type="checkbox"
                name="involvedIdsList"
                checked={involved.includes(m.id)}
                onChange={() => toggleMember(m.id)}
                style={{ marginRight: '0.5rem' }}
              />
              {m.name}
            </label>
          ))}
        </div>
        <FieldError id={groupErrorId} message={fieldErrors.involvedIdsList} />
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
      <FormError message={formError} />
      <Button type="submit" loading={loading}>
        Registrar gasto
      </Button>
    </form>
  );
}
