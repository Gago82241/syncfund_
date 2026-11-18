import type { Ref } from 'react';
import './FormError.css';

interface FormErrorProps {
  message?: string;
  /** Para mover el foco al mensaje cuando el error no pertenece a un campo. */
  ref?: Ref<HTMLParagraphElement>;
}

/** Mensaje general del formulario: errores que no pertenecen a un campo concreto. */
export function FormError({ message, ref }: FormErrorProps) {
  if (!message) return null;
  return (
    <p ref={ref} className="sf-form-error" role="alert" tabIndex={-1}>
      {message}
    </p>
  );
}
