package com.syncfund.application.service;

import com.syncfund.application.dto.request.CreateCategoryRequest;
import com.syncfund.application.dto.response.CategoryResponse;
import com.syncfund.application.exception.ResourceNotFoundException;
import com.syncfund.application.mapper.CategoryMapper;
import com.syncfund.domain.model.Category;
import com.syncfund.domain.model.Transaction;
import com.syncfund.persistence.repository.CategoryRepository;
import com.syncfund.persistence.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

/** Orquesta Category: create, listado, calculateTotalExpense + alertExcess. */
@Service
public class CategoryAppService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryMapper mapper;

    public CategoryAppService(CategoryRepository categoryRepository,
                               TransactionRepository transactionRepository,
                               CategoryMapper mapper) {
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.mapper = mapper;
    }

    @Transactional
    public CategoryResponse create(CreateCategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setMonthlyLimit(request.getMonthlyLimit());
        return mapper.toResponse(categoryRepository.save(category));
    }

    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll().stream().map(mapper::toResponse).toList();
    }

    public CategoryResponse findById(Long id) {
        return mapper.toResponse(getCategoryOrThrow(id));
    }

    /**
     * Category.calculateTotalExpense(walletId, month) + Category.alertExcess(currentAmount).
     * Retorna el total gastado en la categoría, para esa billetera, en el mes dado.
     */
    public double calculateTotalExpense(Long categoryId, Long walletId, String walletType, YearMonth month) {
        Category category = getCategoryOrThrow(categoryId);

        LocalDateTime start = month.atDay(1).atStartOfDay();
        LocalDateTime end = month.atEndOfMonth().atTime(23, 59, 59);

        List<Transaction> transactions = transactionRepository
                .findByOriginWalletIdAndOriginWalletTypeAndDateTimeBetween(
                        walletId, Transaction.OriginWalletType.valueOf(walletType.toUpperCase()), start, end);

        return category.calculateTotalExpense(transactions);
    }

    public boolean isOverLimit(Long categoryId, double currentAmount) {
        return getCategoryOrThrow(categoryId).alertExcess(currentAmount);
    }

    private Category getCategoryOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + id));
    }
}
