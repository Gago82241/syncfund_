import { useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormError } from '../../../components/ui/FormError';
import { sharedProjectService } from '../services/sharedProjectService';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { required } from '../../../utils/validation';

interface Props {
  adminId: number;
  onCreated: () => void;
}

export function CreateProjectForm({ adminId, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { fieldErrors, formError, formRef, validate, showApiError, clearField } =
    useFormErrors(['name', 'description']);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = validate({ name: required(name, 'El nombre del proyecto es obligatorio') });
    if (!valid) return;
    setLoading(true);
    try {
      await sharedProjectService.create({ name, description, adminId });
      setName('');
      setDescription('');
      onCreated();
    } catch (err) {
      showApiError(err, 'No se pudo crear el proyecto.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ marginBottom: '2rem' }} noValidate>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Nuevo proyecto compartido</h3>
      <Input
        label="Nombre"
        name="name"
        placeholder="Ej: Viaje a Cartagena"
        value={name}
        error={fieldErrors.name}
        onChange={(e) => {
          setName(e.target.value);
          clearField('name');
        }}
        required
      />
      <Input
        label="Descripción (opcional)"
        name="description"
        placeholder="Ej: Gastos compartidos del viaje"
        value={description}
        error={fieldErrors.description}
        onChange={(e) => {
          setDescription(e.target.value);
          clearField('description');
        }}
      />
      <FormError message={formError} />
      <Button type="submit" loading={loading}>Crear proyecto</Button>
    </form>
  );
}
