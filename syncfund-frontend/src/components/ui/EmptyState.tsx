import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import './EmptyState.css';

interface EmptyStateProps {
  title: string;
  /** Una línea que explique qué es o por qué está vacío. */
  description?: string;
  /** El siguiente paso concreto (ej. botón "Crea tu primer proyecto"). */
  action?: ReactNode;
  icon?: IconName;
}

/** Lista vacía o usuario nuevo: en vez de un hueco, dice qué hacer a continuación. */
export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="sf-empty">
      {icon && (
        <span className="sf-empty__icon">
          <Icon name={icon} size="1.5rem" />
        </span>
      )}
      <p className="sf-empty__title">{title}</p>
      {description && <p className="sf-empty__description">{description}</p>}
      {action && <div className="sf-empty__action">{action}</div>}
    </div>
  );
}
