package com.syncfund.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

/** Datos para SharedProject.distributeContribution(amount, contributorId). */
@Data
public class DistributeContributionRequest {
    @Positive
    private double amount;

    @NotNull
    private Long contributorId;

    @NotBlank
    private String description;
}
