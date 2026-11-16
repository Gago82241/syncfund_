import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { MoneyInput } from '../../../components/ui/MoneyInput';
import { Button } from '../../../components/ui/Button';
import { FormError } from '../../../components/ui/FormError';
import { transactionService } from '../../transactions/services/transactionService';
import { categoryService } from '../../categories/services/categoryService';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { amountWithin, required, wholeAmount } from '../../../utils/validation';
import { formatCOP } from '../../../styles/theme';
import type { CategoryResponse } from '../../../types/api';
import './TransactionForm.css';

type MovementType = 'INGRESO' | 'GASTO';

/** Lo que se registró, para el aviso de éxito ("Gasto de $2.000 registrado"). */
export interface SavedMovement {
  type: MovementType;
  amount: number;
}

interface Props {
  walletId: number;
  onSaved: (saved: SavedMovement) => void;
  /**
   * Disponible de la billetera (currentBalance). Si se conoce, el gasto lo muestra antes de
   * escribir y avisa en vivo si no alcanza: el backend no permite gastar más que el disponible.
   */
  available?: number;
  /**
   * Dentro de un Panel: sin marco ni título propios (el panel ya los pone) y con el foco
   * inicial en el monto. En la Billetera se usa sin esta opción.
   */
  embedded?: boolean;
  /** Tipo con el que abre (ej. "Registra tu primer ingreso"). Solo cuenta al montarse. */
  initialType?: MovementType;
}

function overAvailableMessage(available: number): string {
  return `Tu disponible es ${formatCOP(available)}; no alcanza para este gasto.`;
}

/** Transaction.execute() vía POST /api/transactions, para la PersonalWallet. */
export function TransactionForm({ walletId, onSaved, available, embedded = false, initialType = 'GASTO' }: Props) {
  const [type, setType] = useState<MovementType>(initialType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  // Si no cargan, el selector no aparece: se avisa para que no parezca que no tienes categorías.
  const [categoriesFailed, setCategoriesFailed] = useState(false);
  const [retryingCategories, setRetryingCategories] = useState(false);
  const [loading, setLoading] = useState(false);
  const { fieldErrors, formError, formRef, validate, showApiError, clearField, clearErrors } =
    useFormErrors(['amount', 'description']);

  // loadCategories no marca "reintentando": lo hace retryCategories antes de llamarla.
  const loadCategories = useCallback(
    () =>
      categoryService
        .getAll()
        .then(({ data }) => {
          setCategories(data);
          setCategoriesFailed(false);
        })
        .catch(() => setCategoriesFailed(true))
        .finally(() => setRetryingCategories(false)),
    [],
  );

  function retryCategories() {
    setRetryingCategories(true);
    loadCategories();
  }

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Aviso en vivo: en un gasto, si ya se sabe el disponible, se avisa mientras se escribe.
  const exceedsAvailable =
    type === 'GASTO' && available !== undefined && amount !== '' && Number(amount) > available;
  const amountError =
    fieldErrors.amount ?? (exceedsAvailable && available !== undefined ? overAvailableMessage(available) : undefined);

  function handleTypeChange(next: MovementType) {
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
      amount:
        type === 'GASTO' && available !== undefined
          ? amountWithin(amount, available, overAvailableMessage(available))
          : wholeAmount(amount),
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
      const saved = { type, amount: Number(amount) };
      setAmount('');
      setDescription('');
      setCategoryId('');
      onSaved(saved);
    } catch (err) {
      showApiError(err, 'No se pudo registrar el movimiento.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={embedded ? 'tx-form tx-form--embedded' : 'tx-form'}
      noValidate
    >
      {!embedded && <h3>Registrar movimiento</h3>}
      <div className="tx-form__toggle" role="group" aria-label="Tipo de movimiento">
        <button
          type="button"
          aria-pressed={type === 'GASTO'}
          className={type === 'GASTO' ? 'is-active' : ''}
          onClick={() => handleTypeChange('GASTO')}
        >
          Gasto
        </button>
        <button
          type="button"
          aria-pressed={type === 'INGRESO'}
          className={type === 'INGRESO' ? 'is-active' : ''}
          onClick={() => handleTypeChange('INGRESO')}
        >
          Ingreso
        </button>
      </div>
      <MoneyInput
        label="Monto"
        name="amount"
        value={amount}
        // El color del tipo aparece al escribir: vacío no debe parecer un campo con error.
        tone={amount === '' || amountError ? undefined : type === 'GASTO' ? 'loss' : 'gain'}
        hint={
          type === 'GASTO' && available !== undefined
            ? `Disponible para gastar: ${formatCOP(available)}`
            : undefined
        }
        preview={
          exceedsAvailable
            ? undefined
            : (value) => `Vas a registrar ${type === 'GASTO' ? 'un gasto' : 'un ingreso'} de ${formatCOP(value)}`
        }
        error={amountError}
        data-autofocus={embedded || undefined}
        onValueChange={(raw) => {
          setAmount(raw);
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
      {type === 'GASTO' && categoriesFailed && (
        <p className="tx-form__note" role="status">
          No pudimos cargar tus categorías; puedes guardar el movimiento sin categoría.{' '}
          <button
            type="button"
            className="tx-form__note-retry"
            onClick={retryCategories}
            disabled={retryingCategories}
          >
            {retryingCategories ? 'Reintentando…' : 'Reintentar'}
          </button>
        </p>
      )}
      <FormError message={formError} />
      <Button type="submit" loading={loading}>Guardar</Button>
    </form>
  );
}
