package com.syncfund.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Wallet (Abstract Class) del diagrama de clases.
 * Atributos: walletId, name, currentBalance, transactionHistory.
 * Métodos: getBalance(), recordTransaction(Transaction), getPeriodReport(startDate, endDate).
 *
 * Se modela como @MappedSuperclass (no genera tabla propia) para que PersonalWallet y
 * SharedProject queden como tablas independientes, tal como en el MER del proyecto
 * (personal_wallets / shared_projects), evitando una tabla "wallets" que el MER no contempla.
 */
@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
public abstract class Wallet {

    // id/walletId: cada subclase define su propia PK (wallet_id / project_id según el MER).

    @Column(nullable = false, length = 150)
    protected String name;

    @Column(name = "current_balance", nullable = false, columnDefinition = "DECIMAL(12,2)")
    protected double currentBalance = 0.0;

    /** getBalance(): retorna el balance disponible en tiempo real. */
    public double getBalance() {
        return currentBalance;
    }

    /**
     * recordTransaction(Transaction): suma o resta el monto al currentBalance.
     * El objeto Transaction se añade al transactionHistory desde el repositorio
     * correspondiente (relación 1:N persistida, no colección embebida).
     */
    public void recordTransaction(Transaction transaction) {
        if (transaction.getType() == Transaction.TransactionType.INGRESO) {
            this.currentBalance += transaction.getAmount();
        } else {
            this.currentBalance -= transaction.getAmount();
        }
    }

    /**
     * getPeriodReport(startDate, endDate): filtra el histórico para mostrar el flujo
     * de caja (entradas/salidas) en un rango de tiempo.
     * Implementación real contra transactionHistory se resuelve en la capa de Aplicación
     * (Parte 2), que consulta TransactionRepository por originWalletId + rango de fechas.
     */
    public List<Transaction> getPeriodReport(LocalDateTime startDate, LocalDateTime endDate, List<Transaction> transactionHistory) {
        List<Transaction> result = new ArrayList<>();
        for (Transaction t : transactionHistory) {
            if (!t.getDateTime().isBefore(startDate) && !t.getDateTime().isAfter(endDate)) {
                result.add(t);
            }
        }
        return result;
    }
}
