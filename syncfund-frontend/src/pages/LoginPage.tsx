import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Button } from '../components/ui/Button';
import { FormError } from '../components/ui/FormError';
import { authService } from '../features/auth/services/authService';
import { useAuth } from '../context/useAuth';
import { useFormErrors } from '../hooks/useFormErrors';
import { email as validateEmail, required } from '../utils/validation';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  useDocumentTitle('Inicia sesión · SyncFund');
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
      // replace: con "Atrás" no se vuelve al formulario de login estando dentro.
      navigate('/dashboard', { replace: true });
    } catch (err) {
      showApiError(err, 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="auth-form__title">Inicia sesión</h1>
      <p className="auth-form__lead">
        Entra para ver tu billetera y tus proyectos.
      </p>
      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <Input
          label="Correo"
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          error={fieldErrors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearField('email');
          }}
          required
        />
        <PasswordInput
          label="Contraseña"
          name="password"
          autoComplete="current-password"
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
      <p className="auth-form__switch">
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </AuthLayout>
  );
}
