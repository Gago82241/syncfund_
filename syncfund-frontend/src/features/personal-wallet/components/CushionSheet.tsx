import { Sheet } from '../../../components/ui/Sheet';
import { formatCOP } from '../../../styles/theme';
import './WalletSheets.css';

interface Props {
  cushion: number;
  onManage: () => void;
}

/** Qué es el colchón y cuánto hay apartado; apartar o liberar se hace en un panel. */
export function CushionSheet({ cushion, onManage }: Props) {
  return (
    <Sheet
      title="Colchón"
      action={
        <button type="button" className="wallet-sheet__action" onClick={onManage}>
          Apartar o liberar
        </button>
      }
    >
      <p className="wallet-sheet__intro">
        Dinero que apartas de tu disponible para no gastarlo. Sigue siendo tuyo y cuenta en tu total.
      </p>
      <dl className="wallet-sheet__row">
        <dt className="wallet-sheet__term">Apartado</dt>
        <dd className="wallet-sheet__amount tabular-nums">{formatCOP(cushion)}</dd>
      </dl>
    </Sheet>
  );
}
