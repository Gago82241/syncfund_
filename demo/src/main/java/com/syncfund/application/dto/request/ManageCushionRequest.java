package com.syncfund.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

/** Datos para PersonalWallet.manageCushion(amount, type). type: "APARTAR" | "LIBERAR". */
@Data
public class ManageCushionRequest {
    @Positive(message = "El monto debe ser mayor que cero")
    private double amount;

    @NotBlank(message = "El tipo de operación es obligatorio")
    private String type;
}
