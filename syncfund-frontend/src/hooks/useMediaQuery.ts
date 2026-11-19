import { useSyncExternalStore } from 'react';

/** true mientras la consulta de medios se cumple (ej. "(max-width: 639px)"); se actualiza sola. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
