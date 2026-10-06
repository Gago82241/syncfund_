package com.syncfund.presentation.controller;

import com.syncfund.application.dto.request.AddMemberRequest;
import com.syncfund.application.dto.request.CreateSharedProjectRequest;
import com.syncfund.application.dto.request.DistributeContributionRequest;
import com.syncfund.application.dto.request.RegisterSelectiveExpenseRequest;
import com.syncfund.application.dto.response.NetBalanceResponse;
import com.syncfund.application.dto.response.SharedProjectResponse;
import com.syncfund.application.dto.response.TransactionResponse;
import com.syncfund.application.service.SharedProjectAppService;
import com.syncfund.application.service.TransactionAppService;
import com.syncfund.application.dto.request.CreateTransactionRequest;
import com.syncfund.application.exception.ForbiddenException;
import com.syncfund.security.CurrentUserProvider;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** SharedProject: addMember, registerSelectiveExpense, distributeContribution, notifyPendingDebt. */
@RestController
@RequestMapping("/api/projects")
public class SharedProjectController {

    private final SharedProjectAppService projectService;
    private final TransactionAppService transactionService;
    private final CurrentUserProvider currentUserProvider;

    public SharedProjectController(SharedProjectAppService projectService,
                                    TransactionAppService transactionService,
                                    CurrentUserProvider currentUserProvider) {
        this.projectService = projectService;
        this.transactionService = transactionService;
        this.currentUserProvider = currentUserProvider;
    }

    @PostMapping
    public ResponseEntity<SharedProjectResponse> create(@Valid @RequestBody CreateSharedProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.create(request));
    }

    @GetMapping("/{id}")
    public SharedProjectResponse getById(@PathVariable Long id) {
        return projectService.getById(id);
    }

    @GetMapping("/user/{userId}")
    public List<SharedProjectResponse> getByMember(@PathVariable Long userId) {
        return projectService.getByMember(userId);
    }

    @PostMapping("/{id}/members")
    public SharedProjectResponse addMember(@PathVariable Long id, @Valid @RequestBody AddMemberRequest request) {
        return projectService.addMember(id, request);
    }

    /** registerSelectiveExpense(amount, payerId, involvedIdsList): se registra como Transaction tipo GASTO. */
    @PostMapping("/{id}/expenses")
    public ResponseEntity<TransactionResponse> registerSelectiveExpense(
            @PathVariable Long id, @Valid @RequestBody RegisterSelectiveExpenseRequest request) {

        if (!currentUserProvider.getUserId().equals(request.getPayerId())) {
            throw new ForbiddenException("No puedes registrar un gasto a nombre de otro usuario como pagador.");
        }

        CreateTransactionRequest txRequest = new CreateTransactionRequest();
        txRequest.setAmount(request.getAmount());
        txRequest.setDescription(request.getDescription());
        txRequest.setType("GASTO");
        txRequest.setOriginWalletId(id);
        txRequest.setOriginWalletType("SHARED");
        txRequest.setInvolvedIdsList(request.getInvolvedIdsList());
        txRequest.setCategoryId(request.getCategoryId());
        txRequest.setAllowOverdraft(true); // un gasto grupal puede dejar el fondo en negativo temporalmente

        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.create(txRequest));
    }

    @PostMapping("/{id}/contributions")
    public SharedProjectResponse distributeContribution(@PathVariable Long id, @Valid @RequestBody DistributeContributionRequest request) {
        return projectService.contribute(id, request);
    }

    /** notifyPendingDebt() + DebtCalculator.determineNetBalance(userId, projectId). */
    @GetMapping("/{id}/debts/{userId}")
    public NetBalanceResponse getNetBalance(@PathVariable Long id, @PathVariable Long userId) {
        return projectService.getNetBalance(id, userId);
    }
}
