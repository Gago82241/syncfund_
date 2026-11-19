import { useState, type FormEvent } from 'react';
import { MoneyInput } from '../../../components/ui/MoneyInput';
import { Button } from '../../../components/ui/Button';
import { FormError } from '../../../components/ui/FormError';
import { personalWalletService } from '../services/personalWalletService';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { amountWithin } from '../../../utils/validation';
import { formatCOP } from '../../../styles/theme';
import type { PersonalWalletResponse } from '../../../types/api';
import './CushionForm.css';

type CushionAction = 'APARTAR' | 'LIBERAR';

/** Lo que pasó, con la billetera que devolvió el backend, para el aviso de éxito. */
export interface CushionResult {
  type: CushionAction;
  amount: number;
  wallet: PersonalWalletResponse;
}

interface Props {
  walletId: number;
  /** Disponible actual: lo máximo que se puede apartar. */
  available: number;
  /** Colchón actual: lo máximo que se puede liberar. */
  cushion: number;
  onSaved: (result: CushionResult) => void;
}

const OPTIONS: { value: CushionAction; label: string }[] = [
  { value: 'APARTAR', label: 'Apartar' },
  { value: 'LIBERAR', label: 'Liberar' },
];

/** Mismas reglas que PersonalWallet.manageCushion, con el texto de cada límite. */
function limitMessage(type: CushionAction, available: number, cushion: number): string {
  return type === 'APARTAR'
    ? `Solo tienes ${formatCOP(available)} disponible para apartar.`
    : `Solo tienes ${formatCOP(cushion)} apartado en el colchón.`;
}

/**
 * PersonalWallet.manageCushion(amount, type). Apartar pasa dinero del disponible al colchón y
 * liberar lo devuelve; el total no cambia. Los límites se ven antes de escribir.
 * Se monta de nuevo en cada apertura del panel, con las cifras actuales.
 */
export function CushionForm({ walletId, available, cushion, onSaved }: Props) {
  // Si no hay nada disponible pero sí apartado, lo único posible es liberar.
  const [type, setType] = useState<CushionAction>(available <= 0 && cushion > 0 ? 'LIBERAR' : 'APARTAR');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { fieldErrors, formError, formRef, validate, showApiError, clearField, clearErrors } =
    useFormErrors(['amount']);

  const max = type === 'APARTAR' ? available : cushion;
  const nothingToMove = available <= 0 && cushion <= 0;
  const exceeds = amount !== '' && Number(amount) > max;
  const amountError = fieldErrors.amount ?? (exceeds ? limitMessage(type, available, cushion) : undefined);

  function handleTypeChange(next: CushionAction) {
    setType(next);
    clearErrors();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate({ amount: amountWithin(amount, max, limitMessage(type, available, cushion)) })) return;
    setLoading(true);
    try {
      const { data } = await personalWalletService.manageCushion(walletId, { amount: Number(amount), type });
      onSaved({ type, amount: Number(amount), wallet: data });
    } catch (err) {
      showApiError(err, 'No se pudo mover el dinero del colchón.');
    } finally {
      setLoading(false);
    }
  }

  if (nothingToMove) {
    return (
      <p className="cushion-form__empty">
        No tienes dinero disponible ni apartado. Registra un ingreso para poder apartar.
      </p>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <fieldset className="cushion-form__modes">
        <legend className="sf-field__label">¿Qué quieres hacer?</legend>
        <div className="cushion-form__options">
          {OPTIONS.map((option) => {
            const disabled = option.value === 'APARTAR' ? available <= 0 : cushion <= 0;
            return (
              <label
                key={option.value}
                className={`cushion-form__option${type === option.value ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}`}
              >
                <input
                  type="radio"
                  name="cushion-type"
                  value={option.value}
                  checked={type === option.value}
                  disabled={disabled}
                  onChange={() => handleTypeChange(option.value)}
                />
                {option.label}
              </label>
            );
          })}
        </div>
        <p className="cushion-form__limits tabular-nums">
          <span className="cushion-form__limit">Disponible para apartar {formatCOP(available)}</span>
          <span aria-hidden="true"> · </span>
          <span className="cushion-form__limit">Apartado {formatCOP(cushion)}</span>
        </p>
      </fieldset>

      <MoneyInput
        label={type === 'APARTAR' ? 'Monto a apartar' : 'Monto a liberar'}
        name="amount"
        value={amount}
        onValueChange={(raw) => {
          setAmount(raw);
          clearField('amount');
        }}
        preview={
          exceeds
            ? undefined
            : (value) =>
                type === 'APARTAR'
                  ? `Tu disponible quedará en ${formatCOP(available - value)} y tu colchón en ${formatCOP(cushion + value)}`
                  : `Tu colchón quedará en ${formatCOP(cushion - value)} y tu disponible en ${formatCOP(available + value)}`
        }
        error={amountError}
        data-autofocus
        required
      />
      <FormError message={formError} />
      <Button type="submit" loading={loading}>
        {type === 'APARTAR' ? 'Apartar' : 'Liberar'}
      </Button>
    </form>
  );
}
