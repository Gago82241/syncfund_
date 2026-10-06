package com.syncfund.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

/** Datos para SharedProject.registerSelectiveExpense(amount, payerId, involvedIdsList). */
@Data
public class RegisterSelectiveExpenseRequest {
    @Positive
    private double amount;

    @NotNull
    private Long payerId;

    @NotEmpty
    private List<Long> involvedIdsList;

    @NotBlank
    private String description;

    private Long categoryId; // opcional
}
