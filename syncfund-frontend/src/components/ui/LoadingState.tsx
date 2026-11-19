import './LoadingState.css';

/** Aviso mientras llega la respuesta de una carga de datos. role="status" lo anuncia a los lectores de pantalla. */
export function LoadingState({ message = 'Cargando…' }: { message?: string }) {
  return (
    <p className="sf-loading" role="status">
      {message}
    </p>
  );
}
