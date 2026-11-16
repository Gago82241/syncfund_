import { Link } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { MoneyStatus } from '../../../components/ui/MoneyStatus';
import type { ProjectLine } from '../projectLines';
import './ProjectStatusList.css';

/**
 * Un renglón por proyecto con tu situación; todo el renglón lleva al Detalle.
 * Lo usan el Resumen y la lista de Proyectos compartidos.
 * Si tu saldo no cargó, el renglón lo dice en texto y no muestra ninguna cifra.
 */
export function ProjectStatusList({ projects }: { projects: ProjectLine[] }) {
  return (
    <ul className="project-status-list">
      {projects.map((project) => (
        <li key={project.projectId}>
          <Link to={`/projects/${project.projectId}`} className="project-status-list__row">
            <span className="project-status-list__text">
              <span className="project-status-list__name">{project.name}</span>
              <span className="project-status-list__meta">
                {project.memberCount} {project.memberCount === 1 ? 'integrante' : 'integrantes'}
                {project.isAdmin && (
                  <span className="project-status-list__role">
                    <span className="visually-hidden">, </span>Administrador
                  </span>
                )}
              </span>
            </span>
            <span className="project-status-list__end">
              {project.net === null ? (
                <span className="project-status-list__unknown">Saldo sin cargar</span>
              ) : (
                <MoneyStatus amount={project.net} />
              )}
              <Icon name="flecha" size="1rem" className="project-status-list__arrow" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
