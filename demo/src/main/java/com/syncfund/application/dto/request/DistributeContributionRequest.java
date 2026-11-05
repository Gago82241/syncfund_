package com.syncfund.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

/** Datos para SharedProject.distributeContribution(amount, contributorId). */
@Data
public class DistributeContributionRequest {
    @Positive(message = "El monto debe ser mayor que cero")
    private double amount;

    @NotNull(message = "El aportante es obligatorio")
    private Long contributorId;

    @NotBlank(message = "La descripción es obligatoria")
    private String description;
}
