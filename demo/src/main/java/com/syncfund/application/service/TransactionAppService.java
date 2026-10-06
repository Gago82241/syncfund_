package com.syncfund.application.service;

import com.syncfund.application.dto.request.CategorizeTransactionRequest;
import com.syncfund.application.dto.request.CreateTransactionRequest;
import com.syncfund.application.dto.response.TransactionResponse;
import com.syncfund.application.exception.BusinessException;
import com.syncfund.application.exception.ForbiddenException;
import com.syncfund.application.exception.ResourceNotFoundException;
import com.syncfund.application.mapper.TransactionMapper;
import com.syncfund.domain.model.*;
import com.syncfund.domain.service.FinancialManager;
import com.syncfund.domain.util.DebtCalculator;
import com.syncfund.persistence.repository.CategoryRepository;
import com.syncfund.persistence.repository.PersonalWalletRepository;
import com.syncfund.persistence.repository.SharedProjectRepository;
import com.syncfund.persistence.repository.TransactionRepository;
import com.syncfund.security.CurrentUserProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Equivalente a FinancialManager.processTransaction(userId, walletId, transactionData):
 * resuelve la Wallet (Personal o Shared), delega en el dominio y persiste ambos lados
 * (Wallet con el balance actualizado + la Transaction nueva).
 * Para gastos selectivos de un SharedProject con reparto de deuda, ver SharedProjectAppService.
 */
@Service
public class TransactionAppService {

    private final TransactionRepository transactionRepository;
    private final PersonalWalletRepository personalWalletRepository;
    private final SharedProjectRepository sharedProjectRepository;
    private final CategoryRepository categoryRepository;
    private final FinancialManager financialManager;
    private final DebtCalculator debtCalculator;
    private final TransactionMapper mapper;
    private final CurrentUserProvider currentUserProvider;

    public TransactionAppService(TransactionRepository transactionRepository,
                                  PersonalWalletRepository personalWalletRepository,
                                  SharedProjectRepository sharedProjectRepository,
                                  CategoryRepository categoryRepository,
                                  FinancialManager financialManager,
                                  DebtCalculator debtCalculator,
                                  TransactionMapper mapper,
                                  CurrentUserProvider currentUserProvider) {
        this.transactionRepository = transactionRepository;
        this.personalWalletRepository = personalWalletRepository;
        this.sharedProjectRepository = sharedProjectRepository;
        this.categoryRepository = categoryRepository;
        this.financialManager = financialManager;
        this.debtCalculator = debtCalculator;
        this.mapper = mapper;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public TransactionResponse create(CreateTransactionRequest request) {
        Transaction.OriginWalletType walletType = parseWalletType(request.getOriginWalletType());
        Wallet wallet = resolveWallet(request.getOriginWalletId(), walletType);
        requireAccess(wallet, walletType);

        Transaction transaction = new Transaction();
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setType(parseTransactionType(request.getType()));
        transaction.setDateTime(LocalDateTime.now());
        transaction.setOriginWalletId(request.getOriginWalletId());
        transaction.setOriginWalletType(walletType);
        transaction.setInvolvedIdsList(request.getInvolvedIdsList() != null ? request.getInvolvedIdsList() : List.of());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + request.getCategoryId()));
            transaction.categorize(category);
        }

        // Transaction.execute(): valida saldo (o permiso de sobregiro) y procesa el movimiento.
        boolean success = financialManager.processTransaction(wallet, transaction, request.isAllowOverdraft());
        if (!success) {
            throw new BusinessException("Saldo insuficiente para realizar la transacción.");
        }

        saveWallet(wallet, walletType);

        // Un gasto compartido también se descuenta, proporcionalmente, de la
        // billetera personal de cada involucrado (no solo del fondo del proyecto).
        if (wallet instanceof SharedProject
                && transaction.getType() == Transaction.TransactionType.GASTO
                && !transaction.getInvolvedIdsList().isEmpty()) {
            deductShareFromInvolvedWallets(transaction.getAmount(), transaction.getInvolvedIdsList());
        }

        Transaction saved = transactionRepository.save(transaction);

        return mapper.toResponse(saved);
    }

    private void deductShareFromInvolvedWallets(double amount, List<Long> involvedIdsList) {
        double share = debtCalculator.splitBill(amount, involvedIdsList);

        for (Long userId : involvedIdsList) {
            personalWalletRepository.findByOwnerId(userId).ifPresent(memberWallet -> {
                memberWallet.setCurrentBalance(memberWallet.getCurrentBalance() - share);
                personalWalletRepository.save(memberWallet);
            });
        }
    }

    /** Wallet.getPeriodReport(startDate, endDate), filtrado por billetera. */
    public List<TransactionResponse> getPeriodReport(Long walletId, String walletType,
                                                       LocalDateTime start, LocalDateTime end) {
        List<Transaction> transactions = transactionRepository
                .findByOriginWalletIdAndOriginWalletTypeAndDateTimeBetween(
                        walletId, parseWalletType(walletType), start, end);

        return transactions.stream().map(mapper::toResponse).toList();
    }

    public List<TransactionResponse> getByWallet(Long walletId, String walletType) {
        return transactionRepository
                .findByOriginWalletIdAndOriginWalletType(walletId, parseWalletType(walletType))
                .stream().map(mapper::toResponse).toList();
    }

    /** Transaction.categorize(categoryId). */
    @Transactional
    public TransactionResponse categorize(Long transactionId, CategorizeTransactionRequest request) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transacción no encontrada: " + transactionId));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + request.getCategoryId()));

        transaction.categorize(category);
        return mapper.toResponse(transactionRepository.save(transaction));
    }

    /** Tu propia billetera personal, o ser miembro del proyecto compartido en cuestión. */
    private void requireAccess(Wallet wallet, Transaction.OriginWalletType type) {
        Long currentUserId = currentUserProvider.getUserId();

        if (type == Transaction.OriginWalletType.PERSONAL) {
            if (!((PersonalWallet) wallet).getOwner().getId().equals(currentUserId)) {
                throw new ForbiddenException("Esta billetera personal no te pertenece.");
            }
        } else {
            boolean isMember = ((SharedProject) wallet).getMembers().stream()
                    .anyMatch(m -> m.getId().equals(currentUserId));
            if (!isMember) {
                throw new ForbiddenException("No perteneces a este proyecto compartido.");
            }
        }
    }

    private Wallet resolveWallet(Long id, Transaction.OriginWalletType type) {
        if (type == Transaction.OriginWalletType.PERSONAL) {
            return personalWalletRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Billetera personal no encontrada: " + id));
        }
        return sharedProjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto compartido no encontrado: " + id));
    }

    private void saveWallet(Wallet wallet, Transaction.OriginWalletType type) {
        if (type == Transaction.OriginWalletType.PERSONAL) {
            personalWalletRepository.save((PersonalWallet) wallet);
        } else {
            sharedProjectRepository.save((SharedProject) wallet);
        }
    }

    private Transaction.TransactionType parseTransactionType(String raw) {
        try {
            return Transaction.TransactionType.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException("type inválido, use INGRESO o GASTO.");
        }
    }

    private Transaction.OriginWalletType parseWalletType(String raw) {
        try {
            return Transaction.OriginWalletType.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException("originWalletType inválido, use PERSONAL o SHARED.");
        }
    }
}
