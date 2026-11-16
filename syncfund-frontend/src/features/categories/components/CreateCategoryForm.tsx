import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { FormError } from '../../../components/ui/FormError';
import { Input } from '../../../components/ui/Input';
import { MoneyInput } from '../../../components/ui/MoneyInput';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { formatCOP } from '../../../styles/theme';
import type { CategoryResponse } from '../../../types/api';
import { required } from '../../../utils/validation';
import { categoryService } from '../services/categoryService';
import './CreateCategoryForm.css';

/** Tope del frontend: la columna admite 255 y el backend aún no tiene @Size. */
const NAME_MAX = 100;
/** La columna es DECIMAL(12,2): un límite mayor hace fallar al backend con un error 500. */
const LIMIT_MAX = 9_999_999_999;
/** Por debajo de este límite, la revisión pregunta si faltaron ceros (300 en vez de 300.000). */
const SUSPICIOUS_LIMIT = 10000;

interface Props {
  /** Nombres de las categorías que ya existen: no se permite repetir uno. */
  existingNames: readonly string[];
  onCreated: (category: CategoryResponse) => void;
}

type Step = 'form' | 'review';

/** Mismo nombre sin importar mayúsculas, tildes ni espacios sobrantes ("mercado " = "Mercado"). */
function sameName(a: string, b: string): boolean {
  const clean = (text: string) => text.trim().replace(/\s+/g, ' ');
  return clean(a).localeCompare(clean(b), 'es', { sensitivity: 'base' }) === 0;
}

function limitText(limit: number): string {
  return limit > 0 ? `${formatCOP(limit)} al mes` : 'Sin límite';
}

/**
 * Crear una categoría en dos pasos dentro de un Panel: datos y revisión. Como por ahora no se
 * puede editar ni eliminar una categoría, la revisión muestra el límite tal como quedará.
 * Límite vacío = sin límite: se envía 0, que la app muestra como "Sin límite" (ver budget.ts).
 */
export function CreateCategoryForm({ existingNames, onCreated }: Props) {
  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const sending = useRef(false);
  const reviewTitleRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef<Step>(step);
  const { fieldErrors, formError, formRef, validate, showApiError, clearField } = useFormErrors([
    'name',
    'monthlyLimit',
  ]);

  const trimmedName = name.trim().replace(/\s+/g, ' ');
  const limitValue = limit === '' ? 0 : Number(limit);

  // El foco sigue al paso: título de la revisión, o el nombre al volver.
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    if (step === 'review') reviewTitleRef.current?.focus();
    if (step === 'form') formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
  }, [step, formRef]);

  function nameError(): string | undefined {
    const missing = required(name, 'Escribe el nombre de la categoría');
    if (missing) return missing;
    const repeated = existingNames.find((existing) => sameName(existing, name));
    return repeated ? `Ya tienes una categoría «${repeated}». Usa otro nombre.` : undefined;
  }

  function limitError(): string | undefined {
    if (limit !== '' && limitValue === 0) return 'Deja el campo vacío si no quieres ponerle límite.';
    if (limitValue > LIMIT_MAX) return `El límite no puede pasar de ${formatCOP(LIMIT_MAX)}.`;
    return undefined;
  }

  function handleReview(e: FormEvent) {
    e.preventDefault();
    if (!validate({ name: nameError(), monthlyLimit: limitError() })) return;
    setStep('review');
  }

  async function handleConfirm() {
    // El estado "loading" tarda un render en deshabilitar el botón: la referencia bloquea al instante.
    if (sending.current) return;
    sending.current = true;
    setLoading(true);
    try {
      const { data } = await categoryService.create({ name: trimmedName, monthlyLimit: limitValue });
      onCreated(data);
    } catch (err) {
      showApiError(err, 'No se pudo crear la categoría.');
      sending.current = false;
      setLoading(false);
    }
  }

  if (step === 'review') {
    return (
      <div className="category-review">
        <h3 ref={reviewTitleRef} className="category-review__title" tabIndex={-1}>
          Revisa la categoría
        </h3>
        <dl className="category-review__ledger">
          <div className="category-review__row">
            <dt>Nombre</dt>
            <dd>{trimmedName}</dd>
          </div>
          <div className="category-review__row">
            <dt>Límite mensual</dt>
            <dd className="tabular-nums">{limitText(limitValue)}</dd>
          </div>
          <div className="category-review__row">
            <dt>Se mide en</dt>
            <dd>Tu billetera personal, mes a mes</dd>
          </div>
        </dl>
        {limitValue > 0 && limitValue < SUSPICIOUS_LIMIT && (
          <p className="category-review__warning tabular-nums">
            Es un límite de {formatCOP(limitValue)} al mes. Si querías otra cifra, vuelve y corrígela.
          </p>
        )}
        <p className="category-review__note">
          Por ahora no podrás cambiar el nombre ni el límite después de crearla.
        </p>
        {/* Un error del backend también se ve aquí, sin volver al paso anterior. */}
        <FormError message={formError || fieldErrors.name || fieldErrors.monthlyLimit} />
        <div className="category-review__actions">
          <Button variant="ghost" onClick={() => setStep('form')} disabled={loading}>
            Volver
          </Button>
          <Button onClick={handleConfirm} loading={loading}>
            Crear categoría
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleReview} noValidate>
      <Input
        label="Nombre"
        name="name"
        placeholder="Ej: Mercado"
        value={name}
        error={fieldErrors.name}
        onChange={(e) => {
          setName(e.target.value);
          clearField('name');
        }}
        autoComplete="off"
        maxLength={NAME_MAX}
        data-autofocus
        required
      />
      <MoneyInput
        label="Límite mensual (opcional)"
        name="monthlyLimit"
        value={limit}
        onValueChange={(raw) => {
          setLimit(raw);
          clearField('monthlyLimit');
        }}
        hint="Déjalo vacío si solo quieres ver cuánto gastas en esta categoría."
        preview={(v) => `Tope de ${formatCOP(v)} al mes`}
        error={fieldErrors.monthlyLimit}
      />
      <FormError message={formError} />
      <Button type="submit">Revisar categoría</Button>
    </form>
  );
}
