import { Link } from 'react-router-dom';
import { MoneyStatus } from '../../../components/ui/MoneyStatus';
import type { ProjectLine } from '../summary';
import './ProjectStatusList.css';

/** Un renglón por proyecto con tu estado; cada renglón lleva al Detalle. */
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
              </span>
            </span>
            <MoneyStatus amount={project.net} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
