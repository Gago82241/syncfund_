import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { TokensSection } from './sections/TokensSection';
import { IconSection } from './sections/IconSection';
import { ControlsSection } from './sections/ControlsSection';
import { StructureSection } from './sections/StructureSection';
import { MoneySection } from './sections/MoneySection';
import './ComponentCatalogPage.css';

const SECTIONS = [
  { id: 'colores', label: 'Colores' },
  { id: 'tipografia', label: 'Tipografía' },
  { id: 'espacios', label: 'Espacios' },
  { id: 'movimiento', label: 'Movimiento' },
  { id: 'iconos', label: 'Íconos' },
  { id: 'botones', label: 'Botones' },
  { id: 'campos', label: 'Campos' },
  { id: 'encabezado', label: 'Encabezado' },
  { id: 'hojas', label: 'Hojas' },
  { id: 'vacios', label: 'Vacíos' },
  { id: 'esqueleto', label: 'Carga' },
  { id: 'estado', label: 'Estado del saldo' },
  { id: 'progreso', label: 'Progreso' },
];

/**
 * Catálogo de componentes, solo para desarrollo: la ruta existe únicamente cuando
 * import.meta.env.DEV es true (ver AppRouter). Muestra cada componente en todos sus
 * estados para probarlo antes de usarlo en las pantallas.
 */
export default function ComponentCatalogPage() {
  useDocumentTitle('Catálogo de componentes · SyncFund');

  return (
    <div className="catalog">
      <header className="catalog__header">
        <h1 className="catalog__title">Catálogo de componentes</h1>
        <p className="catalog__intro">
          Sistema base de SyncFund. Solo existe en desarrollo. Pruébalo en escritorio y a 375 px de ancho.
        </p>
        <nav aria-label="Secciones del catálogo">
          <ul className="catalog__index">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="catalog__main">
        <TokensSection />
        <IconSection />
        <ControlsSection />
        <StructureSection />
        <MoneySection />
      </main>
    </div>
  );
}
