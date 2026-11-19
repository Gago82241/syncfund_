package com.syncfund.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Situación de un integrante dentro de un proyecto compartido (DebtCalculator.calculateBalances).
 * Solo cifras del proyecto: nunca el correo ni el saldo de su billetera personal.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberBalanceResponse {
    private Long userId;
    private String name;
    private double contributed;
    private double shareOfExpenses;
    private double paymentsMade;
    private double paymentsReceived;
    private double netBalance; // positivo: a favor | negativo: debe | 0: al día
}
