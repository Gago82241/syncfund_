package com.syncfund.application.dto.request;

import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

/** Datos para fijar PersonalWallet.monthlySavingsGoal. */
@Data
public class SetSavingsGoalRequest {
    @PositiveOrZero
    private double monthlySavingsGoal;
}
