package com.syncfund;

import com.syncfund.domain.model.PersonalWallet;
import com.syncfund.domain.model.SharedProject;
import com.syncfund.domain.model.Transaction;
import com.syncfund.domain.model.User;
import com.syncfund.domain.observer.IObserver;
import com.syncfund.domain.service.FinancialManager;
import com.syncfund.domain.util.DebtCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

/**
 * SharedProject.settleDebts(): un pago entre integrantes cambia sus saldos netos, no el fondo,
 * y se notifica por el patrón Observer. FinancialManager.auditWallet() no cuenta ABONO ni COBRO.
 */
class SaldarDeudasDominioTests {

    private static final Long ANA = 1L;
    private static final Long CARO = 3L;

    private SharedProject project;

    @BeforeEach
    void setUp() {
        project = new SharedProject();
        project.setName("Viaje");
        project.setCurrentBalance(15_000);
        project.setMembers(new ArrayList<>(List.of(user(ANA, "Ana"), user(CARO, "Caro"))));
        Map<Long, Double> debts = new HashMap<>();
        debts.put(ANA, 55_000.0);
        debts.put(CARO, -35_000.0);
        project.setDebts(debts);
    }

    @Test
    void settleDebtsAjustaLosSaldosDeAmbosIntegrantes() {
        project.settleDebts(CARO, ANA, 35_000);

        assertEquals(20_000, project.getDebts().get(ANA), 0.001);
        assertEquals(0, project.getDebts().get(CARO), 0.001);
    }

    @Test
    void settleDebtsNoCambiaElFondo() {
        project.settleDebts(CARO, ANA, 35_000);

        assertEquals(15_000, project.getCurrentBalance());
    }

    @Test
    void settleDebtsNotificaUnaVezACadaObservador() {
        IObserver anaApp = mock(IObserver.class);
        IObserver caroApp = mock(IObserver.class);
        project.addObserver(anaApp);
        project.addObserver(caroApp);

        project.settleDebts(CARO, ANA, 35_000);

        verify(anaApp).update("Viaje", 35_000, "Pago de Caro a Ana");
        verify(caroApp).update("Viaje", 35_000, "Pago de Caro a Ana");
        verifyNoMoreInteractions(anaApp, caroApp);
    }

    @Test
    void auditWalletIgnoraAbonosYCobrosPorqueNoMuevenElFondo() {
        FinancialManager manager = new FinancialManager(new DebtCalculator());
        List<Transaction> history = List.of(
                movement(Transaction.TransactionType.INGRESO, 50_000),
                movement(Transaction.TransactionType.GASTO, 35_000),
                movement(Transaction.TransactionType.ABONO, 20_000),
                movement(Transaction.TransactionType.COBRO, 20_000));

        assertDoesNotThrow(() -> manager.auditWallet(project, history));
    }

    @Test
    void auditWalletTampocoCuentaUnCobroEnUnaBilleteraPersonal() {
        FinancialManager manager = new FinancialManager(new DebtCalculator());
        PersonalWallet wallet = new PersonalWallet();
        wallet.setCurrentBalance(100_000);

        assertDoesNotThrow(() -> manager.auditWallet(wallet, List.of(
                movement(Transaction.TransactionType.INGRESO, 100_000),
                movement(Transaction.TransactionType.COBRO, 10_000))));
    }

    private static Transaction movement(Transaction.TransactionType type, double amount) {
        Transaction transaction = new Transaction();
        transaction.setType(type);
        transaction.setAmount(amount);
        return transaction;
    }

    private static User user(Long id, String name) {
        User user = new User();
        user.setId(id);
        user.setName(name);
        return user;
    }
}
