import { Icon, type IconName } from '../../../components/ui/Icon';
import { CatalogCase, CatalogSection } from '../CatalogSection';

const ICONS: { name: IconName; use: string }[] = [
  { name: 'resumen', use: 'Resumen' },
  { name: 'billetera', use: 'Billetera' },
  { name: 'proyectos', use: 'Proyectos' },
  { name: 'categorias', use: 'Categorías' },
  { name: 'agregar', use: 'Agregar' },
  { name: 'cerrar', use: 'Cerrar' },
  { name: 'flecha', use: 'Flecha' },
  { name: 'cuenta', use: 'Cuenta' },
];

export function IconSection() {
  return (
    <CatalogSection
      id="iconos"
      title="Íconos"
      description="SVG propio con trazo de 1.5 en el color del texto. Sin label son decorativos (aria-hidden); con label se anuncian como imagen."
    >
      <CatalogCase label="Tamaño por defecto (1.25rem), color del texto">
        <ul className="catalog-icons">
          {ICONS.map((icon) => (
            <li key={icon.name} className="catalog-icons__item">
              <Icon name={icon.name} />
              <span>{icon.use}</span>
            </li>
          ))}
        </ul>
      </CatalogCase>
      <CatalogCase label="2rem en azul tinta (hereda color) y con label para lector de pantalla">
        <span className="catalog-icons__large">
          {ICONS.map((icon) => (
            <Icon key={icon.name} name={icon.name} size="2rem" label={icon.use} />
          ))}
        </span>
      </CatalogCase>
    </CatalogSection>
  );
}
