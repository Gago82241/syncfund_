import { Link } from 'react-router-dom';
import { formatCOP } from '../../../styles/theme';
import type { SharedProjectResponse } from '../../../types/api';
import './ProjectCard.css';

export function ProjectCard({ project }: { project: SharedProjectResponse }) {
  return (
    <Link to={`/projects/${project.projectId}`} className="project-card">
      <div>
        <p className="project-card__name">{project.name}</p>
        <span className="project-card__meta">{project.memberIds.length} integrantes</span>
      </div>
      <span className="project-card__balance tabular-nums">{formatCOP(project.currentBalance)}</span>
    </Link>
  );
}
