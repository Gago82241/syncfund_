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
    @Positive(message = "El monto debe ser mayor que cero")
    private double amount;

    @NotBlank(message = "La descripción es obligatoria")
    private String description;

    @NotBlank(message = "El tipo de movimiento es obligatorio")
    private String type;

    @NotNull(message = "La billetera de origen es obligatoria")
    private Long originWalletId;

    @NotBlank(message = "El tipo de billetera de origen es obligatorio")
    private String originWalletType;

    private List<Long> involvedIdsList;
    private Long categoryId;

    /**
     * Se conserva para no cambiar el contrato de la API, pero el backend lo ignora:
     * el sobregiro nunca lo decide el cliente.
     */
    private boolean allowOverdraft = false;
}
