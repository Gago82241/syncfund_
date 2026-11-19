package com.syncfund;

import com.syncfund.domain.model.SharedProject;
import com.syncfund.domain.model.Transaction;
import com.syncfund.domain.model.User;
import com.syncfund.domain.util.DebtCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * DebtCalculator.calculateBalances(sharedProject): saldo neto de cada integrante.
 * Saldo neto = aportes − parte de los gastos + pagos hechos (ABONO) − pagos recibidos (COBRO).
 * La suma de los saldos netos es igual al fondo.
 */
class DebtCalculatorTests {

    private static final Long ANA = 1L;
    private static final Long BETO = 2L;
    private static final Long CARO = 3L;
    private static final double DELTA = 0.000_001;

    private final DebtCalculator calculator = new DebtCalculator();
    private SharedProject project;

    @BeforeEach
    void setUp() {
        project = new SharedProject();
        project.setProjectId(7L);
        project.setMembers(new ArrayList<>(List.of(user(ANA), user(BETO), user(CARO))));
    }

    /** Ana aporta 90.000 y Beto 30.000; gasto de 105.000 entre los tres (35.000 c/u). Fondo 15.000. */
    private List<Transaction> ejemploAntesDelPago() {
        return new ArrayList<>(List.of(
                movement(Transaction.TransactionType.INGRESO, 90_000, ANA),
                movement(Transaction.TransactionType.INGRESO, 30_000, BETO),
                movement(Transaction.TransactionType.GASTO, 105_000, ANA, BETO, CARO)));
    }

    @Test
    void saldosAntesDeCualquierPago() {
        Map<Long, Double> balances = calculator.calculateBalances(project, ejemploAntesDelPago());

        assertEquals(55_000, balances.get(ANA), DELTA);
        assertEquals(-5_000, balances.get(BETO), DELTA);
        assertEquals(-35_000, balances.get(CARO), DELTA);
        assertEquals(15_000, sum(balances), DELTA);
    }

    @Test
    void unPagoDeCaroAAnaAjustaAmbosSaldosYLaSumaSigueIgualAlFondo() {
        List<Transaction> movements = ejemploAntesDelPago();
        movements.add(movement(Transaction.TransactionType.ABONO, 35_000, CARO));
        movements.add(movement(Transaction.TransactionType.COBRO, 35_000, ANA));

        Map<Long, Double> balances = calculator.calculateBalances(project, movements);

        assertEquals(20_000, balances.get(ANA), DELTA);
        assertEquals(-5_000, balances.get(BETO), DELTA);
        assertEquals(0, balances.get(CARO), DELTA);
        assertEquals(15_000, sum(balances), DELTA);
    }

    @Test
    void elDesgloseSeparaAportesParteDeGastosYPagos() {
        List<Transaction> movements = ejemploAntesDelPago();
        movements.add(movement(Transaction.TransactionType.ABONO, 35_000, CARO));
        movements.add(movement(Transaction.TransactionType.COBRO, 35_000, ANA));

        Map<Long, DebtCalculator.MemberBalance> details = calculator.calculateBalanceDetails(project, movements);

        DebtCalculator.MemberBalance ana = details.get(ANA);
        assertEquals(90_000, ana.contributed(), DELTA);
        assertEquals(35_000, ana.shareOfExpenses(), DELTA);
        assertEquals(0, ana.paymentsMade(), DELTA);
        assertEquals(35_000, ana.paymentsReceived(), DELTA);
        assertEquals(20_000, ana.netBalance(), DELTA);

        DebtCalculator.MemberBalance caro = details.get(CARO);
        assertEquals(0, caro.contributed(), DELTA);
        assertEquals(35_000, caro.shareOfExpenses(), DELTA);
        assertEquals(35_000, caro.paymentsMade(), DELTA);
        assertEquals(0, caro.paymentsReceived(), DELTA);
        assertEquals(0, caro.netBalance(), DELTA);
    }

    @Test
    void todosLosIntegrantesAparecenAunqueNoTenganMovimientosYEnElOrdenDelProyecto() {
        Map<Long, Double> balances = calculator.calculateBalances(project, List.of());

        assertEquals(List.of(ANA, BETO, CARO), List.copyOf(balances.keySet()));
        balances.values().forEach(value -> assertEquals(0, value, DELTA));
    }

