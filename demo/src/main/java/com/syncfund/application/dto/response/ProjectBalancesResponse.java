package com.syncfund.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Situación de todos los integrantes de un proyecto compartido.
 * fund = totalBalances + unassigned. unassigned solo es distinto de cero si hay aportes
 * antiguos sin aportante registrado (no cuentan en el saldo de nadie).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectBalancesResponse {
    private Long projectId;
    private double fund;
    private double totalBalances;
    private double unassigned;
    private List<MemberBalanceResponse> members;
    /** Quién debe pagarle a quién para saldar las deudas con la menor cantidad de pagos. */
    private List<SuggestedPaymentResponse> suggestedPayments;
}
