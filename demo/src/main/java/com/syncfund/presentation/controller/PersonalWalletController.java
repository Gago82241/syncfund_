package com.syncfund.presentation.controller;

import com.syncfund.application.dto.request.ManageCushionRequest;
import com.syncfund.application.dto.request.SetSavingsGoalRequest;
import com.syncfund.application.dto.response.PersonalWalletResponse;
import com.syncfund.application.service.PersonalWalletAppService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

/** PersonalWallet: adjustPrivateBudget, verifySpendingLimit, manageCushion. */
@RestController
@RequestMapping("/api/wallets/personal")
public class PersonalWalletController {

    private final PersonalWalletAppService service;

    public PersonalWalletController(PersonalWalletAppService service) {
        this.service = service;
    }

    @GetMapping("/user/{userId}")
    public PersonalWalletResponse getByUser(@PathVariable Long userId) {
        return service.getByUserId(userId);
    }

    @PutMapping("/{walletId}/goal")
    public PersonalWalletResponse setGoal(@PathVariable Long walletId, @Valid @RequestBody SetSavingsGoalRequest request) {
        return service.setSavingsGoal(walletId, request);
    }

    @PostMapping("/{walletId}/cushion")
    public PersonalWalletResponse manageCushion(@PathVariable Long walletId, @Valid @RequestBody ManageCushionRequest request) {
        return service.manageCushion(walletId, request);
    }

    @GetMapping("/{walletId}/budget")
    public double adjustPrivateBudget(@PathVariable Long walletId, @RequestParam String frequency) {
        return service.adjustPrivateBudget(walletId, frequency);
    }

    @GetMapping("/{walletId}/spending-limit")
    public boolean verifySpendingLimit(@PathVariable Long walletId, @RequestParam double amount) {
        return service.verifySpendingLimit(walletId, amount);
    }
}
