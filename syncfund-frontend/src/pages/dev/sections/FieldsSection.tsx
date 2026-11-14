import { useState } from 'react';
import { MoneyInput } from '../../../components/ui/MoneyInput';
import { PasswordInput } from '../../../components/ui/PasswordInput';
import { formatCOP } from '../../../styles/theme';
import { wholeAmount } from '../../../utils/validation';
import { CatalogCase, CatalogSection } from '../CatalogSection';

export function FieldsSection() {
  const [contribution, setContribution] = useState('');
  const [income, setIncome] = useState('2400000');
  const [expense, setExpense] = useState('');
  const [payment, setPayment] = useState('33333.33');
  const [checked, setChecked] = useState('');
  const [checkedError, setCheckedError] = useState<string>();

  return (
    <>
      <CatalogSection
        id="monto"
        title="Campo de monto (MoneyInput)"
        description="Escribe 50000: se ve 50.000 y debajo la frase en vivo. Mueve el cursor al medio y borra o escribe: no debe saltar al final. Las letras se descartan. En el celular abre el teclado numérico."
      >
        <div className="catalog__grid">
          <CatalogCase label="Con frase en vivo">
            <MoneyInput
              label="Monto del aporte"
              name="catalog-contribution"
              value={contribution}
              onValueChange={setContribution}
              preview={(v) => `Vas a aportar ${formatCOP(v)}`}
              hint="Sale de tu billetera personal."
            />
          </CatalogCase>
          <CatalogCase label="Valor crudo que recibe el formulario">
            <p className="catalog-raw tabular-nums">
              value = &quot;{contribution}&quot;
            </p>
          </CatalogCase>
          <CatalogCase label="Ingreso (borde esmeralda)">
            <MoneyInput label="Monto" name="catalog-income" value={income} onValueChange={setIncome} tone="gain" />
          </CatalogCase>
          <CatalogCase label="Gasto (borde terracota)">
            <MoneyInput label="Monto" name="catalog-expense" value={expense} onValueChange={setExpense} tone="loss" />
          </CatalogCase>
          <CatalogCase label="Con decimales (pago entre integrantes): coma decimal, máximo 2">
            <MoneyInput
              label="Monto del pago"
              name="catalog-payment"
              value={payment}
              onValueChange={setPayment}
              allowDecimals
              preview={(v) => `Vas a pagar ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(v)}`}
            />
          </CatalogCase>
          <CatalogCase label="Validado con wholeAmount al salir del campo">
            <MoneyInput
              label="Límite mensual"
              name="catalog-limit"
              value={checked}
              onValueChange={(raw) => {
                setChecked(raw);
                if (checkedError) setCheckedError(wholeAmount(raw));
              }}
              onBlur={() => setCheckedError(wholeAmount(checked))}
              error={checkedError}
            />
          </CatalogCase>
          <CatalogCase label="Deshabilitado">
            <MoneyInput label="Fondo disponible" name="catalog-fund" value="450000" onValueChange={() => {}} disabled />
          </CatalogCase>
        </div>
      </CatalogSection>

      <CatalogSection
        id="contrasena"
        title="Campo de contraseña"
        description="El botón alterna entre Mostrar y Ocultar sin enviar el formulario. Con el gestor de contraseñas del navegador, debe ofrecer completar."
      >
        <form className="catalog__grid" onSubmit={(e) => e.preventDefault()} aria-label="Ejemplo de contraseña">
          <CatalogCase label="Inicio de sesión (current-password)">
            <PasswordInput label="Contraseña" name="catalog-password" autoComplete="current-password" />
          </CatalogCase>
          <CatalogCase label="Registro con ayuda y error (new-password)">
            <PasswordInput
              label="Contraseña nueva"
              name="catalog-new-password"
              autoComplete="new-password"
              hint="Mínimo 8 caracteres."
              error="La contraseña debe tener al menos 8 caracteres"
              defaultValue="abc"
            />
          </CatalogCase>
        </form>
      </CatalogSection>
    </>
  );
}
