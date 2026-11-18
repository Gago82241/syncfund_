import { useEffect, useState } from 'react';

/** Mensaje cuando el backend tarda: Railway puede tardar en despertar con mala señal. */
export const SLOW_HINT_MESSAGE = 'Está tardando más de lo normal; seguimos intentando.';

/**
 * true cuando `pending` lleva más de `delayMs` seguido. Vuelve a false en cuanto termina la espera,
 * así un segundo envío no arranca con el aviso puesto.
 */
export function useSlowHint(pending: boolean, delayMs = 6000): boolean {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => setSlow(true), delayMs);
    return () => {
      window.clearTimeout(timer);
      setSlow(false);
    };
  }, [pending, delayMs]);

  return pending && slow;
}
