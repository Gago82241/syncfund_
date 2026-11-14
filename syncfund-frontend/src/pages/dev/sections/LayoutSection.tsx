import { AccountMenu } from '../../../components/layout/AccountMenu';
import { useToast } from '../../../components/ui/toast/useToast';
import { CatalogCase, CatalogSection } from '../CatalogSection';

/** Piezas de la estructura de la app con sesión (AppLayout) que se pueden probar sueltas. */
export function LayoutSection() {
  const { showToast } = useToast();

  return (
    <CatalogSection
      id="estructura"
      title="Estructura de la app"
      description="Menú de cuenta de la barra superior del celular. Se abre con el botón, se cierra con Esc (el foco vuelve al botón), al tocar fuera o al salir con Tab. El nombre y el correo largos se cortan con elipsis."
    >
      <CatalogCase label="Nombre corto">
        <div className="catalog-account-frame">
          <AccountMenu
            name="Laura Gómez"
            email="laura@correo.com"
            onLogout={() => showToast('Aquí se cerraría la sesión.')}
          />
        </div>
      </CatalogCase>
      <CatalogCase label="Nombre y correo extremos: no deben salirse a 320 px">
        <div className="catalog-account-frame">
          <AccountMenu
            name="María de los Ángeles Restrepo Villegas de la Cuesta"
            email="maria.de.los.angeles.restrepo.villegas@universidad-ejemplo.edu.co"
            onLogout={() => showToast('Aquí se cerraría la sesión.')}
          />
        </div>
      </CatalogCase>
    </CatalogSection>
  );
}
