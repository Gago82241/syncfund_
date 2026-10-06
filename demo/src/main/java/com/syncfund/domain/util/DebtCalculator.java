package com.syncfund.domain.util;

import com.syncfund.domain.model.Transaction;
import org.springframework.stereotype.Component;

import java.util.HashMap;
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

    /** Variante de apoyo: calcula los saldos netos de todos los involucrados de una vez. */
    public Map<Long, Double> calculateBalances(double amount, List<Long> involvedIdsList) {
        double share = splitBill(amount, involvedIdsList);
        Map<Long, Double> balances = new HashMap<>();
        for (Long userId : involvedIdsList) {
            balances.put(userId, -share);
        }
        return balances;
    }
}
