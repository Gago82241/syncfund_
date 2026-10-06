package com.syncfund.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

/** Datos para PersonalWallet.manageCushion(amount, type). type: "APARTAR" | "LIBERAR". */
@Data
public class ManageCushionRequest {
    @Positive
    private double amount;

    @NotBlank
    private String type;
}
