package com.syncfund.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Resultado de DebtCalculator.determineNetBalance(). */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NetBalanceResponse {
    private Long userId;
    private Long projectId;
    private double netBalance; // positivo: a favor | negativo: deuda | 0: en paz y salvo
}
