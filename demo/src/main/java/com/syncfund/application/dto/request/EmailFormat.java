package com.syncfund.application.dto.request;

/**
 * Formato exigido a los correos que se crean o se cambian (registro y actualización de usuario).
 * Login y agregar integrante no lo usan: solo buscan cuentas existentes y no deben bloquear las antiguas.
 */
public final class EmailFormat {

    /**
     * Complementa a @Email: exige un punto en el dominio y una terminación de al menos 2 letras.
     * Deja pasar el texto vacío porque @Email con regexp ya no lo acepta: de eso se ocupa @NotBlank
     * en el registro, y en la actualización parcial significa "no cambiar el correo".
     */
    public static final String REGEXP = "^$|.+\\.[A-Za-z]{2,}$";

    private EmailFormat() {
    }
}
