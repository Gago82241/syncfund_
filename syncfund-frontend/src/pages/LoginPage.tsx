import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { FormError } from '../components/ui/FormError';
import { authService } from '../features/auth/services/authService';
import { useAuth } from '../context/useAuth';
import { useFormErrors } from '../hooks/useFormErrors';
import { email as validateEmail, required } from '../utils/validation';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { fieldErrors, formError, formRef, validate, showApiError, clearField } =
    useFormErrors(['email', 'password']);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = validate({
      email: validateEmail(email),
      password: required(password, 'La contraseña es obligatoria'),
    });
    if (!valid) return;
    setLoading(true);
    try {
      // El autocompletado a veces deja un espacio al final del correo; la contraseña se envía tal cual.
      const { data } = await authService.login({ email: email.trim(), password });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      showApiError(err, 'No se pudo conectar con el servidor.');
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
      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <Input
          label="Correo"
          type="email"
          name="email"
          placeholder="nombre@correo.com"
          value={email}
          error={fieldErrors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearField('email');
          }}
          required
        />
        <Input
          label="Contraseña"
          type="password"
          name="password"
          value={password}
          error={fieldErrors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearField('password');
          }}
          required
        />
        <FormError message={formError} />
        <Button type="submit" loading={loading}>Entrar</Button>
      </form>
      <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--ink-muted)' }}>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </AuthLayout>
  );
}
