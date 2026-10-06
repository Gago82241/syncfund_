package com.syncfund.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long transactionId;
    private double amount;
    private String description;
    private LocalDateTime dateTime;
    private String type;
    private Long originWalletId;
    private String originWalletType;
    private List<Long> involvedIdsList;
    private Long categoryId;
}
