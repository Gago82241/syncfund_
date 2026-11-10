package com.syncfund;

import com.syncfund.application.dto.request.DistributeContributionRequest;
import com.syncfund.application.dto.response.MemberBalanceResponse;
import com.syncfund.application.dto.response.ProjectBalancesResponse;
import com.syncfund.application.exception.BusinessException;
import com.syncfund.application.exception.ForbiddenException;
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
    private static final Long USER_B = 2L;
    private static final Long USER_C = 3L;
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

    // ---- Saldo neto ----

    /**
     * A aporta 100.000 y B 20.000; C no aporta. Gasto de 60.000 entre A, B y C (20.000 c/u)
     * y gasto de 30.000 entre A y B (15.000 c/u). Un INGRESO antiguo de 50.000 sin aportante
     * no cuenta para nadie. La suma de los saldos netos es igual al fondo atribuible.
     */
    @Test
    void saldoNetoConNumerosConcretos() {
        project.setMembers(new ArrayList<>(List.of(userA, user(USER_B), user(USER_C))));
        lenient().when(transactionRepository.findByOriginWalletIdAndOriginWalletType(
                PROJECT_ID, Transaction.OriginWalletType.SHARED)).thenReturn(List.of(
                sharedMovement(Transaction.TransactionType.INGRESO, 100_000, USER_A),
                sharedMovement(Transaction.TransactionType.INGRESO, 20_000, USER_B),
                sharedMovement(Transaction.TransactionType.GASTO, 60_000, USER_A, USER_B, USER_C),
                sharedMovement(Transaction.TransactionType.GASTO, 30_000, USER_A, USER_B),
                sharedMovement(Transaction.TransactionType.INGRESO, 50_000)));

        double netA = netBalanceOf(USER_A);
        double netB = netBalanceOf(USER_B);
        double netC = netBalanceOf(USER_C);

        assertEquals(65_000, netA);   // 100.000 - 20.000 - 15.000
        assertEquals(-15_000, netB);  //  20.000 - 20.000 - 15.000
        assertEquals(-20_000, netC);  //       0 - 20.000
        assertEquals(30_000, netA + netB + netC); // 120.000 aportados - 90.000 gastados
    }

    @Test
    void saldoNetoIncluyeLosPagosHechosYRecibidos() {
        project.setMembers(new ArrayList<>(List.of(userA, user(USER_B), user(USER_C))));
        givenProjectMovements(ejemploConPagoDeCaroAAna());

        assertEquals(20_000, netBalanceOf(USER_A));
        assertEquals(-5_000, netBalanceOf(USER_B));
        assertEquals(0, netBalanceOf(USER_C));
    }

    // ---- Situación del proyecto ----

    @Test
    void situacionMuestraATodosLosIntegrantesConSuDesgloseYCuadraConElFondo() {
        givenThreeNamedMembers();
        project.setCurrentBalance(15_000);
        givenProjectMovements(ejemploConPagoDeCaroAAna());

        ProjectBalancesResponse response = service.getBalances(PROJECT_ID);

        assertEquals(PROJECT_ID, response.getProjectId());
        assertEquals(15_000, response.getFund());
        assertEquals(15_000, response.getTotalBalances());
        assertEquals(0, response.getUnassigned());
        assertEquals(List.of(USER_A, USER_B, USER_C),
                response.getMembers().stream().map(MemberBalanceResponse::getUserId).toList());

        MemberBalanceResponse ana = response.getMembers().get(0);
        assertEquals("Ana", ana.getName());
        assertEquals(90_000, ana.getContributed());
        assertEquals(35_000, ana.getShareOfExpenses());
        assertEquals(0, ana.getPaymentsMade());
        assertEquals(35_000, ana.getPaymentsReceived());
        assertEquals(20_000, ana.getNetBalance());

        MemberBalanceResponse caro = response.getMembers().get(2);
        assertEquals("Caro", caro.getName());
        assertEquals(35_000, caro.getPaymentsMade());
        assertEquals(0, caro.getNetBalance());
    }

    @Test
    void situacionRedondeaACentavosYLaSumaSigueIgualAlFondo() {
        givenThreeNamedMembers();
        givenProjectMovements(List.of(
                sharedMovement(Transaction.TransactionType.INGRESO, 100_000, USER_A),
                sharedMovement(Transaction.TransactionType.GASTO, 100_000, USER_A, USER_B, USER_C)));

        ProjectBalancesResponse response = service.getBalances(PROJECT_ID);

        assertEquals(66_666.67, response.getMembers().get(0).getNetBalance());
        assertEquals(33_333.33, response.getMembers().get(1).getShareOfExpenses());
        assertEquals(-33_333.33, response.getMembers().get(1).getNetBalance());
        assertEquals(0, response.getFund());
        assertEquals(0, response.getTotalBalances());
        assertEquals(0, response.getUnassigned());
    }

    @Test
    void situacionSeparaLosAportesAntiguosSinAportante() {
        givenThreeNamedMembers();
        project.setCurrentBalance(65_000);
        List<Transaction> movements = new ArrayList<>(ejemploConPagoDeCaroAAna());
        movements.add(sharedMovement(Transaction.TransactionType.INGRESO, 50_000));
        givenProjectMovements(movements);

        ProjectBalancesResponse response = service.getBalances(PROJECT_ID);

        assertEquals(65_000, response.getFund());
        assertEquals(15_000, response.getTotalBalances());
        assertEquals(50_000, response.getUnassigned());
    }

    @Test
    void situacionDeUnProyectoAjenoResponde403() {
        lenient().when(currentUserProvider.getUserId()).thenReturn(99L);

        ForbiddenException ex = assertThrows(ForbiddenException.class, () -> service.getBalances(PROJECT_ID));

        assertEquals("No perteneces a este proyecto compartido.", ex.getMessage());
    }

    // ---- Utilidades ----

    /** Sección 6 del plan: aportes Ana 90.000 y Beto 30.000, gasto de 105.000 entre los tres, Caro le paga 35.000 a Ana. */
    private static List<Transaction> ejemploConPagoDeCaroAAna() {
        return List.of(
                sharedMovement(Transaction.TransactionType.INGRESO, 90_000, USER_A),
                sharedMovement(Transaction.TransactionType.INGRESO, 30_000, USER_B),
                sharedMovement(Transaction.TransactionType.GASTO, 105_000, USER_A, USER_B, USER_C),
                sharedMovement(Transaction.TransactionType.ABONO, 35_000, USER_C),
                sharedMovement(Transaction.TransactionType.COBRO, 35_000, USER_A));
    }

    private void givenThreeNamedMembers() {
        userA.setName("Ana");
        project.setMembers(new ArrayList<>(List.of(userA, named(USER_B, "Beto"), named(USER_C, "Caro"))));
    }

    private void givenProjectMovements(List<Transaction> movements) {
        lenient().when(transactionRepository.findByOriginWalletIdAndOriginWalletType(
                PROJECT_ID, Transaction.OriginWalletType.SHARED)).thenReturn(movements);
    }

    private static User named(Long id, String name) {
        User user = user(id);
        user.setName(name);
        return user;
    }

    private double netBalanceOf(Long userId) {
        lenient().when(currentUserProvider.getUserId()).thenReturn(userId);
        return service.getNetBalance(PROJECT_ID, userId).getNetBalance();
    }

    private static Transaction sharedMovement(Transaction.TransactionType type, double amount, Long... involved) {
        Transaction transaction = new Transaction();
        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setOriginWalletId(PROJECT_ID);
        transaction.setOriginWalletType(Transaction.OriginWalletType.SHARED);
        transaction.setInvolvedIdsList(new ArrayList<>(List.of(involved)));
        return transaction;
    }

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
