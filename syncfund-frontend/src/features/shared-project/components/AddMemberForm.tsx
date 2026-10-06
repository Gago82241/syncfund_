import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { sharedProjectService } from '../services/sharedProjectService';
import type { ApiErrorResponse } from '../../../types/api';

interface Props {
  projectId: number;
  onSaved: () => void;
}

/** SharedProject.addMember(): identifica al usuario por su correo registrado. */
export function AddMemberForm({ projectId, onSaved }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sharedProjectService.addMember(projectId, { email });
      setEmail('');
      onSaved();
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err) && err.response) {
        setError(err.response.data.message);
      } else {
        setError('No se pudo agregar al integrante.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Agregar integrante</h3>
      <Input
        label="Correo del usuario"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      {error && <p style={{ color: 'var(--loss-500)', fontSize: '0.8125rem', marginBottom: '1rem' }}>{error}</p>}
      <Button type="submit" variant="ghost" loading={loading}>Agregar</Button>
    </form>
  );
}
