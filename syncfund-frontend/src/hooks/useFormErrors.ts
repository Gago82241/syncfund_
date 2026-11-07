import { useRef, useState } from 'react';
import { parseApiError } from '../utils/apiError';

type FieldErrors<F extends string> = Partial<Record<F, string>>;

/**
 * Errores de un formulario, tanto de la validación local como del backend.
 * Las claves son los nombres de campo del backend y deben coincidir con el name de cada campo.
 */
export function useFormErrors<F extends string>(visibleFields: readonly F[]) {
  const formRef = useRef<HTMLFormElement>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<F>>({});
  const [formError, setFormError] = useState('');

  /** Enfoca el primer campo con error según su orden en pantalla. */
  function focusFirstError(errors: Record<string, string | undefined>) {
    const fields = Array.from(formRef.current?.elements ?? []) as HTMLInputElement[];
    fields.find((field) => errors[field.name])?.focus();
  }

  /** Recibe el resultado de cada validador por campo y devuelve true si todos pasaron. */
  function validate(results: Partial<Record<F, string | undefined>>): boolean {
    const errors: FieldErrors<F> = {};
    for (const field of visibleFields) {
      const message = results[field];
      if (message) errors[field] = message;
    }
    setFieldErrors(errors);
    setFormError('');
    focusFirstError(errors);
    return Object.keys(errors).length === 0;
  }

  function showApiError(err: unknown, fallback: string) {
    const parsed = parseApiError(err, fallback, visibleFields);
    setFieldErrors(parsed.fieldErrors as FieldErrors<F>);
    setFormError(parsed.formError);
    focusFirstError(parsed.fieldErrors);
  }

  function clearField(field: F) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function clearErrors() {
    setFieldErrors({});
    setFormError('');
  }

  return { fieldErrors, formError, formRef, validate, showApiError, clearField, clearErrors };
}
