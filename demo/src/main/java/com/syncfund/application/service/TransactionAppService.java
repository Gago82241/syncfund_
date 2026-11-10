package com.syncfund.application.service;

import com.syncfund.application.dto.request.CategorizeTransactionRequest;
import com.syncfund.application.dto.request.CreateTransactionRequest;
import com.syncfund.application.dto.request.RegisterSelectiveExpenseRequest;
import com.syncfund.application.dto.response.TransactionResponse;
import com.syncfund.application.exception.BusinessException;
import com.syncfund.application.exception.ForbiddenException;
import com.syncfund.application.exception.ResourceNotFoundException;
import com.syncfund.application.mapper.TransactionMapper;
import com.syncfund.domain.model.*;
import com.syncfund.domain.service.FinancialManager;
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
 *
 * Modelo de fondo: un gasto compartido lo paga solo el fondo del proyecto (nunca en
 * sobregiro) y los involucrados definen cómo se reparte la deuda. El dinero entra al
 * fondo únicamente con un aporte (SharedProjectAppService.contribute).
 */
@Service
public class TransactionAppService {

    private final TransactionRepository transactionRepository;
    private final PersonalWalletRepository personalWalletRepository;
    private final SharedProjectRepository sharedProjectRepository;
    private final CategoryAppService categoryAppService;
    private final FinancialManager financialManager;
    private final TransactionMapper mapper;
    private final CurrentUserProvider currentUserProvider;

    public TransactionAppService(TransactionRepository transactionRepository,
                                  PersonalWalletRepository personalWalletRepository,
                                  SharedProjectRepository sharedProjectRepository,
                                  CategoryAppService categoryAppService,
                                  FinancialManager financialManager,
                                  TransactionMapper mapper,
                                  CurrentUserProvider currentUserProvider) {
        this.transactionRepository = transactionRepository;
        this.personalWalletRepository = personalWalletRepository;
        this.sharedProjectRepository = sharedProjectRepository;
        this.categoryAppService = categoryAppService;
        this.financialManager = financialManager;
        this.mapper = mapper;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public TransactionResponse create(CreateTransactionRequest request) {
        Transaction.OriginWalletType walletType = parseWalletType(request.getOriginWalletType());
        Transaction.TransactionType type = parseTransactionType(request.getType());
        Wallet wallet = resolveWallet(request.getOriginWalletId(), walletType);
        requireAccess(wallet, walletType);
        if (wallet instanceof SharedProject project) {
            requireInvolvedAreMembers(project, request.getInvolvedIdsList());
            if (type == Transaction.TransactionType.INGRESO) {
                throw new BusinessException("Para sumar dinero al fondo usa la opción Aportar.");
            }
        }

        Transaction transaction = new Transaction();
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setType(type);
        transaction.setDateTime(LocalDateTime.now());
        transaction.setOriginWalletId(request.getOriginWalletId());
        transaction.setOriginWalletType(walletType);
        transaction.setInvolvedIdsList(request.getInvolvedIdsList() != null ? request.getInvolvedIdsList() : List.of());

        if (request.getCategoryId() != null) {
            transaction.categorize(categoryAppService.getOwnedCategory(request.getCategoryId()));
        }

        // Transaction.execute(): valida el saldo y procesa el movimiento. Ninguna billetera queda en
        // negativo por pedido del cliente: el allowOverdraft que llegue en la petición se ignora.
        boolean shared = walletType == Transaction.OriginWalletType.SHARED;
        if (!financialManager.processTransaction(wallet, transaction, false)) {
            throw new BusinessException(shared
                    ? "El fondo del proyecto no tiene saldo suficiente para este gasto."
                    : "Saldo insuficiente para realizar la transacción.");
        }

        saveWallet(wallet, walletType);
        Transaction saved = transactionRepository.save(transaction);

        return mapper.toResponse(saved);
    }

    /**
     * SharedProject.registerSelectiveExpense(amount, payerId, involvedIdsList): un gasto del
     * proyecto que paga el fondo. Solo puedes registrarlo a tu propio nombre como pagador; el resto
     * (membresía, involucrados, categoría y fondo suficiente) lo valida create().
     */
    @Transactional
    public TransactionResponse registerSelectiveExpense(Long projectId, RegisterSelectiveExpenseRequest request) {
        if (!currentUserProvider.getUserId().equals(request.getPayerId())) {
            throw new ForbiddenException("No puedes registrar un gasto a nombre de otro usuario como pagador.");
        }

        CreateTransactionRequest txRequest = new CreateTransactionRequest();
        txRequest.setAmount(request.getAmount());
        txRequest.setDescription(request.getDescription());
        txRequest.setType(Transaction.TransactionType.GASTO.name());
        txRequest.setOriginWalletId(projectId);
        txRequest.setOriginWalletType(Transaction.OriginWalletType.SHARED.name());
        txRequest.setInvolvedIdsList(request.getInvolvedIdsList());
        txRequest.setCategoryId(request.getCategoryId());
        return create(txRequest);
    }

    /** Wallet.getPeriodReport(startDate, endDate), filtrado por billetera. Exige acceso a ella. */
    public List<TransactionResponse> getPeriodReport(Long walletId, String walletType,
                                                       LocalDateTime start, LocalDateTime end) {
        Transaction.OriginWalletType type = parseWalletType(walletType);
        requireAccess(resolveWallet(walletId, type), type);

        List<Transaction> transactions = transactionRepository
                .findByOriginWalletIdAndOriginWalletTypeAndDateTimeBetween(walletId, type, start, end);

        return transactions.stream().map(mapper::toResponse).toList();
    }

    /** Movimientos de una billetera. Exige acceso a ella. */
    public List<TransactionResponse> getByWallet(Long walletId, String walletType) {
        Transaction.OriginWalletType type = parseWalletType(walletType);
        requireAccess(resolveWallet(walletId, type), type);

        return transactionRepository
                .findByOriginWalletIdAndOriginWalletType(walletId, type)
                .stream().map(mapper::toResponse).toList();
    }

    /** Transaction.categorize(categoryId). Exige acceso a la billetera del movimiento y una categoría propia. */
    @Transactional
    public TransactionResponse categorize(Long transactionId, CategorizeTransactionRequest request) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transacción no encontrada: " + transactionId));

        Transaction.OriginWalletType walletType = transaction.getOriginWalletType();
        requireAccess(resolveWallet(transaction.getOriginWalletId(), walletType), walletType);

        transaction.categorize(categoryAppService.getOwnedCategory(request.getCategoryId()));
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

    /** Un gasto compartido se reparte entre sus involucrados: todos deben ser miembros. */
    private void requireInvolvedAreMembers(SharedProject project, List<Long> involvedIdsList) {
        if (involvedIdsList == null) {
            return;
        }
        List<Long> memberIds = project.getMembers().stream().map(User::getId).toList();
        if (!memberIds.containsAll(involvedIdsList)) {
            throw new ForbiddenException("Solo puedes repartir un gasto entre integrantes del proyecto.");
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
