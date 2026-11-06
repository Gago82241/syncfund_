import './FormError.css';

/** Mensaje general del formulario: errores que no pertenecen a un campo concreto. */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="sf-form-error" role="alert">{message}</p>;
}
