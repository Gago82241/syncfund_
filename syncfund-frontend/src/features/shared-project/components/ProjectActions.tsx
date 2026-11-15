import { Button } from '../../../components/ui/Button';
import './ProjectActions.css';

interface Props {
  onContribute: () => void;
}

/**
 * Fila de acciones bajo el encabezado del proyecto. "Registrar gasto" es la acción principal
 * (en el encabezado, fija en el celular); aquí van las secundarias.
 */
export function ProjectActions({ onContribute }: Props) {
  return (
    <div className="project-actions">
      <div className="project-actions__buttons">
        <Button variant="ghost" onClick={onContribute}>
          Aportar al fondo
        </Button>
      </div>
    </div>
  );
}
