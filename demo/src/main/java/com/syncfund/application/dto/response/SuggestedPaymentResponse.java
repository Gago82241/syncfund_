package com.syncfund.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Pago sugerido por DebtCalculator.suggestPayments: fromUserId le paga amount a toUserId. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuggestedPaymentResponse {
    private Long fromUserId;
    private Long toUserId;
    private double amount;
}
