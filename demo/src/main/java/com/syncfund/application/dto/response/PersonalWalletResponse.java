package com.syncfund.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalWalletResponse {
    private Long walletId;
    private String name;
    private double currentBalance;
    private double monthlySavingsGoal;
    private double cushionBalance;
    private Long ownerId;
}
