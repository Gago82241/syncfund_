import { useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormError } from '../../../components/ui/FormError';
import { sharedProjectService } from '../services/sharedProjectService';
import { useFormErrors } from '../../../hooks/useFormErrors';
import { required } from '../../../utils/validation';
import type { SharedProjectResponse } from '../../../types/api';
import './ProjectForms.css';

interface Props {
  adminId: number;
  /** Recibe el proyecto que devolvió el backend (con su projectId). */
  onCreated: (project: SharedProjectResponse) => void;
}

/** Formulario para crear un proyecto, dentro de un Panel (el panel pone el título). */
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
      const { data } = await sharedProjectService.create({ name: name.trim(), description: description.trim(), adminId });
      onCreated(data);
    } catch (err) {
      showApiError(err, 'No se pudo crear el proyecto.');
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="project-form" noValidate>
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
        autoComplete="off"
        data-autofocus
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
        autoComplete="off"
      />
      <FormError message={formError} />
      <Button type="submit" loading={loading}>Crear proyecto</Button>
    </form>
  );
}
