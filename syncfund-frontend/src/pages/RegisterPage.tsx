import { useEffect, useRef, useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Button } from '../components/ui/Button';
import { FormError } from '../components/ui/FormError';
import { authService } from '../features/auth/services/authService';
import { useAuth } from '../context/useAuth';
import { useFormErrors } from '../hooks/useFormErrors';
import {
  EMAIL_MAX,
  NAME_MAX,
  maxLength,
  minLength,
  newEmail,
  passwordBytes,
  required,
} from '../utils/validation';
import { CONNECTION_ERROR_MESSAGE } from '../utils/apiError';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { SLOW_HINT_MESSAGE, useSlowHint } from '../hooks/useSlowHint';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  useDocumentTitle('Crea tu cuenta · SyncFund');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const slow = useSlowHint(loading);
  // Correo con el que el backend dijo que ya hay cuenta: lo lleva el enlace al Login.
  const [takenEmail, setTakenEmail] = useState('');
  const formErrorRef = useRef<HTMLParagraphElement>(null);
  const { fieldErrors, formError, formRef, validate, showApiError, showFieldError, clearField } =
    useFormErrors(['name', 'email', 'password']);

  // Un error general (sin conexión, error interno) recibe el foco: el botón se desactivó al enviar.
  useEffect(() => {
    if (formError) formErrorRef.current?.focus();
  }, [formError]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = validate({
      name:
        required(name, 'El nombre es obligatorio') ??
        maxLength(name, NAME_MAX, `El nombre puede tener máximo ${NAME_MAX} caracteres`),
      email:
        newEmail(email) ??
        maxLength(email, EMAIL_MAX, `El correo puede tener máximo ${EMAIL_MAX} caracteres`),
      password:
        required(password, 'La contraseña es obligatoria') ??
        minLength(password, 6, 'La contraseña debe tener al menos 6 caracteres') ??
        passwordBytes(password),
    });
    if (!valid) return;
    setLoading(true);
    // Sin espacios al inicio o al final: un espacio en el correo crearía otra variante de la cuenta.
    // La contraseña se envía tal cual.
    const cleanEmail = email.trim();
    try {
      const { data } = await authService.register({ name: name.trim(), email: cleanEmail, password });
      // Con la sesión iniciada, PublicOnlyRoute redirige solo al Resumen, sin estado. flushSync
      // deja que esa redirección ocurra primero, y la navegación de abajo, con welcome, queda
      // como la última.
      flushSync(() => login(data));
      // replace: con "Atrás" no se vuelve al formulario de registro estando dentro.
      // welcome: el Resumen confirma que la cuenta quedó creada (Toast).
      navigate('/dashboard', { replace: true, state: { welcome: true } });
    } catch (err) {
      // En el registro, el único 422 del backend es el correo ya registrado (UserAppService.register).
      // Llega sin errors.email, así que la pantalla lo pone bajo el campo con una salida al Login.
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setTakenEmail(cleanEmail);
        showFieldError('email', 'Ya hay una cuenta con este correo.');
      } else {
        showApiError(err, CONNECTION_ERROR_MESSAGE);
      }
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="auth-form__title">Crea tu cuenta</h1>
      <p className="auth-form__lead">
        Te creamos una billetera personal para tus ingresos y gastos. Para entrar a un proyecto
        compartido, quien lo administra te agrega con este correo.
      </p>
      <form ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={loading || undefined}>
        <Input
          label="Nombre"
          name="name"
          autoComplete="name"
          enterKeyHint="next"
          autoCapitalize="words"
          value={name}
          readOnly={loading}
          error={fieldErrors.name}
          onChange={(e) => {
            setName(e.target.value);
            clearField('name');
          }}
          required
        />
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
          errorAction={
            takenEmail && (
              <Link to="/login" state={{ email: takenEmail }} className="auth-form__error-link">
                Inicia sesión con este correo
              </Link>
            )
          }
          onChange={(e) => {
            setEmail(e.target.value);
            setTakenEmail('');
            clearField('email');
          }}
          required
        />
        {/* Ningún campo lleva maxLength: cortaría en silencio lo que se pega (y el gestor
            guardaría una clave distinta de la real). Los largos los revisan los validadores. */}
        <PasswordInput
          label="Contraseña"
          name="password"
          autoComplete="new-password"
          enterKeyHint="go"
          hint="Mínimo 6 caracteres"
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
        <Button type="submit" loading={loading} loadingText="Creando tu cuenta…">Crear cuenta</Button>
        <p className="auth-form__slow" aria-live="polite">
          {/* El botón se desactiva al enviar y el foco se pierde: el lector oye la espera aquí. */}
          {loading && !slow && <span className="visually-hidden">Creando tu cuenta…</span>}
          {slow && <span className="auth-form__slow-text sf-enter">{SLOW_HINT_MESSAGE}</span>}
        </p>
      </form>
      {/* Mientras se ve "Inicia sesión con este correo", un segundo "Inicia sesión" sobra. */}
      {!(takenEmail && fieldErrors.email) && (
        <p className="auth-form__switch">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      )}
    </AuthLayout>
  );
}
