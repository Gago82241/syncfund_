package com.syncfund;

import com.syncfund.application.dto.request.DistributeContributionRequest;
import com.syncfund.application.exception.BusinessException;
import com.syncfund.application.mapper.SharedProjectMapper;
import com.syncfund.application.service.SharedProjectAppService;
import com.syncfund.domain.model.PersonalWallet;
import com.syncfund.domain.model.SharedProject;
import com.syncfund.domain.model.Transaction;
import com.syncfund.domain.model.User;
import com.syncfund.domain.observer.IObserver;
import com.syncfund.domain.service.FinancialManager;
import com.syncfund.domain.util.DebtCalculator;
import com.syncfund.persistence.repository.PersonalWalletRepository;
import com.syncfund.persistence.repository.SharedProjectRepository;
import com.syncfund.persistence.repository.TransactionRepository;
import com.syncfund.persistence.repository.UserRepository;
import com.syncfund.security.CurrentUserProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * Aportes al fondo de un proyecto compartido: el dinero sale de la billetera personal
 * de quien aporta y queda registrado como movimiento en ambas billeteras.
 * FinancialManager y DebtCalculator son reales: solo se simulan los repositories.
 */
@ExtendWith(MockitoExtension.class)
class SharedProjectAppServiceTests {

    private static final Long USER_A = 1L;
    private static final Long PROJECT_ID = 100L;
    private static final Long WALLET_A = 200L;
    private static final String PROJECT_NAME = "Viaje a Santa Marta";

    @Mock private SharedProjectRepository sharedProjectRepository;
    @Mock private UserRepository userRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private PersonalWalletRepository personalWalletRepository;
    @Mock private CurrentUserProvider currentUserProvider;

    private SharedProjectAppService service;
    private User userA;
    private SharedProject project;

    @BeforeEach
    void setUp() {
        DebtCalculator debtCalculator = new DebtCalculator();
        service = new SharedProjectAppService(sharedProjectRepository, userRepository, transactionRepository,
                personalWalletRepository, debtCalculator, new FinancialManager(debtCalculator),
                new SharedProjectMapper(), currentUserProvider);

        userA = user(USER_A);
        project = new SharedProject();
        project.setProjectId(PROJECT_ID);
        project.setName(PROJECT_NAME);
        project.setAdmin(userA);
        project.setMembers(new ArrayList<>(List.of(userA)));

        lenient().when(currentUserProvider.getUserId()).thenReturn(USER_A);
        lenient().when(sharedProjectRepository.findById(PROJECT_ID)).thenReturn(Optional.of(project));
        lenient().when(sharedProjectRepository.save(any(SharedProject.class))).thenAnswer(call -> call.getArgument(0));
        lenient().when(transactionRepository.save(any(Transaction.class))).thenAnswer(call -> call.getArgument(0));
    }

    // ---- Aportes ----

    @Test
    void aporteDescuentaDeLaBilleteraYSumaAlFondo() {
        PersonalWallet wallet = givenWallet(150_000);

        service.contribute(PROJECT_ID, contribution(100_000));

        assertEquals(50_000, wallet.getCurrentBalance());
        assertEquals(100_000, project.getCurrentBalance());

        ArgumentCaptor<Transaction> saved = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository, times(2)).save(saved.capture());

        Transaction personal = findByWalletType(saved.getAllValues(), Transaction.OriginWalletType.PERSONAL);
        assertEquals(Transaction.TransactionType.GASTO, personal.getType());
        assertEquals(100_000, personal.getAmount());
        assertEquals(WALLET_A, personal.getOriginWalletId());
        assertEquals("Aporte a «" + PROJECT_NAME + "»", personal.getDescription());

        Transaction shared = findByWalletType(saved.getAllValues(), Transaction.OriginWalletType.SHARED);
        assertEquals(Transaction.TransactionType.INGRESO, shared.getType());
        assertEquals(100_000, shared.getAmount());
        assertEquals(PROJECT_ID, shared.getOriginWalletId());
        assertEquals(List.of(USER_A), shared.getInvolvedIdsList());

        verify(personalWalletRepository).save(wallet);
    }

    @Test
    void aporteConSaldoInsuficienteResponde422SinTocarNada() {
        PersonalWallet wallet = givenWallet(30_000);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.contribute(PROJECT_ID, contribution(50_000)));

        assertEquals("Saldo insuficiente en tu billetera personal para este aporte.", ex.getMessage());
        assertEquals(30_000, wallet.getCurrentBalance());
        assertEquals(0, project.getCurrentBalance());
        verify(personalWalletRepository, never()).save(any());
        verify(sharedProjectRepository, never()).save(any());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void aporteConSaldoExactoDejaLaBilleteraEnCero() {
        PersonalWallet wallet = givenWallet(80_000);

        service.contribute(PROJECT_ID, contribution(80_000));

        assertEquals(0, wallet.getCurrentBalance());
        assertEquals(80_000, project.getCurrentBalance());
    }

    @Test
    void aporteNotificaALosObservadores() {
        givenWallet(150_000);
        IObserver observer = mock(IObserver.class);
        project.addObserver(observer);

        service.contribute(PROJECT_ID, contribution(40_000));

        verify(observer).update(PROJECT_NAME, 40_000, "Aporte al fondo");
    }

    // ---- Utilidades ----

    private PersonalWallet givenWallet(double balance) {
        PersonalWallet wallet = new PersonalWallet();
        wallet.setWalletId(WALLET_A);
        wallet.setOwner(userA);
        wallet.setCurrentBalance(balance);
        lenient().when(personalWalletRepository.findByOwnerId(USER_A)).thenReturn(Optional.of(wallet));
        return wallet;
    }

    private static DistributeContributionRequest contribution(double amount) {
        DistributeContributionRequest request = new DistributeContributionRequest();
        request.setAmount(amount);
        request.setContributorId(USER_A);
        request.setDescription("Aporte al fondo");
        return request;
    }

    private static Transaction findByWalletType(List<Transaction> transactions, Transaction.OriginWalletType type) {
        return transactions.stream()
                .filter(t -> t.getOriginWalletType() == type)
                .findFirst()
                .orElseThrow(() -> new AssertionError("No se guardó ninguna transacción " + type));
    }

    private static User user(Long id) {
        User user = new User();
        user.setId(id);
        return user;
    }
}
