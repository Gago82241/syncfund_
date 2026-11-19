package com.syncfund.application.dto.request;

/**
 * Tope de los montos que se reciben: las columnas de dinero son DECIMAL(12,2), que admite hasta
 * 9.999.999.999,99. Un valor mayor no cabe y MySQL lo rechaza con un error 500.
 *
 * Solo se limita el tamaño, no los decimales: MySQL redondea a 2 decimales, como hasta ahora.
 */
public final class AmountLimit {

    /** Valor para @DecimalMax. */
    public static final String MAX = "9999999999.99";

    private AmountLimit() {
    }
}
