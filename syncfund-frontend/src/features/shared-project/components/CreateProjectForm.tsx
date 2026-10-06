import { useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { sharedProjectService } from '../services/sharedProjectService';

interface Props {
  adminId: number;
  onCreated: () => void;
}

export function CreateProjectForm({ adminId, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await sharedProjectService.create({ name, description, adminId });
      setName('');
      setDescription('');
      onCreated();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Nuevo proyecto compartido</h3>
      <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input
        label="Descripción (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button type="submit" loading={loading}>Crear proyecto</Button>
    </form>
  );
}
