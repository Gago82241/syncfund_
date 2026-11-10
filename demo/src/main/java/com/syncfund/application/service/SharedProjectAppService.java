package com.syncfund.application.service;

import com.syncfund.application.dto.request.AddMemberRequest;
import com.syncfund.application.dto.request.CreateSharedProjectRequest;
import com.syncfund.application.dto.request.DistributeContributionRequest;
import com.syncfund.application.dto.response.NetBalanceResponse;
import com.syncfund.application.dto.response.SharedProjectResponse;
import com.syncfund.application.exception.BusinessException;
import com.syncfund.application.exception.ForbiddenException;
import com.syncfund.application.exception.ResourceNotFoundException;
import com.syncfund.application.mapper.SharedProjectMapper;
import com.syncfund.domain.model.PersonalWallet;
import com.syncfund.domain.model.SharedProject;
import com.syncfund.domain.model.Transaction;
import com.syncfund.domain.model.User;
import com.syncfund.domain.service.FinancialManager;
import com.syncfund.domain.util.DebtCalculator;
import com.syncfund.persistence.repository.PersonalWalletRepository;
import com.syncfund.persistence.repository.SharedProjectRepository;
import com.syncfund.persistence.repository.TransactionRepository;
import com.syncfund.persistence.repository.UserRepository;
import com.syncfund.security.CurrentUserProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Orquesta SharedProject: addMember, distributeContribution, notifyPendingDebt
 * y el cálculo de deuda vía DebtCalculator.determineNetBalance (colaboradores:
 * User, DebtCalculator — tal como en las CRC Cards).
 *
 * Reglas de autorización añadidas: solo el admin agrega integrantes; solo un
 * miembro del proyecto puede consultarlo/aportar; nadie contribuye "a nombre de"
 * otra persona.
 */
@Service
public class SharedProjectAppService {

    private final SharedProjectRepository sharedProjectRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final PersonalWalletRepository personalWalletRepository;
    private final DebtCalculator debtCalculator;
    private final FinancialManager financialManager;
    private final SharedProjectMapper mapper;
    private final CurrentUserProvider currentUserProvider;

