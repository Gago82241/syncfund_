import { useEffect, useId, useRef, useState, type FocusEvent } from 'react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import './AccountMenu.css';

interface AccountMenuProps {
  name: string;
  email: string;
  onLogout: () => void;
}

/**
 * Menú de cuenta de la barra superior del celular. Es un botón que muestra u oculta un panel
 * (patrón "disclosure", con aria-expanded): no usa role="menu" porque ese rol obliga a moverse
 * con flechas. Se cierra con Esc (el foco vuelve al botón), al tocar fuera o al sacar el foco.
 */
export function AccountMenu({ name, email, onLogout }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Con Tab fuera del menú, se cierra para que no quede abierto tapando el contenido.
  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
  }

  return (
    <div ref={rootRef} className="sf-account-menu" onBlur={handleBlur}>
      <button
        ref={buttonRef}
        type="button"
        className="sf-account-menu__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="cuenta" />
        <span className="sf-account-menu__trigger-name">
          <span className="visually-hidden">Cuenta de </span>
          {name}
        </span>
      </button>

      <div id={panelId} className="sf-account-menu__panel" data-open={open}>
        <p className="sf-account-menu__name">{name}</p>
        <p className="sf-account-menu__email">{email}</p>
        <Button variant="ghost" className="sf-account-menu__logout" onClick={onLogout}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
