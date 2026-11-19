package com.syncfund.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Datos para SharedProject.distributeContribution(amount, contributorId). */
@Data
public class DistributeContributionRequest {
    @Positive(message = "El monto debe ser mayor que cero")
    private double amount;

    @NotNull(message = "El aportante es obligatorio")
    private Long contributorId;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 255, message = "La descripción puede tener máximo 255 caracteres")
    private String description;
}
