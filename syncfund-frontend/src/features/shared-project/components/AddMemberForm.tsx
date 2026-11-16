import { useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormError } from '../../../components/ui/FormError';
import { sharedProjectService } from '../services/sharedProjectService';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { email as validateEmail } from '../../../utils/validation';
import './ProjectForms.css';

interface Props {
  projectId: number;
  onSaved: (email: string) => void;
}

/**
 * SharedProject.addMember(): identifica al usuario por su correo registrado.
 * Solo el administrador lo ve (el backend también lo exige). Va dentro de un Panel.
 */
export function AddMemberForm({ projectId, onSaved }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { fieldErrors, formError, formRef, validate, showApiError, clearField } =
    useFormErrors(['email']);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate({ email: validateEmail(email) })) return;
    setLoading(true);
    try {
      await sharedProjectService.addMember(projectId, { email: email.trim() });
      onSaved(email.trim());
    } catch (err) {
      showApiError(err, 'No se pudo agregar al integrante.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="project-form">
      <Input
        label="Correo"
        type="email"
        name="email"
        autoComplete="off"
        hint="Debe tener una cuenta en SyncFund."
        value={email}
        error={fieldErrors.email}
        onChange={(e) => {
          setEmail(e.target.value);
          clearField('email');
        }}
        required
        data-autofocus
      />
      <FormError message={formError} />
      <Button type="submit" loading={loading}>Agregar integrante</Button>
    </form>
  );
}
