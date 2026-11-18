import { Sheet } from '../../../components/ui/Sheet';
import { formatCOP } from '../../../styles/theme';
import './WalletSheets.css';

interface Props {
  cushion: number;
  /** Sin esta acción (no hay nada que apartar ni liberar), la hoja solo explica. */
  onManage?: () => void;
}

/**
 * Qué es el colchón y cuánto hay apartado; apartar o liberar se hace en un panel. Es el único
 * lugar de la página que explica el colchón (antes también iba una nota en Movimientos).
 */
export function CushionSheet({ cushion, onManage }: Props) {
  return (
    <Sheet
      title="Colchón"
      action={
        onManage && (
          <button type="button" className="wallet-sheet__action" onClick={onManage}>
            Apartar o liberar
          </button>
        )
      }
    >
      <p className="wallet-sheet__intro">
        Dinero que apartas de tu disponible para no gastarlo. Sigue siendo tuyo y cuenta en tu total.
      </p>
      <p className="wallet-sheet__note">
        {onManage
          ? 'Apartar y liberar no aparecen en Movimientos: solo mueven dinero entre tu disponible y tu colchón.'
          : 'Cuando tengas dinero disponible, podrás apartar una parte aquí.'}
      </p>
      <dl className="wallet-sheet__row">
        <dt className="wallet-sheet__term">Apartado</dt>
        <dd className="wallet-sheet__amount tabular-nums">{formatCOP(cushion)}</dd>
      </dl>
    </Sheet>
  );
}
