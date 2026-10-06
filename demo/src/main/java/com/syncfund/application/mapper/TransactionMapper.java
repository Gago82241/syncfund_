package com.syncfund.application.mapper;

import com.syncfund.application.dto.response.TransactionResponse;
import com.syncfund.domain.model.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {
    public TransactionResponse toResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getTransactionId(),
                transaction.getAmount(),
                transaction.getDescription(),
                transaction.getDateTime(),
                transaction.getType().name(),
                transaction.getOriginWalletId(),
                transaction.getOriginWalletType().name(),
                transaction.getInvolvedIdsList(),
                transaction.getCategory() != null ? transaction.getCategory().getCategoryId() : null
        );
    }
}