    public SharedProjectAppService(SharedProjectRepository sharedProjectRepository,
                                    UserRepository userRepository,
                                    TransactionRepository transactionRepository,
                                    PersonalWalletRepository personalWalletRepository,
                                    DebtCalculator debtCalculator,
                                    FinancialManager financialManager,
                                    SharedProjectMapper mapper,
                                    CurrentUserProvider currentUserProvider) {
        this.sharedProjectRepository = sharedProjectRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.personalWalletRepository = personalWalletRepository;
        this.debtCalculator = debtCalculator;
        this.financialManager = financialManager;
        this.mapper = mapper;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public SharedProjectResponse create(CreateSharedProjectRequest request) {
        requireSelf(request.getAdminId(), "No puedes crear un proyecto nombrando a otro usuario como administrador.");

        User admin = userRepository.findById(request.getAdminId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario admin no encontrado: " + request.getAdminId()));

        SharedProject project = new SharedProject();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setAdmin(admin);
        project.addMember(admin); // el admin también queda como participante/observador

        return mapper.toResponse(sharedProjectRepository.save(project));
    }

    /** Solo el administrador del proyecto puede agregar integrantes. */
    @Transactional
    public SharedProjectResponse addMember(Long projectId, AddMemberRequest request) {
        SharedProject project = findProject(projectId);
        requireAdmin(project);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No hay ningún usuario registrado con ese correo."));

        project.addMember(user);
        return mapper.toResponse(sharedProjectRepository.save(project));
    }

    /**
     * SharedProject.distributeContribution(amount, contributorId). Solo puedes aportar a tu propio nombre.
     *
     * El aporte es dinero real: sale de la billetera personal de quien aporta (GASTO en su
     * billetera, validando saldo suficiente) y entra al fondo (INGRESO en el proyecto, con
     * el aportante en involvedIdsList para que cuente en su saldo neto).
     */
    @Transactional
    public SharedProjectResponse contribute(Long projectId, DistributeContributionRequest request) {
        SharedProject project = findProject(projectId);
        requireMember(project);
        requireSelf(request.getContributorId(), "No puedes registrar un aporte a nombre de otro usuario.");

        PersonalWallet wallet = personalWalletRepository.findByOwnerId(request.getContributorId())
                .orElseThrow(() -> new ResourceNotFoundException("No tienes una billetera personal para hacer el aporte."));

        Transaction walletMovement = newTransaction(request.getAmount(), "Aporte a «" + project.getName() + "»",
                Transaction.TransactionType.GASTO, wallet.getWalletId(), Transaction.OriginWalletType.PERSONAL,
                List.of());

        // Transaction.execute(): valida el saldo de la billetera sin permitir sobregiro.
        if (!financialManager.processTransaction(wallet, walletMovement, false)) {
            throw new BusinessException("Saldo insuficiente en tu billetera personal para este aporte.");
        }

        // Sube el fondo y notifica a los integrantes (patrón Observer).
        project.distributeContribution(request.getAmount(), request.getContributorId(), request.getDescription());

        Transaction fundMovement = newTransaction(request.getAmount(), request.getDescription(),
                Transaction.TransactionType.INGRESO, projectId, Transaction.OriginWalletType.SHARED,
                List.of(request.getContributorId()));

        personalWalletRepository.save(wallet);
        SharedProject saved = sharedProjectRepository.save(project);
        transactionRepository.save(walletMovement);
        transactionRepository.save(fundMovement);
        return mapper.toResponse(saved);
    }

    public SharedProjectResponse getById(Long projectId) {
        SharedProject project = findProject(projectId);
        requireMember(project);
        return mapper.toResponse(project);
    }

    public List<SharedProjectResponse> getByMember(Long userId) {
        requireSelf(userId, "No puedes ver los proyectos de otro usuario.");
        return sharedProjectRepository.findByMembers_Id(userId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * notifyPendingDebt() + DebtCalculator.determineNetBalance(userId, projectId). Solo tu propia deuda.
     *
     * Aportes = INGRESO del proyecto en los que el usuario es el aportante (involvedIdsList).
     * Gastos = GASTO del proyecto en los que el usuario participa (involvedIdsList).
     * Los INGRESO antiguos sin aportante no cuentan para nadie.
     */
    @Transactional(readOnly = true)
    public NetBalanceResponse getNetBalance(Long projectId, Long userId) {
        SharedProject project = findProject(projectId);
        requireMember(project);
        requireSelf(userId, "No puedes consultar la deuda de otro usuario.");

        List<Transaction> userMovements = transactionRepository
                .findByOriginWalletIdAndOriginWalletType(projectId, Transaction.OriginWalletType.SHARED)
                .stream()
                .filter(t -> t.getInvolvedIdsList().contains(userId))
                .toList();

        List<Transaction> contributions = userMovements.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.INGRESO)
                .toList();

        List<Transaction> expensesInvolved = userMovements.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.GASTO)
                .toList();

        double net = debtCalculator.determineNetBalance(userId, projectId, contributions, expensesInvolved);
        return new NetBalanceResponse(userId, projectId, net);
    }

    private static Transaction newTransaction(double amount, String description, Transaction.TransactionType type,
                                              Long walletId, Transaction.OriginWalletType walletType,
                                              List<Long> involvedIdsList) {
        Transaction transaction = new Transaction();
        transaction.setAmount(amount);
        transaction.setDescription(description);
        transaction.setType(type);
        transaction.setDateTime(LocalDateTime.now());
        transaction.setOriginWalletId(walletId);
        transaction.setOriginWalletType(walletType);
        transaction.setInvolvedIdsList(new ArrayList<>(involvedIdsList));
        return transaction;
    }

    private SharedProject findProject(Long id) {
        return sharedProjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto compartido no encontrado: " + id));
    }

    private void requireMember(SharedProject project) {
        Long currentUserId = currentUserProvider.getUserId();
        boolean isMember = project.getMembers().stream().anyMatch(m -> m.getId().equals(currentUserId));
        if (!isMember) {
            throw new ForbiddenException("No perteneces a este proyecto compartido.");
        }
    }

    private void requireAdmin(SharedProject project) {
        if (!project.getAdmin().getId().equals(currentUserProvider.getUserId())) {
            throw new ForbiddenException("Solo el administrador del proyecto puede hacer esto.");
        }
    }

    private void requireSelf(Long userId, String message) {
        if (!currentUserProvider.getUserId().equals(userId)) {
            throw new ForbiddenException(message);
        }
    }
}
