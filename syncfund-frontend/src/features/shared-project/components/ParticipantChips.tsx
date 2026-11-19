import type { ReactNode } from 'react';
import type { UserResponse } from '../../../types/api';
import './ParticipantChips.css';

interface Props {
  members: UserResponse[];
  /** Usuario de la sesión: aparece primero y marcado con "(tú)". */
  currentUserId: number;
  selected: number[];
  onChange: (ids: number[]) => void;
  /** Id del título del grupo, para aria-labelledby. */
  labelId: string;
  /** Id del mensaje que describe el grupo (error), para aria-describedby. */
  describedBy?: string;
  /** Contenido debajo de los chips (división del gasto, error). */
  children?: ReactNode;
}

/**
 * Selección de participantes como chips. Cada chip es una casilla real oculta
 * visualmente, para conservar teclado (Tab, barra espaciadora) y lectores de pantalla.
 */
export function ParticipantChips({
  members,
  currentUserId,
  selected,
  onChange,
  labelId,
  describedBy,
  children,
}: Props) {
  const ordered = [
    ...members.filter((m) => m.id === currentUserId),
    ...members.filter((m) => m.id !== currentUserId),
  ];
  const allSelected = members.length > 0 && members.every((m) => selected.includes(m.id));

  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }

  function toggleAll() {
    onChange(allSelected ? [] : members.map((m) => m.id));
  }

  return (
    <div className="sf-chips" role="group" aria-labelledby={labelId} aria-describedby={describedBy}>
      <div className="sf-chips__header">
        <span id={labelId} className="sf-field__label">
          ¿Quiénes participan de este gasto?
        </span>
        {members.length > 0 && (
          <button type="button" className="sf-chips__toggle" onClick={toggleAll}>
            {allSelected ? 'Quitar a todos' : 'Seleccionar a todos'}
          </button>
        )}
      </div>
      <div className="sf-chips__list">
        {ordered.map((m) => {
          const checked = selected.includes(m.id);
          return (
            <label key={m.id} className={`sf-chip${checked ? ' sf-chip--selected' : ''}`}>
              <input
                type="checkbox"
                name="involvedIdsList"
                className="sf-chip__input"
                checked={checked}
                onChange={() => toggle(m.id)}
              />
              <span className="sf-chip__check" aria-hidden="true">✓</span>
              <span className="sf-chip__name">
                {m.name}
                {m.id === currentUserId && ' (tú)'}
              </span>
            </label>
          );
        })}
      </div>
      {children}
    </div>
  );
}
