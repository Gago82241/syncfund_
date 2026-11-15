import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import './Tabs.css';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
}

interface TabsProps<T extends string> {
  /** Nombre del grupo para el lector de pantalla (ej. "Secciones del proyecto"). */
  label: string;
  tabs: readonly TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  /** Contenido de la pestaña activa: solo se monta ese panel. */
  children: ReactNode;
}

/**
 * Pestañas con el patrón WAI-ARIA: una sola pestaña entra en el orden de Tab (tabindex
 * itinerante); las flechas, Inicio y Fin cambian de pestaña y la activan al llegar.
 * La pestaña activa se marca con un filete de 2 px en azul tinta, como el total de un libro.
 */
export function Tabs<T extends string>({ label, tabs, active, onChange, children }: TabsProps<T>) {
  const baseId = useId();
  const tabRefs = useRef(new Map<T, HTMLButtonElement>());
  const tabId = (id: T) => `${baseId}-tab-${id}`;
  const panelId = `${baseId}-panel`;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.id === active);
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = (index + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        next = (index - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const id = tabs[next].id;
    onChange(id);
    tabRefs.current.get(id)?.focus();
  }

  return (
    <div className="sf-tabs">
      <div className="sf-tabs__list" role="tablist" aria-label={label} onKeyDown={handleKeyDown}>
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
                else tabRefs.current.delete(tab.id);
              }}
              type="button"
              role="tab"
              id={tabId(tab.id)}
              className="sf-tabs__tab"
              aria-selected={selected}
              // Solo la pestaña activa tiene panel montado: las demás no apuntan a un id inexistente.
              aria-controls={selected ? panelId : undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        id={panelId}
        role="tabpanel"
        className="sf-tabs__panel"
        aria-labelledby={tabId(active)}
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}
