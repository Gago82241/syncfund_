import { useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormError } from '../../../components/ui/FormError';
import { sharedProjectService } from '../services/sharedProjectService';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { email as validateEmail } from '../../../utils/validation';

interface Props {
  projectId: number;
  onSaved: () => void;
}

/** SharedProject.addMember(): identifica al usuario por su correo registrado. */
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
      await sharedProjectService.addMember(projectId, { email });
      setEmail('');
      onSaved();
    } catch (err) {
      showApiError(err, 'No se pudo agregar al integrante.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Agregar integrante</h3>
      <Input
        label="Correo del usuario"
        type="email"
        name="email"
        placeholder="Correo con el que se registró"
        value={email}
        error={fieldErrors.email}
        onChange={(e) => {
          setEmail(e.target.value);
          clearField('email');
        }}
        required
      />
      <FormError message={formError} />
      <Button type="submit" variant="ghost" loading={loading}>Agregar</Button>
    </form>
  );
}
