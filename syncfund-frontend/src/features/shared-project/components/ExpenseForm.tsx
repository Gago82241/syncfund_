import { useId, useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { MoneyInput } from '../../../components/ui/MoneyInput';
import { Button } from '../../../components/ui/Button';
import { FieldError } from '../../../components/ui/FieldError';
import { FormError } from '../../../components/ui/FormError';
import { ParticipantChips } from './ParticipantChips';
import { sharedProjectService } from '../services/sharedProjectService';
import { HALF_CENT } from '../balance';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { amountWithin, required, wholeAmount } from '../../../utils/validation';
import { formatCOP } from '../../../styles/theme';
import type { UserResponse } from '../../../types/api';
import './ProjectForms.css';

interface Props {
  projectId: number;
  payerId: number;
  members: UserResponse[];
  /** Saldo actual del fondo del proyecto: es quien paga el gasto. */
  fundBalance: number;
  onSaved: (saved: { amount: number; people: number }) => void;
  /** Con el fondo en cero no se puede gastar: se ofrece aportar en el mismo panel. */
  onContributeInstead: () => void;
}

/** Mensaje en vivo (antes de enviar) y al enviar: el mismo texto en los dos momentos. */
function overFundMessage(fundBalance: number): string {
  return `Supera el fondo disponible (${formatCOP(fundBalance)}).`;
}

/**
 * Texto con la división del gasto. Refleja DebtCalculator.splitBill (monto / participantes,
 * sin redondear): si no es exacta se muestra redondeada a pesos y con "≈".
 */
function splitSummary(amount: string, people: number): string | null {
  if (people === 0) return null;
  if (wholeAmount(amount)) return 'Escribe el monto para ver cuánto le toca a cada uno.';
  const total = Number(amount);
  if (people === 1) return `${formatCOP(total)} a cargo de 1 persona`;
  const share = total / people;
  const sign = Number.isInteger(share) ? '=' : '≈';
  return `${formatCOP(total)} entre ${people} personas ${sign} ${formatCOP(share)} cada uno`;
}

/**
 * SharedProject.registerSelectiveExpense(amount, payerId, involvedIdsList).
 * El gasto lo paga el fondo del proyecto y se reparte entre quienes participan.
 * Va dentro de un Panel: el título y la regla del fondo los pone el panel.
 */
export function ExpenseForm({ projectId, payerId, members, fundBalance, onSaved, onContributeInstead }: Props) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [involved, setInvolved] = useState<number[]>(() => members.map((m) => m.id));
  const [knownIds, setKnownIds] = useState<number[]>(() => members.map((m) => m.id));
  const [loading, setLoading] = useState(false);
  const { fieldErrors, formError, formRef, validate, showApiError, clearField } =
    useFormErrors(['amount', 'description', 'involvedIdsList']);
  const groupId = useId();
  const groupErrorId = `${groupId}-error`;

  // Si cambian los integrantes (p. ej. se agregó uno), los nuevos entran marcados
  // y se respeta a quienes el usuario desmarcó. Se ajusta durante el render, sin efecto.
  const memberIds = members.map((m) => m.id);
  if (memberIds.join() !== knownIds.join()) {
    const added = memberIds.filter((id) => !knownIds.includes(id));
    setKnownIds(memberIds);
    setInvolved((prev) => [...prev.filter((id) => memberIds.includes(id)), ...added]);
  }

  // Regla visible antes del error: con el fondo vacío no hay gasto posible.
  if (fundBalance < HALF_CENT) {
    return (
      <div className="project-form__empty-fund">
        <p>
          El fondo está en <span className="tabular-nums">{formatCOP(0)}</span>. Para registrar un gasto,
          primero alguien tiene que aportar.
        </p>
        <Button type="button" onClick={onContributeInstead} data-autofocus>
          Aportar al fondo
        </Button>
      </div>
    );
  }

  function changeInvolved(ids: number[]) {
    setInvolved(ids);
    clearField('involvedIdsList');
  }

  // Aviso en vivo: se ve mientras se escribe, sin esperar a "Registrar gasto".
  const exceedsFund = amount !== '' && Number(amount) > fundBalance;
  const amountError = fieldErrors.amount ?? (exceedsFund ? overFundMessage(fundBalance) : undefined);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = validate({
      amount: amountWithin(amount, fundBalance, overFundMessage(fundBalance)),
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
      });
      onSaved({ amount: Number(amount), people: involved.length });
    } catch (err) {
      showApiError(err, 'No se pudo registrar el gasto.');
    } finally {
      setLoading(false);
    }
  }

  const split = splitSummary(amount, involved.length);

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="project-form">
      <MoneyInput
        label="Monto"
        name="amount"
        value={amount}
        onValueChange={(raw) => {
          setAmount(raw);
          clearField('amount');
        }}
        preview={(value) => `El fondo paga ${formatCOP(value)}`}
        error={amountError}
        required
        data-autofocus
      />
      <Input
        label="Descripción"
        name="description"
        placeholder="Ej: Mercado de la semana"
        value={description}
        error={fieldErrors.description}
        onChange={(e) => {
          setDescription(e.target.value);
          clearField('description');
        }}
        required
      />
      <ParticipantChips
        members={members}
        currentUserId={payerId}
        selected={involved}
        onChange={changeInvolved}
        labelId={groupId}
        describedBy={fieldErrors.involvedIdsList ? groupErrorId : undefined}
      >
        <p className="sf-chips__split tabular-nums" aria-live="polite">
          {split}
        </p>
        <FieldError id={groupErrorId} message={fieldErrors.involvedIdsList} />
      </ParticipantChips>
      <FormError message={formError} />
      <Button type="submit" loading={loading}>
        Registrar gasto
      </Button>
    </form>
  );
}
