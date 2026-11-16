/**
 * Proyectos del usuario con la situación de cada uno (GET /projects/{id}/balances).
 * La lista de proyectos no trae el saldo neto del usuario: hay que pedirlo proyecto por
 * proyecto, en paralelo. Lo usan el Resumen y la lista de Proyectos compartidos.
 */
import { sharedProjectService } from './services/sharedProjectService';
import type { ProjectBalancesResponse, SharedProjectResponse } from '../../types/api';

export interface BalancesResult {
  /** Situación de cada proyecto que sí cargó, por projectId. */
  balances: Map<number, ProjectBalancesResponse>;
  /** Proyectos cuya situación no se pudo cargar. */
  failedIds: number[];
  /** El primer error, para describirlo (describeLoadError) si hace falta. */
  firstError: unknown;
}

export interface ProjectsWithBalances extends BalancesResult {
  projects: SharedProjectResponse[];
}

/** Pide la situación de varios proyectos; uno que falle no tumba a los demás. */
export async function fetchBalances(projectIds: readonly number[]): Promise<BalancesResult> {
  const results = await Promise.allSettled(
    projectIds.map((id) => sharedProjectService.getBalances(id).then((r) => r.data)),
  );
  const balances = new Map<number, ProjectBalancesResponse>();
  const failedIds: number[] = [];
  let firstError: unknown = null;
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      balances.set(projectIds[index], result.value);
    } else {
      failedIds.push(projectIds[index]);
      firstError ??= result.reason;
    }
  });
  return { balances, failedIds, firstError };
}

/** Si falla la lista de proyectos, la promesa se rechaza; si falla un saldo, queda en failedIds. */
export async function fetchProjectsWithBalances(userId: number): Promise<ProjectsWithBalances> {
  const { data: projects } = await sharedProjectService.getByMember(userId);
  const result = await fetchBalances(projects.map((p) => p.projectId));
  return { projects, ...result };
}
