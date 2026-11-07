import './Input.css';

interface FieldErrorProps {
  id?: string;
  message?: string;
}

/** Mensaje de error debajo de un campo o de un grupo de campos. */
export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;
  return <span id={id} className="sf-field__error">{message}</span>;
}
