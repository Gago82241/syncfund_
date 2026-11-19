import { Link } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { MoneyStatus } from '../../../components/ui/MoneyStatus';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { ProjectLine } from '../projectLines';
import './ProjectStatusList.css';

interface Props {
  projects: ProjectLine[];
  /** Muestra a quién le debes en los renglones con deuda (la lista de Proyectos; el Resumen ya
   *  lo dice en su aviso de deuda). */
  showPayees?: boolean;
  /** El saldo entra con un fundido al reemplazar a "Cargando saldo". Solo en la lista de Proyectos:
   *  en el Resumen los saldos llegan con la página y el fundido no reemplazaría nada. */
  fadeInBalances?: boolean;
}

/** "Le debes a Laura Gómez" o "Le debes a 2 integrantes". */
function payeesText(payees: readonly string[]): string {
  return payees.length === 1 ? `Le debes a ${payees[0]}` : `Le debes a ${payees.length} integrantes`;
}

/**
 * Un renglón por proyecto con tu situación; todo el renglón lleva al Detalle.
 * Lo usan el Resumen y la lista de Proyectos compartidos.
 * Si tu saldo no cargó, el renglón lo dice en texto y no muestra ninguna cifra; mientras llega,
 * dice "Cargando saldo".
 */
export function ProjectStatusList({ projects, showPayees, fadeInBalances }: Props) {
  const fadeClass = fadeInBalances ? 'sf-fade-in' : undefined;
  return (
    <ul className="project-status-list">
      {projects.map((project) => (
        <li key={project.projectId}>
          <Link to={`/projects/${project.projectId}`} className="project-status-list__row">
            <span className="project-status-list__text">
              {/* title: el nombre completo para quien ve la elipsis (el lector ya lo oye entero). */}
              <span className="project-status-list__name" title={project.name}>
                {project.name}
              </span>
              <span className="project-status-list__meta">
                {project.memberCount} {project.memberCount === 1 ? 'integrante' : 'integrantes'}
                {project.isAdmin && (
                  <span className="project-status-list__role">
                    <span className="visually-hidden">, </span>Administrador
                  </span>
                )}
              </span>
              {showPayees && project.payees.length > 0 && (
                <span className="project-status-list__payees">{payeesText(project.payees)}</span>
              )}
            </span>
            <span className="project-status-list__end">
              {project.balanceLoading ? (
                <span className="project-status-list__loading">
                  <span className="visually-hidden">Cargando saldo</span>
                  <Skeleton width="6rem" />
                </span>
              ) : project.net === null ? (
                <span className={['project-status-list__unknown', fadeClass].filter(Boolean).join(' ')}>Saldo sin cargar</span>
              ) : (
                // En Proyectos, el monto reemplaza a "Cargando saldo" con un fundido corto, sin mover el renglón.
                <span className={fadeClass}>
                  <MoneyStatus amount={project.net} />
                </span>
              )}
              <Icon name="flecha" size="1rem" className="project-status-list__arrow" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
