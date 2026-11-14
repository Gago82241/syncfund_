import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { motion } from '../../styles/theme';
import { Icon } from './Icon';
import './Panel.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface PanelProps {
  open: boolean;
  /** Se llama con Esc, con el botón Cerrar o al tocar el velo. El padre pone open=false. */
  onClose: () => void;
  title: string;
  /** Una línea bajo el título (ej. la regla que aplica antes de llenar el formulario). */
  description?: string;
  children: ReactNode;
  /** Acciones fijas al pie (ej. Cancelar / Guardar). */
  footer?: ReactNode;
}

/**
 * Panel lateral derecho en escritorio (desde 1024 px) y hoja que sube desde abajo en el celular.
 * Usa el <dialog> nativo con showModal(): el navegador atrapa el foco y deja el resto de la
 * página inerte. Al cerrar, el foco vuelve al botón que lo abrió.
 * Para empezar en un campo, márcalo con data-autofocus.
 */
export function Panel({ open, onClose, title, description, children, footer }: PanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const pressStartedOnBackdrop = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.removeAttribute('data-closing');
      dialog.showModal();
      // showModal enfoca el primer control (el botón Cerrar). Si el contenido marca un campo
      // con data-autofocus, se enfoca ese: el autoFocus de React actúa al montar, no al abrir.
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
      return;
    }

    if (!open && dialog.open) {
      // Anima la salida y solo entonces cierra. El temporizador cubre el caso en que la
      // animación no llegue a correr (pestaña en segundo plano, reducir movimiento).
      dialog.setAttribute('data-closing', '');
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        dialog.removeAttribute('data-closing');
        if (dialog.open) dialog.close();
      };
      const onEnd = (event: AnimationEvent) => {
        if (event.target === dialog) finish();
      };
      dialog.addEventListener('animationend', onEnd);
      const timer = window.setTimeout(finish, motion.panel + 100);
      return () => {
        dialog.removeEventListener('animationend', onEnd);
        window.clearTimeout(timer);
        finish();
      };
    }
  }, [open]);

  // Si el componente se desmonta abierto, cierra el diálogo para no dejar la página inerte.
  useEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    // Esc: en vez del cierre instantáneo del navegador, se pide al padre para animar la salida.
    event.preventDefault();
    onClose();
  }

  function handleClose() {
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (target?.isConnected) target.focus();
    // Si el navegador lo cerró por su cuenta (p. ej. Esc repetido), avisa al padre.
    if (open) onClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    // El dialog nativo deja que Tab salga a la barra del navegador antes de volver.
    // Aquí el foco da la vuelta dentro del panel: del último control al primero y al revés.
    if (event.key !== 'Tab') return;
    const focusables = [...event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDialogElement>) {
    pressStartedOnBackdrop.current = event.target === event.currentTarget;
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    // El contenido ocupa todo el diálogo; un clic cuyo destino es el propio diálogo cayó en el velo.
    // Se exige que la pulsación también empiece ahí: seleccionar texto y soltar afuera no cierra.
    if (event.target === event.currentTarget && pressStartedOnBackdrop.current) onClose();
    pressStartedOnBackdrop.current = false;
  }

  return (
    <dialog
      ref={dialogRef}
      className="sf-panel"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={handleCancel}
      onClose={handleClose}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onClick={handleBackdropClick}
    >
      <div className="sf-panel__surface">
        <div className="sf-panel__header">
          <div className="sf-panel__heading">
            <h2 id={titleId} className="sf-panel__title">{title}</h2>
            {description && (
              <p id={descriptionId} className="sf-panel__description">{description}</p>
            )}
          </div>
          <button type="button" className="sf-panel__close" onClick={onClose}>
            <Icon name="cerrar" />
            <span>Cerrar</span>
          </button>
        </div>
        <div className="sf-panel__body">{children}</div>
        {footer && <div className="sf-panel__footer">{footer}</div>}
      </div>
    </dialog>
  );
}
