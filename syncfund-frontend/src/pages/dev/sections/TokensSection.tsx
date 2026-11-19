import { colors, motion, spacing } from '../../../styles/theme';
import { contrastRatio } from '../contrast';
import { CatalogCase, CatalogSection } from '../CatalogSection';

const TEXT_TOKENS = [
  { name: 'ink', value: colors.ink, use: 'Texto principal' },
  { name: 'ink-muted', value: colors.inkMuted, use: 'Texto secundario y etiquetas' },
  { name: 'ink-faint', value: colors.inkFaint, use: 'Fechas, metadatos y ayudas' },
  { name: 'ink-900', value: colors.ink900, use: 'Títulos y estructura' },
  { name: 'ink-600', value: colors.ink600, use: 'Enlaces y foco' },
  { name: 'gain-700', value: colors.gain700, use: 'Montos a favor e ingresos' },
  { name: 'loss-700', value: colors.loss700, use: 'Montos en contra, gastos y errores' },
  { name: 'warn-700', value: colors.warn700, use: 'Cerca del límite' },
] as const;

const NON_TEXT_TOKENS = [
  { name: 'field-border', value: colors.fieldBorder, use: 'Borde de campos' },
  { name: 'gain-500', value: colors.gain500, use: 'Bordes y rellenos a favor' },
  { name: 'loss-500', value: colors.loss500, use: 'Bordes y rellenos en contra' },
  { name: 'warn-500', value: colors.warn500, use: 'Relleno de la barra de presupuesto (va con texto warn-700)' },
] as const;

const BACKGROUNDS = [
  { name: 'ledger-50', value: colors.ledger50 },
  { name: 'paper', value: colors.paper },
  { name: 'ink-100', value: colors.ink100 },
  { name: 'loss-100', value: colors.loss100 },
] as const;

function Ratio({ fg, bg, min }: { fg: string; bg: string; min: number }) {
  const ratio = contrastRatio(fg, bg);
  const passes = ratio >= min;
  return (
    <span className={`catalog-tokens__ratio${passes ? '' : ' catalog-tokens__ratio--fail'}`}>
      {ratio.toFixed(2)}:1 {passes ? 'cumple' : 'no cumple'}
    </span>
  );
}

const TYPE_ROLES = [
  { token: '--text-display', label: 'Display, fluida de 2 a 2.75rem', sample: '$ 12.480.000', className: 'catalog-type__display' },
  { token: '--text-headline', label: 'Headline, fluida de 1.5 a 2rem', sample: '$ 1.250.000', className: 'catalog-type__headline' },
  { token: '--text-title', label: 'Title, 1.125rem', sample: 'Situación del proyecto', className: 'catalog-type__title' },
  { token: '--text-body', label: 'Body, 1rem', sample: 'Registra un gasto y el sistema lo reparte entre los integrantes que participaron.', className: 'catalog-type__body' },
  { token: '--text-small', label: 'Small, 0.9375rem', sample: 'Mercado de la semana, 12 de noviembre', className: 'catalog-type__small' },
  { token: '--text-label', label: 'Label, 0.8125rem', sample: 'Monto del aporte', className: 'catalog-type__label' },
] as const;

export function TokensSection() {
  return (
    <>
      <CatalogSection
        id="colores"
        title="Colores"
        description="Contraste calculado en vivo desde theme.ts. Texto: mínimo 4.5:1. Bordes y rellenos: mínimo 3:1."
      >
        <div className="catalog-tokens__table-wrap">
          <table className="catalog-tokens__table">
            <caption className="visually-hidden">Contraste de los colores de texto sobre cada fondo</caption>
            <thead>
              <tr>
                <th scope="col">Texto</th>
                {BACKGROUNDS.map((bg) => (
                  <th scope="col" key={bg.name}>{bg.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TEXT_TOKENS.map((token) => (
                <tr key={token.name}>
                  <th scope="row">
                    <code>{token.name}</code>
                    <span className="catalog-tokens__use">{token.use}</span>
                  </th>
                  {BACKGROUNDS.map((bg) => (
                    <td key={bg.name} style={{ background: bg.value }}>
                      <span className="catalog-tokens__sample tabular-nums" style={{ color: token.value }}>
                        $ 50.000
                      </span>
                      <Ratio fg={token.value} bg={bg.value} min={4.5} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="catalog__subtitle">Solo bordes y rellenos</h3>
        <ul className="catalog-tokens__swatches">
          {NON_TEXT_TOKENS.map((token) => (
            <li key={token.name} className="catalog-tokens__swatch">
              <span className="catalog-tokens__chip" style={{ background: token.value }} aria-hidden="true" />
              <span className="catalog-tokens__swatch-text">
                <code>{token.name}</code>
                <span className="catalog-tokens__use">{token.use}</span>
                <span className="catalog-tokens__use">
                  Papel: <Ratio fg={token.value} bg={colors.ledger50} min={3} />. Blanco:{' '}
                  <Ratio fg={token.value} bg={colors.paper} min={3} />
                </span>
              </span>
            </li>
          ))}
        </ul>
      </CatalogSection>

      <CatalogSection
        id="tipografia"
        title="Tipografía"
        description="Cambia el ancho de la ventana: display y headline crecen de forma fluida, y headline siempre queda por debajo de display."
      >
        {TYPE_ROLES.map((role) => (
          <CatalogCase key={role.token} label={`${role.label} (${role.token})`}>
            <p className={role.className}>{role.sample}</p>
          </CatalogCase>
        ))}
        <CatalogCase label="Cifra muy larga en display: no debe salirse de la pantalla a 320 px">
          <p className="catalog-type__display">$ 1.234.567.890.123</p>
        </CatalogCase>
      </CatalogSection>

      <CatalogSection id="espacios" title="Espacios, radios y sombra">
        <ul className="catalog-space">
          {Object.entries(spacing).map(([name, value]) => (
            <li key={name} className="catalog-space__row">
              <code>--space-{name}</code>
              <span className="catalog-space__bar" style={{ width: value }} aria-hidden="true" />
              <span className="catalog-tokens__use">{value}</span>
            </li>
          ))}
        </ul>
        <div className="catalog-shapes">
          <div className="catalog-shapes__item catalog-shapes__item--sm">4 px: botones y campos</div>
          <div className="catalog-shapes__item catalog-shapes__item--md">8 px: hojas</div>
          <div className="catalog-shapes__item catalog-shapes__item--lg">14 px: chips</div>
          <div className="catalog-shapes__item catalog-shapes__item--float">shadow-float: solo elementos flotantes</div>
        </div>
      </CatalogSection>

      <CatalogSection
        id="movimiento"
        title="Movimiento"
        description={`Pasa el cursor o enfoca cada muestra con Tab: ${motion.fast} ms para toque y cursor, ${motion.panel} ms para paneles, con salida suave. Con "reducir movimiento" activo el cambio es inmediato.`}
      >
        <div className="catalog-motion">
          <div className="catalog-motion__track" tabIndex={0}>
            <span className="catalog-motion__dot catalog-motion__dot--fast" />
            <code>--duration-fast</code>
          </div>
          <div className="catalog-motion__track" tabIndex={0}>
            <span className="catalog-motion__dot catalog-motion__dot--panel" />
            <code>--duration-panel</code>
          </div>
        </div>
      </CatalogSection>
    </>
  );
}
