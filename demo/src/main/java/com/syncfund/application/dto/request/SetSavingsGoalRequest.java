package com.syncfund.application.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

/** Datos para fijar PersonalWallet.monthlySavingsGoal. */
@Data
public class SetSavingsGoalRequest {
    @PositiveOrZero(message = "La meta de ahorro no puede ser negativa")
    @DecimalMax(value = AmountLimit.MAX, message = "La meta de ahorro no puede superar $9.999.999.999")
    private double monthlySavingsGoal;
}
