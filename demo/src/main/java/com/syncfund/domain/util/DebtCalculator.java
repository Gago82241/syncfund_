package com.syncfund.domain.util;

import com.syncfund.domain.model.SharedProject;
import com.syncfund.domain.model.Transaction;
import com.syncfund.domain.model.User;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * DebtCalculator (Utility Class) del diagrama de clases.
 * "No posee" atributos: es una clase apátrida (stateless), herramienta de cálculo pura.
 * Métodos: splitBill(), projectSavings(), determineNetBalance().
 */
@Component
public class DebtCalculator {

    /**
     * splitBill(amount, involvedIdsList): retorna el valor individual que cada uno
     * debe aportar para cubrir el gasto.
     */
    public double splitBill(double amount, List<Long> involvedIdsList) {
        if (involvedIdsList == null || involvedIdsList.isEmpty()) {
            throw new IllegalArgumentException("involvedIdsList no puede estar vacío");
        }
        return amount / involvedIdsList.size();
    }

    /**
     * projectSavings(totalGoal, frequency, time): calcula el monto exacto de la cuota
     * (diaria, quincenal o mensual) necesaria para alcanzar la meta.
     */
    public double projectSavings(double totalGoal, String frequency, int time) {
        int periodsPerUnit = switch (frequency.toLowerCase()) {
            case "diaria", "daily" -> 30;
            case "quincenal", "biweekly" -> 2;
            default -> 1; // mensual
        };
        int totalPeriods = Math.max(1, time * periodsPerUnit);
        return totalGoal / totalPeriods;
    }

    /**
     * determineNetBalance(userId, projectId): cruza "Aportes realizados" vs "Gastos en los
     * que participó" del usuario dentro de un proyecto.
     * Retorna positivo (saldo a favor), negativo (deuda) o cero (en paz y salvo).
     *
     * contributions / expensesInvolved se obtienen desde TransactionRepository (Parte 2),
     * filtrando por projectId y por tipo (aporte vs gasto compartido).
     */
    public double determineNetBalance(Long userId, Long projectId,
                                       List<Transaction> contributions,
                                       List<Transaction> expensesInvolved) {
        double totalContributed = contributions.stream()
                .mapToDouble(Transaction::getAmount)
                .sum();

        double totalOwed = 0.0;
        for (Transaction expense : expensesInvolved) {
            List<Long> involved = expense.getInvolvedIdsList();
            if (involved != null && !involved.isEmpty()) {
                totalOwed += splitBill(expense.getAmount(), involved);
            }
        }

        return totalContributed - totalOwed;
    }

    /**
     * calculateBalances(sharedProject): saldo neto de cada integrante del proyecto, en el orden
     * de sus integrantes. Saldo neto = aportes − parte de los gastos + pagos hechos − pagos recibidos.
     * Como ABONO y COBRO se registran por pares del mismo monto, la suma de los saldos es igual al
     * fondo (salvo INGRESO antiguos sin aportante, que no cuentan para nadie).
     *
     * projectMovements se obtiene desde TransactionRepository (la clase es apátrida), igual que en
     * determineNetBalance.
     */
    public Map<Long, Double> calculateBalances(SharedProject project, List<Transaction> projectMovements) {
        Map<Long, Double> balances = new LinkedHashMap<>();
        calculateBalanceDetails(project, projectMovements)
                .forEach((userId, detail) -> balances.put(userId, detail.netBalance()));
        return balances;
    }

    /** Desglose del saldo neto de cada integrante, para mostrar la situación del proyecto. */
    public Map<Long, MemberBalance> calculateBalanceDetails(SharedProject project, List<Transaction> projectMovements) {
        Map<Long, MemberBalance> details = new LinkedHashMap<>();
        for (User member : project.getMembers()) {
            Long userId = member.getId();
            List<Transaction> involving = projectMovements.stream()
                    .filter(t -> t.getInvolvedIdsList() != null && t.getInvolvedIdsList().contains(userId))
                    .toList();

            List<Transaction> contributions = ofType(involving, Transaction.TransactionType.INGRESO);
            List<Transaction> expenses = ofType(involving, Transaction.TransactionType.GASTO);
            double contributed = total(contributions);
            double share = contributed - determineNetBalance(userId, project.getProjectId(), contributions, expenses);
            double paymentsMade = total(ofType(involving, Transaction.TransactionType.ABONO));
            double paymentsReceived = total(ofType(involving, Transaction.TransactionType.COBRO));
            double net = contributed - share + paymentsMade - paymentsReceived;

            details.put(userId, new MemberBalance(userId, contributed, share, paymentsMade, paymentsReceived, net));
        }
        return details;
    }

    /** Saldo neto de un integrante con su desglose (positivo: a favor; negativo: debe). */
    public record MemberBalance(Long userId, double contributed, double shareOfExpenses,
                                double paymentsMade, double paymentsReceived, double netBalance) {
    }

    private static List<Transaction> ofType(List<Transaction> movements, Transaction.TransactionType type) {
        return movements.stream().filter(t -> t.getType() == type).toList();
    }

    private static double total(List<Transaction> movements) {
        return movements.stream().mapToDouble(Transaction::getAmount).sum();
    }
}
