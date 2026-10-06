import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../features/auth/services/authService';
import { useAuth } from '../context/AuthContext';
import type { ApiErrorResponse } from '../types/api';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authService.login({ email, password });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err) && err.response) {
        setError(err.response.data.message);
      } else {
        setError('No se pudo conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h2>Inicia sesión</h2>
      <p style={{ color: 'var(--ink-muted)', marginTop: '0.5rem', marginBottom: '2rem' }}>
        Entra para ver el saldo de tus billeteras y proyectos.
      </p>
      <form onSubmit={handleSubmit}>
        <Input
          label="Correo"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Contraseña"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <p style={{ color: 'var(--loss-500)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </p>
        )}
        <Button type="submit" loading={loading}>Entrar</Button>
      </form>
      <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--ink-muted)' }}>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </AuthLayout>
  );
}
