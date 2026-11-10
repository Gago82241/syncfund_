package com.syncfund.application.dto.request;

import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

/** Datos para fijar PersonalWallet.monthlySavingsGoal. */
@Data
public class SetSavingsGoalRequest {
    @PositiveOrZero(message = "La meta de ahorro no puede ser negativa")
    private double monthlySavingsGoal;
}
