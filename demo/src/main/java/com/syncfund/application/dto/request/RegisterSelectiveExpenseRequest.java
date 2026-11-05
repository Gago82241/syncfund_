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
    @Positive(message = "El monto debe ser mayor que cero")
    private double amount;

    @NotNull(message = "El pagador es obligatorio")
    private Long payerId;

    @NotEmpty(message = "Debes seleccionar al menos un participante")
    private List<Long> involvedIdsList;

    @NotBlank(message = "La descripción es obligatoria")
    private String description;

    private Long categoryId; // opcional
}
