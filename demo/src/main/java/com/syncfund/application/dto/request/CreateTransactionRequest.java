package com.syncfund.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

/**
 * Datos de entrada para crear una Transaction (atributos del diagrama de clases).
 * type: "INGRESO" | "GASTO". originWalletType: "PERSONAL" | "SHARED".
 */
@Data
public class CreateTransactionRequest {
    @Positive
    private double amount;

    @NotBlank
    private String description;

    @NotBlank
    private String type;

    @NotNull
    private Long originWalletId;

    @NotBlank
    private String originWalletType;

    private List<Long> involvedIdsList;
    private Long categoryId;
    private boolean allowOverdraft = false;
}
