package com.syncfund.presentation.controller;

import com.syncfund.application.dto.request.AddMemberRequest;
import com.syncfund.application.dto.request.CreateSharedProjectRequest;
import com.syncfund.application.dto.request.DistributeContributionRequest;
import com.syncfund.application.dto.request.RegisterSelectiveExpenseRequest;
import com.syncfund.application.dto.response.NetBalanceResponse;
import com.syncfund.application.dto.response.ProjectBalancesResponse;
import com.syncfund.application.dto.response.SharedProjectResponse;
import com.syncfund.application.dto.response.TransactionResponse;
import com.syncfund.application.service.SharedProjectAppService;
import com.syncfund.application.service.TransactionAppService;
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

    public SharedProjectController(SharedProjectAppService projectService,
                                    TransactionAppService transactionService) {
        this.projectService = projectService;
        this.transactionService = transactionService;
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

    /**
     * registerSelectiveExpense(amount, payerId, involvedIdsList): se registra como Transaction tipo GASTO
     * que paga el fondo del proyecto; si el fondo no alcanza, responde 422. Las verificaciones
     * (pagador, membresía, involucrados) las hace TransactionAppService.
     */
    @PostMapping("/{id}/expenses")
    public ResponseEntity<TransactionResponse> registerSelectiveExpense(
            @PathVariable Long id, @Valid @RequestBody RegisterSelectiveExpenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.registerSelectiveExpense(id, request));
    }

    @PostMapping("/{id}/contributions")
    public SharedProjectResponse distributeContribution(@PathVariable Long id, @Valid @RequestBody DistributeContributionRequest request) {
        return projectService.contribute(id, request);
    }

    /** notifyPendingDebt() + saldo neto del usuario actual (incluye los pagos entre integrantes). */
    @GetMapping("/{id}/debts/{userId}")
    public NetBalanceResponse getNetBalance(@PathVariable Long id, @PathVariable Long userId) {
        return projectService.getNetBalance(id, userId);
    }

    /** DebtCalculator.calculateBalances(sharedProject): situación de todos los integrantes. */
    @GetMapping("/{id}/balances")
    public ProjectBalancesResponse getBalances(@PathVariable Long id) {
        return projectService.getBalances(id);
    }
}
