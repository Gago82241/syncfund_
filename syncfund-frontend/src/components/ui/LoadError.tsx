import type { ReactNode } from 'react';
import { Button } from './Button';
import './LoadError.css';

interface Props {
  message: string;
  /** Si se pasa, muestra el botón "Reintentar". Se omite cuando reintentar no sirve (403/404). */
  onRetry?: () => void;
  retrying?: boolean;
  /** Alternativa al botón, por ejemplo un enlace para volver a otra pantalla. */
  action?: ReactNode;
}

/**
 * Estado de error de una carga de datos: deja claro que la información no se pudo traer,
 * en lugar de mostrar el mensaje de "no tienes nada" como si la lista estuviera vacía.
 */
export function LoadError({ message, onRetry, retrying, action }: Props) {
  return (
    <div className="sf-load-error" role="alert">
      <p className="sf-load-error__message">{message}</p>
      {(onRetry || action) && (
        <div className="sf-load-error__actions">
          {onRetry && (
            <Button type="button" variant="ghost" loading={retrying} onClick={onRetry}>
              Reintentar
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}
