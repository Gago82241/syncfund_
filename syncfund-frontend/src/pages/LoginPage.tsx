import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Button } from '../components/ui/Button';
import { FormError } from '../components/ui/FormError';
import { authService } from '../features/auth/services/authService';
import { useAuth } from '../context/useAuth';
import { useFormErrors } from '../hooks/useFormErrors';
import { email as validateEmail, required } from '../utils/validation';
import { CONNECTION_ERROR_MESSAGE } from '../utils/apiError';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { SLOW_HINT_MESSAGE, useSlowHint } from '../hooks/useSlowHint';
import { clearSessionExpired, isSessionExpiredMarked } from '../utils/authStorage';

/** El backend responde 422 "Credenciales inválidas" sin decir cuál de los dos falló, a propósito. */
const WRONG_CREDENTIALS_MESSAGE = 'Correo o contraseña incorrectos. Revisa los dos e inténtalo de nuevo.';

/** Estado con el que llega desde el Registro cuando el correo ya tenía cuenta. */
interface LoginLocationState {
  email?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  useDocumentTitle('Inicia sesión · SyncFund');
  // Desde "Inicia sesión con este correo" el correo llega escrito y el foco va a la contraseña.
  const [prefilledEmail] = useState(() => (location.state as LoginLocationState | null)?.email ?? '');
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const slow = useSlowHint(loading);
  // Llegó aquí porque el backend rechazó una sesión guardada: se dice una vez, sin tono de error.
  // Se lee al montar y se borra en el efecto (el inicializador puede correr dos veces en desarrollo).
  const [sessionExpired] = useState(isSessionExpiredMarked);
  useEffect(() => {
    clearSessionExpired();
  }, []);
  const formErrorRef = useRef<HTMLParagraphElement>(null);
  const { fieldErrors, formError, formRef, validate, showApiError, showFormError, clearField } =
    useFormErrors(['email', 'password']);

  // Un error general (credenciales o conexión) recibe el foco: el botón se desactivó al enviar
  // y el lector de pantalla debe saber qué pasó y dónde quedó.
  useEffect(() => {
    if (formError) formErrorRef.current?.focus();
  }, [formError]);

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
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        showFormError(WRONG_CREDENTIALS_MESSAGE);
      } else {
        showApiError(err, CONNECTION_ERROR_MESSAGE);
      }
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="auth-form__title">Inicia sesión</h1>
      <p className="auth-form__lead">Usa el correo con el que te registraste.</p>
      {sessionExpired && (
        <p className="auth-form__notice">Tu sesión venció. Vuelve a entrar para seguir.</p>
      )}
      <form ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={loading || undefined}>
        <Input
          label="Correo electrónico"
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          enterKeyHint="next"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          readOnly={loading}
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
          enterKeyHint="go"
          autoFocus={prefilledEmail !== ''}
          value={password}
          readOnly={loading}
          error={fieldErrors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearField('password');
          }}
          required
        />
        <FormError ref={formErrorRef} message={formError} />
        <Button type="submit" loading={loading} loadingText="Entrando…">Entrar</Button>
        {/* Región viva siempre presente: si naciera con el texto, el lector podría no anunciarlo. */}
        <p className="auth-form__slow" aria-live="polite">{slow ? SLOW_HINT_MESSAGE : ''}</p>
      </form>
      <p className="auth-form__switch">
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
      <p className="auth-form__note">
        ¿Olvidaste tu contraseña? Por ahora SyncFund no permite recuperarla desde la app.
      </p>
    </AuthLayout>
  );
}
