import { useState } from 'react';
import { RemoveMemberConfirm } from './RemoveMemberConfirm';
import type { UserResponse } from '../../../types/api';
import './MembersList.css';

interface Props {
  projectId: number;
  projectName: string;
  members: UserResponse[];
  adminId: number;
  currentUserId: number;
  /** El admin eliminó a un integrante: hay que recargar el proyecto. */
  onRemoved: () => void;
  /** El usuario actual salió: ya no puede ver el proyecto. */
  onLeft: () => void;
}

/**
 * Integrantes del proyecto. El admin ve "Eliminar" junto a cada uno (nunca junto a sí mismo);
 * quien no es admin ve "Salir del proyecto" en su propia fila. Ambos piden confirmación en línea.
 */
export function MembersList({ projectId, projectName, members, adminId, currentUserId, onRemoved, onLeft }: Props) {
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const isAdmin = currentUserId === adminId;

  return (
    <ul className="members-list">
      {members.map((m) => {
        const isMe = m.id === currentUserId;
        const canRemove = isAdmin && !isMe;
        const canLeave = !isAdmin && isMe;
        const confirming = confirmingId === m.id;
        return (
          <li key={m.id} className="members-list__item">
            <div className="members-list__row">
              <span className="members-list__name">
                {m.name}
                {isMe && <span className="members-list__you"> (tú)</span>}
              </span>
              {m.id === adminId && <span className="members-list__role">Administrador</span>}
              {(canRemove || canLeave) && !confirming && (
                <button
                  type="button"
                  className="members-list__action"
                  onClick={() => setConfirmingId(m.id)}
                  aria-label={canLeave ? 'Salir del proyecto' : `Eliminar a ${m.name} del proyecto`}
                >
                  {canLeave ? 'Salir del proyecto' : 'Eliminar'}
                </button>
              )}
            </div>
            {confirming && (
              <RemoveMemberConfirm
                projectId={projectId}
                projectName={projectName}
                member={m}
                leaving={canLeave}
                onCancel={() => setConfirmingId(null)}
                onDone={() => {
                  setConfirmingId(null);
                  if (canLeave) onLeft();
                  else onRemoved();
                }}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
