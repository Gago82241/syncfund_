package com.syncfund.application.mapper;

import com.syncfund.application.dto.response.PersonalWalletResponse;
import com.syncfund.domain.model.PersonalWallet;
import org.springframework.stereotype.Component;

@Component
public class PersonalWalletMapper {
    public PersonalWalletResponse toResponse(PersonalWallet wallet) {
        return new PersonalWalletResponse(
                wallet.getWalletId(),
                wallet.getName(),
                wallet.getCurrentBalance(),
                wallet.getMonthlySavingsGoal(),
                wallet.getCushionBalance(),
                wallet.getOwner() != null ? wallet.getOwner().getId() : null
        );
    }
}
