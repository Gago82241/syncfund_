import { useEffect, useRef, useState } from 'react';
import { RemoveMemberConfirm } from './RemoveMemberConfirm';
import { HALF_CENT } from '../balance';
import { formatCOP } from '../../../styles/theme';
import type { ProjectBalancesResponse, UserResponse } from '../../../types/api';
import './MembersList.css';

interface Props {
  projectId: number;
  projectName: string;
  members: UserResponse[];
  /** Saldos de todos: deciden si se puede eliminar o salir antes de intentarlo. */
  balances: ProjectBalancesResponse;
  adminId: number;
  currentUserId: number;
  /** El admin eliminó a un integrante: hay que recargar el proyecto. */
  onRemoved: (member: UserResponse) => void;
  /** El usuario actual salió: ya no puede ver el proyecto. */
  onLeft: () => void;
}

/**
 * Por qué todavía no se puede eliminar o salir (regla visible antes del error), o null si sí.
 * Sin saldo conocido se deja el botón: el backend decide y explica.
 */
function blockedReason(net: number | undefined, leaving: boolean): string | null {
  if (net === undefined || Math.abs(net) < HALF_CENT) return null;
  const amount = formatCOP(Math.abs(net));
  if (leaving) {
    return net < 0
      ? `Debes ${amount}. Podrás salir cuando estés al día.`
      : `Tienes ${amount} a favor. Podrás salir cuando estés al día.`;
  }
  return net < 0
    ? `Debe ${amount}. Se podrá eliminar cuando esté al día.`
    : `Tiene ${amount} a favor. Se podrá eliminar cuando esté al día.`;
}

/**
 * Integrantes del proyecto. El admin ve "Eliminar" junto a cada uno (nunca junto a sí mismo);
 * quien no es admin ve "Salir del proyecto" en su propia fila. Solo se puede estando al día:
 * si no, en lugar del botón aparece la razón. Ambos piden confirmación en línea.
 */
export function MembersList({
  projectId,
  projectName,
  members,
  balances,
  adminId,
  currentUserId,
  onRemoved,
  onLeft,
}: Props) {
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const isAdmin = currentUserId === adminId;
  const listRef = useRef<HTMLUListElement>(null);
  const actionRefs = useRef(new Map<number, HTMLButtonElement>());
  // Al cancelar, el foco vuelve al botón que abrió la confirmación (que reaparece al cerrarla).
  const returnFocusTo = useRef<number | null>(null);

  useEffect(() => {
    if (confirmingId !== null || returnFocusTo.current === null) return;
    actionRefs.current.get(returnFocusTo.current)?.focus();
    returnFocusTo.current = null;
  }, [confirmingId]);

  const netOf = (userId: number) => balances.members.find((b) => b.userId === userId)?.netBalance;

  return (
    <ul ref={listRef} className="members-list" aria-label="Integrantes del proyecto" tabIndex={-1}>
      {members.map((m) => {
        const isMe = m.id === currentUserId;
        const canRemove = isAdmin && !isMe;
        const canLeave = !isAdmin && isMe;
        const reason = canRemove || canLeave ? blockedReason(netOf(m.id), canLeave) : null;
        const confirming = confirmingId === m.id;
        return (
          <li key={m.id} className="members-list__item">
            <div className="members-list__row">
              <div className="members-list__who">
                <span className="members-list__name">
                  {m.name}
                  {isMe && <span className="members-list__you"> (tú)</span>}
                </span>
                {m.id === adminId && <span className="members-list__role">Administrador</span>}
                {reason && <span className="members-list__rule tabular-nums">{reason}</span>}
              </div>
              {(canRemove || canLeave) && !reason && !confirming && (
                <button
                  ref={(el) => {
                    if (el) actionRefs.current.set(m.id, el);
                    else actionRefs.current.delete(m.id);
                  }}
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
                onCancel={() => {
                  returnFocusTo.current = m.id;
                  setConfirmingId(null);
                }}
                onDone={() => {
                  setConfirmingId(null);
                  if (canLeave) {
                    onLeft();
                  } else {
                    // La fila desaparece: el foco pasa a la lista, que sigue ahí.
                    listRef.current?.focus();
                    onRemoved(m);
                  }
                }}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
