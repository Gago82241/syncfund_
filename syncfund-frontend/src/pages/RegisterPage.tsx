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
import {
  EMAIL_MAX,
  NAME_MAX,
  maxLength,
  minLength,
  newEmail,
  passwordBytes,
  required,
} from '../utils/validation';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  useDocumentTitle('Crea tu cuenta · SyncFund');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { fieldErrors, formError, formRef, validate, showApiError, clearField } =
    useFormErrors(['name', 'email', 'password']);

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
    try {
      // Sin espacios al inicio o al final: un espacio en el correo crearía otra variante de la cuenta.
      // La contraseña se envía tal cual.
      const { data } = await authService.register({ name: name.trim(), email: email.trim(), password });
      login(data);
      // replace: con "Atrás" no se vuelve al formulario de registro estando dentro.
      navigate('/dashboard', { replace: true });
    } catch (err) {
      showApiError(err, 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="auth-form__title">Crea tu cuenta</h1>
      <p className="auth-form__lead">
        Te creamos una billetera personal para tus ingresos y gastos; luego puedes crear proyectos o unirte a uno.
      </p>
      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <Input
          label="Nombre"
          name="name"
          autoComplete="name"
          autoCapitalize="words"
          maxLength={NAME_MAX}
          value={name}
          error={fieldErrors.name}
          onChange={(e) => {
            setName(e.target.value);
            clearField('name');
          }}
          required
        />
        <Input
          label="Correo"
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={EMAIL_MAX}
          value={email}
          error={fieldErrors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearField('email');
          }}
          required
        />
        {/* Sin maxLength: cortar en silencio una clave pegada o generada dejaría al gestor
            guardando una distinta de la real. El largo lo revisa passwordBytes al enviar. */}
        <PasswordInput
          label="Contraseña"
          name="password"
          autoComplete="new-password"
          hint="Mínimo 6 caracteres"
          value={password}
          error={fieldErrors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearField('password');
          }}
          required
        />
        <FormError message={formError} />
        <Button type="submit" loading={loading}>Crear cuenta</Button>
      </form>
      <p className="auth-form__switch">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </AuthLayout>
  );
}
