package com.syncfund.application.service;

import com.syncfund.application.dto.request.CreateCategoryRequest;
import com.syncfund.application.dto.response.CategoryResponse;
import com.syncfund.application.exception.BusinessException;
import com.syncfund.application.exception.ForbiddenException;
import com.syncfund.application.exception.ResourceNotFoundException;
import com.syncfund.application.mapper.CategoryMapper;
import com.syncfund.domain.model.Category;
import com.syncfund.domain.model.PersonalWallet;
import com.syncfund.domain.model.SharedProject;
import com.syncfund.domain.model.Transaction;
import com.syncfund.domain.model.User;
import com.syncfund.persistence.repository.CategoryRepository;
import com.syncfund.persistence.repository.PersonalWalletRepository;
import com.syncfund.persistence.repository.SharedProjectRepository;
import com.syncfund.persistence.repository.TransactionRepository;
import com.syncfund.persistence.repository.UserRepository;
import com.syncfund.security.CurrentUserProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

/**
 * Orquesta Category: create, listado, calculateTotalExpense + alertExcess.
 * Cada categoría es privada de su dueño: nadie más puede verla ni usarla,
 * sin importar que conozca el categoryId.
 */
@Service
public class CategoryAppService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final PersonalWalletRepository personalWalletRepository;
    private final SharedProjectRepository sharedProjectRepository;
    private final CategoryMapper mapper;
    private final CurrentUserProvider currentUserProvider;

    public CategoryAppService(CategoryRepository categoryRepository,
                               TransactionRepository transactionRepository,
                               UserRepository userRepository,
                               PersonalWalletRepository personalWalletRepository,
                               SharedProjectRepository sharedProjectRepository,
                               CategoryMapper mapper,
                               CurrentUserProvider currentUserProvider) {
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.personalWalletRepository = personalWalletRepository;
        this.sharedProjectRepository = sharedProjectRepository;
        this.mapper = mapper;
        this.currentUserProvider = currentUserProvider;
    }

    /** El dueño siempre es el usuario autenticado, nunca un dato enviado por el cliente. */
    @Transactional
    public CategoryResponse create(CreateCategoryRequest request) {
        Long currentUserId = currentUserProvider.getUserId();
        User owner = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + currentUserId));

        Category category = new Category();
        category.setName(request.getName());
        category.setMonthlyLimit(request.getMonthlyLimit());
        category.setOwner(owner);
        return mapper.toResponse(categoryRepository.save(category));
    }

    public List<CategoryResponse> findAll() {
        return categoryRepository.findByOwnerId(currentUserProvider.getUserId()).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public CategoryResponse findById(Long id) {
        return mapper.toResponse(getOwnedCategory(id));
    }

    /**
     * Category.calculateTotalExpense(walletId, month) + Category.alertExcess(currentAmount).
     * Retorna el total gastado en la categoría, para esa billetera, en el mes dado.
     */
    public double calculateTotalExpense(Long categoryId, Long walletId, String walletType, YearMonth month) {
        Category category = getOwnedCategory(categoryId);
        Transaction.OriginWalletType type = parseWalletType(walletType);
        requireWalletAccess(walletId, type);

        LocalDateTime start = month.atDay(1).atStartOfDay();
        LocalDateTime end = month.atEndOfMonth().atTime(23, 59, 59);

        List<Transaction> transactions = transactionRepository
                .findByOriginWalletIdAndOriginWalletTypeAndDateTimeBetween(walletId, type, start, end);

        return category.calculateTotalExpense(transactions);
    }

    public boolean isOverLimit(Long categoryId, double currentAmount) {
        return getOwnedCategory(categoryId).alertExcess(currentAmount);
    }

    /** Único punto que verifica el dueño de una categoría: 404 si no existe, 403 si es de otro usuario. */
    public Category getOwnedCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + id));

        if (!category.getOwner().getId().equals(currentUserProvider.getUserId())) {
            throw new ForbiddenException("Esta categoría no te pertenece.");
        }
        return category;
    }

    /** Tu propia billetera personal, o ser miembro del proyecto compartido en cuestión. */
    private void requireWalletAccess(Long walletId, Transaction.OriginWalletType type) {
        Long currentUserId = currentUserProvider.getUserId();

        if (type == Transaction.OriginWalletType.PERSONAL) {
            PersonalWallet wallet = personalWalletRepository.findById(walletId)
                    .orElseThrow(() -> new ResourceNotFoundException("Billetera personal no encontrada: " + walletId));
            if (!wallet.getOwner().getId().equals(currentUserId)) {
                throw new ForbiddenException("Esta billetera personal no te pertenece.");
            }
        } else {
            SharedProject project = sharedProjectRepository.findById(walletId)
                    .orElseThrow(() -> new ResourceNotFoundException("Proyecto compartido no encontrado: " + walletId));
            boolean isMember = project.getMembers().stream().anyMatch(m -> m.getId().equals(currentUserId));
            if (!isMember) {
                throw new ForbiddenException("No perteneces a este proyecto compartido.");
            }
        }
    }

    private Transaction.OriginWalletType parseWalletType(String raw) {
        try {
            return Transaction.OriginWalletType.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException("walletType inválido, use PERSONAL o SHARED.");
        }
    }
}
