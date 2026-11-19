package com.syncfund.application.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

/** Datos para SharedProject.settleDebts(payerId, payeeId, amount): un integrante le paga a otro. */
@Data
public class SettleDebtRequest {
    @NotNull(message = "Quien paga es obligatorio")
    private Long payerId;

    @NotNull(message = "Quien recibe el pago es obligatorio")
    private Long payeeId;

    @Positive(message = "El monto debe ser mayor que cero")
    @DecimalMax(value = AmountLimit.MAX, message = "El monto no puede superar $9.999.999.999")
    private double amount;
}
