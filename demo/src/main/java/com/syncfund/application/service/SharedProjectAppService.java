package com.syncfund.application.service;

import com.syncfund.application.dto.request.AddMemberRequest;
import com.syncfund.application.dto.request.CreateSharedProjectRequest;
import com.syncfund.application.dto.request.DistributeContributionRequest;
import com.syncfund.application.dto.response.NetBalanceResponse;
import com.syncfund.application.dto.response.SharedProjectResponse;
import com.syncfund.application.exception.ForbiddenException;
import com.syncfund.application.exception.ResourceNotFoundException;
import com.syncfund.application.mapper.SharedProjectMapper;
import com.syncfund.domain.model.SharedProject;
import com.syncfund.domain.model.Transaction;
import com.syncfund.domain.model.User;
import com.syncfund.domain.util.DebtCalculator;
import com.syncfund.persistence.repository.SharedProjectRepository;
import com.syncfund.persistence.repository.TransactionRepository;
import com.syncfund.persistence.repository.UserRepository;
import com.syncfund.security.CurrentUserProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final DebtCalculator debtCalculator;
    private final SharedProjectMapper mapper;
    private final CurrentUserProvider currentUserProvider;

    public SharedProjectAppService(SharedProjectRepository sharedProjectRepository,
                                    UserRepository userRepository,
                                    TransactionRepository transactionRepository,
                                    DebtCalculator debtCalculator,
                                    SharedProjectMapper mapper,
                                    CurrentUserProvider currentUserProvider) {
        this.sharedProjectRepository = sharedProjectRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.debtCalculator = debtCalculator;
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

    /** SharedProject.distributeContribution(amount, contributorId). Solo puedes aportar a tu propio nombre. */
    @Transactional
    public SharedProjectResponse contribute(Long projectId, DistributeContributionRequest request) {
        SharedProject project = findProject(projectId);
        requireMember(project);
        requireSelf(request.getContributorId(), "No puedes registrar un aporte a nombre de otro usuario.");

        project.distributeContribution(request.getAmount(), request.getContributorId(), request.getDescription());
        return mapper.toResponse(sharedProjectRepository.save(project));
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

    /** notifyPendingDebt() + DebtCalculator.determineNetBalance(userId, projectId). Solo tu propia deuda. */
    public NetBalanceResponse getNetBalance(Long projectId, Long userId) {
        SharedProject project = findProject(projectId);
        requireMember(project);
        requireSelf(userId, "No puedes consultar la deuda de otro usuario.");

        List<Transaction> contributions = transactionRepository
                .findByOriginWalletIdAndOriginWalletType(projectId, Transaction.OriginWalletType.SHARED)
                .stream()
                .filter(t -> t.getType() == Transaction.TransactionType.INGRESO)
                .toList();

        List<Transaction> expensesInvolved = transactionRepository.findByInvolvedIdsListContaining(userId).stream()
                .filter(t -> t.getOriginWalletId().equals(projectId)
                        && t.getOriginWalletType() == Transaction.OriginWalletType.SHARED)
                .toList();

        double net = debtCalculator.determineNetBalance(userId, projectId, contributions, expensesInvolved);
        return new NetBalanceResponse(userId, projectId, net);
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
