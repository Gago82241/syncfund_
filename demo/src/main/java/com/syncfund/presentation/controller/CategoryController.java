package com.syncfund.presentation.controller;

import com.syncfund.application.dto.request.CreateCategoryRequest;
import com.syncfund.application.dto.response.CategoryResponse;
import com.syncfund.application.service.CategoryAppService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;

/** Category: create, listado, calculateTotalExpense + alertExcess. */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryAppService service;

    public CategoryController(CategoryAppService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CreateCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping
    public List<CategoryResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public CategoryResponse findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/{id}/expense")
    public double calculateTotalExpense(
            @PathVariable Long id,
            @RequestParam Long walletId,
            @RequestParam String walletType,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {
        return service.calculateTotalExpense(id, walletId, walletType, month);
    }

    @GetMapping("/{id}/over-limit")
    public boolean isOverLimit(@PathVariable Long id, @RequestParam double currentAmount) {
        return service.isOverLimit(id, currentAmount);
    }
}
