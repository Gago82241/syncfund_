package com.syncfund.presentation.controller;

import com.syncfund.application.dto.request.CategorizeTransactionRequest;
import com.syncfund.application.dto.request.CreateTransactionRequest;
import com.syncfund.application.dto.response.TransactionResponse;
import com.syncfund.application.service.TransactionAppService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/** Transaction: execute() (vía create), getPeriodReport(). */
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionAppService service;

    public TransactionController(TransactionAppService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(@Valid @RequestBody CreateTransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping("/wallet/{walletId}")
    public List<TransactionResponse> getByWallet(@PathVariable Long walletId, @RequestParam String walletType) {
        return service.getByWallet(walletId, walletType);
    }

    @PutMapping("/{id}/category")
    public TransactionResponse categorize(@PathVariable Long id, @Valid @RequestBody CategorizeTransactionRequest request) {
        return service.categorize(id, request);
    }

    @GetMapping("/wallet/{walletId}/report")
    public List<TransactionResponse> getPeriodReport(
            @PathVariable Long walletId,
            @RequestParam String walletType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return service.getPeriodReport(walletId, walletType, start, end);
    }
}
