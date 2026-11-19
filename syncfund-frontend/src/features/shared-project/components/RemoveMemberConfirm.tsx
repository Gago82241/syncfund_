import { useRef, useState, type FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { FormError } from '../../../components/ui/FormError';
import { sharedProjectService } from '../services/sharedProjectService';
import { useFormErrors } from '../../../hooks/useFormErrors';
import type { UserResponse } from '../../../types/api';

interface Props {
  projectId: number;
  projectName: string;
  member: UserResponse;
  /** true: el usuario actual sale del proyecto; false: el admin elimina a otro integrante. */
  leaving: boolean;
  onCancel: () => void;
  onDone: () => void;
}

/**
 * Confirmación dentro de la página (sin window.confirm) para SharedProject.removeParticipant.
 * MembersList solo la ofrece si la persona está al día; si el backend igual lo rechaza (los saldos
 * cambiaron mientras tanto), su mensaje explica por qué.
 * El botón se deshabilita mientras se envía para evitar dos peticiones por doble clic.
 */
export function RemoveMemberConfirm({ projectId, projectName, member, leaving, onCancel, onDone }: Props) {
  const [loading, setLoading] = useState(false);
  const sending = useRef(false);
  const { formError, formRef, showApiError } = useFormErrors([]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // El estado "loading" tarda un render en deshabilitar el botón: la referencia bloquea al instante.
    if (sending.current) return;
    sending.current = true;
    setLoading(true);
    try {
      await sharedProjectService.removeMember(projectId, member.id);
      onDone();
    } catch (err) {
      showApiError(err, leaving ? 'No se pudo salir del proyecto.' : 'No se pudo eliminar al integrante.');
    } finally {
      sending.current = false;
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="remove-member" aria-live="polite">
      <p className="remove-member__title">
        {leaving ? `¿Salir de «${projectName}»?` : `¿Eliminar a ${member.name} del proyecto?`}
      </p>
      <p className="remove-member__text">
        {leaving
          ? 'Dejarás de ver el proyecto. Tus aportes, gastos y pagos se conservan en el historial.'
          : 'Dejará de ver el proyecto. Sus aportes, gastos y pagos se conservan en el historial.'}
      </p>
      <FormError message={formError} />
      <div className="remove-member__actions">
        {/* autoFocus: al abrir la confirmación, el foco queda en la opción segura. */}
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading} autoFocus>
          Cancelar
        </Button>
        <Button type="submit" variant="danger" loading={loading}>
          {leaving ? 'Salir' : 'Eliminar'}
        </Button>
      </div>
    </form>
  );
}
