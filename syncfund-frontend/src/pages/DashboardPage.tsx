import { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { userService } from '../features/users/services/userService';
import { formatCOP } from '../styles/theme';

export function DashboardPage() {
  const { user } = useAuth();
  // Arranca con el valor del login (por si la petición tarda) pero se
  // reemplaza de inmediato con el saldo real, recalculado en el backend.
  const [summary, setSummary] = useState<number | null>(user?.generalSummary ?? null);

  useEffect(() => {
    if (!user) return;
    userService.getSummary(user.id).then(({ data }) => setSummary(data));
  }, [user]);

  if (!user) return null;

  return (
    <AppLayout>
      <h2>Hola, {user.name.split(' ')[0]}</h2>
      <p style={{ color: 'var(--ink-muted)', marginTop: '0.5rem' }}>
        Este es tu saldo general en SyncFund.
      </p>
      <p
        className="tabular-nums"
        style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginTop: '1.5rem' }}
      >
        {summary !== null ? formatCOP(summary) : 'Cargando...'}
      </p>
    </AppLayout>
  );
}