    @Test
    void unIngresoAntiguoSinAportanteNoCuentaParaNadie() {
        List<Transaction> movements = ejemploAntesDelPago();
        movements.add(movement(Transaction.TransactionType.INGRESO, 50_000));

        Map<Long, Double> balances = calculator.calculateBalances(project, movements);

        assertEquals(55_000, balances.get(ANA), DELTA);
        assertEquals(15_000, sum(balances), DELTA); // el fondo sería 65.000: 50.000 sin asignar
    }

    @Test
    void unGastoEntreTresConDecimalesSigueCuadrandoConElFondo() {
        List<Transaction> movements = List.of(
                movement(Transaction.TransactionType.INGRESO, 100_000, ANA),
                movement(Transaction.TransactionType.GASTO, 100_000, ANA, BETO, CARO));

        Map<Long, Double> balances = calculator.calculateBalances(project, movements);

        assertEquals(66_666.666_666, balances.get(ANA), 0.001);
        assertEquals(-33_333.333_333, balances.get(BETO), 0.001);
        assertEquals(0, sum(balances), DELTA);
    }

    // ---- Sugerencias de pago ----

    @Test
    void sugerenciasDelEjemplo() {
        Map<Long, Double> balances = calculator.calculateBalances(project, ejemploAntesDelPago());

        assertEquals(List.of(
                        new DebtCalculator.SuggestedPayment(CARO, ANA, 35_000),
                        new DebtCalculator.SuggestedPayment(BETO, ANA, 5_000)),
                calculator.suggestPayments(balances));
    }

    @Test
    void sinDeudasNoHaySugerencias() {
        assertEquals(List.of(), calculator.suggestPayments(balances(ANA, 15_000.0, BETO, 0.0, CARO, 0.0)));
        assertEquals(List.of(), calculator.suggestPayments(balances(ANA, 0.0, BETO, 0.0, CARO, 0.0)));
    }

    @Test
    void quienDebeLePagaPrimeroAQuienTieneMasSaldoAFavor() {
        assertEquals(List.of(new DebtCalculator.SuggestedPayment(CARO, BETO, 35_000)),
                calculator.suggestPayments(balances(ANA, 10_000.0, BETO, 40_000.0, CARO, -35_000.0)));
    }

    /** Cuatro integrantes: A +30.000, B +20.000, C −25.000, D −25.000. Bastan 3 pagos (n − 1). */
    @Test
    void conCuatroIntegrantesSeSaldaConComoMucho3PagosYCadaDeudaQuedaCubierta() {
        Long dani = 4L;
        Map<Long, Double> balances = new java.util.LinkedHashMap<>();
        balances.put(ANA, 30_000.0);
        balances.put(BETO, 20_000.0);
        balances.put(CARO, -25_000.0);
        balances.put(dani, -25_000.0);

        List<DebtCalculator.SuggestedPayment> payments = calculator.suggestPayments(balances);

        assertEquals(List.of(
                new DebtCalculator.SuggestedPayment(CARO, ANA, 25_000),
                new DebtCalculator.SuggestedPayment(dani, ANA, 5_000),
                new DebtCalculator.SuggestedPayment(dani, BETO, 20_000)), payments);
    }

    @Test
    void lasDiferenciasDeMenosDeMedioCentavoNoGeneranPagos() {
        assertEquals(List.of(), calculator.suggestPayments(balances(ANA, 0.003, BETO, -0.003, CARO, 0.0)));
    }

    // ---- Utilidades ----

    private static Map<Long, Double> balances(Long a, Double va, Long b, Double vb, Long c, Double vc) {
        Map<Long, Double> balances = new java.util.LinkedHashMap<>();
        balances.put(a, va);
        balances.put(b, vb);
        balances.put(c, vc);
        return balances;
    }

    private static double sum(Map<Long, Double> balances) {
        return balances.values().stream().mapToDouble(Double::doubleValue).sum();
    }

    private static Transaction movement(Transaction.TransactionType type, double amount, Long... involved) {
        Transaction transaction = new Transaction();
        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setOriginWalletId(7L);
        transaction.setOriginWalletType(Transaction.OriginWalletType.SHARED);
        transaction.setInvolvedIdsList(new ArrayList<>(List.of(involved)));
        return transaction;
    }

    private static User user(Long id) {
        User user = new User();
        user.setId(id);
        return user;
    }
}
