/**
 * Renglones de "Tus proyectos": los usan el Resumen y la lista de Proyectos compartidos, para
 * que el mismo proyecto se describa y se ordene igual en las dos pantallas.
 * Sin React ni peticiones: reciben lo que ya respondió el backend.
 */
import { settle } from './balance';
import type { ProjectBalancesResponse, SharedProjectResponse } from '../../types/api';

export interface ProjectLine {
  projectId: number;
  name: string;
  memberCount: number;
  /** El usuario es el administrador del proyecto. */
  isAdmin: boolean;
  /**
   * Saldo neto del usuario en el proyecto: positivo = a tu favor, negativo = debes.
   * null si no se pudo cargar: nunca se reemplaza por un cero ni por una cifra estimada.
   */
  net: number | null;
}

/**
 * @param balances situación del proyecto (GET /projects/{id}/balances); undefined si no cargó.
 *        Si el usuario no aparece en ella, el saldo también queda en null.
 */
export function toProjectLine(
  userId: number,
  project: SharedProjectResponse,
  balances: ProjectBalancesResponse | undefined,
): ProjectLine {
  const me = balances?.members.find((m) => m.userId === userId);
  return {
    projectId: project.projectId,
    name: project.name,
    memberCount: project.memberIds.length,
    isAdmin: project.adminId === userId,
    net: me ? settle(me.netBalance) : null,
  };
}

/**
 * Grupo de cada renglón, en el orden en que se muestran:
 *   0. Debes: lo primero que hay que resolver.
 *   1. Saldo sin cargar: podría ser una deuda, así que no se esconde al final.
 *   2. A tu favor: la segunda pregunta de la pantalla.
 *   3. Al día: no piden nada.
 */
function group(net: number | null): number {
  if (net === null) return 1;
  if (net < 0) return 0;
  if (net > 0) return 2;
  return 3;
}

/**
 * Debes (la deuda mayor primero) · sin cargar · a tu favor (el mayor primero) · al día.
 * Los empates conservan el orden del backend.
 */
export function sortProjectLines(lines: readonly ProjectLine[]): ProjectLine[] {
  return lines
    .map((line, index) => ({ line, index }))
    .sort((a, b) => {
      const byGroup = group(a.line.net) - group(b.line.net);
      if (byGroup !== 0) return byGroup;
      // En "Debes" y "A tu favor", el monto mayor (en valor absoluto) va primero.
      const byAmount = Math.abs(b.line.net ?? 0) - Math.abs(a.line.net ?? 0);
      return byAmount || a.index - b.index;
    })
    .map(({ line }) => line);
}
