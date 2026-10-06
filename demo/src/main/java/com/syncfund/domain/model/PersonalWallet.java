package com.syncfund.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * PersonalWallet (inherits from Wallet).
 * Atributos propios: monthlySavingsGoal, cushionBalance.
 * Métodos: adjustPrivateBudget(frequency), verifySpendingLimit(transactionAmount),
 * manageCushion(amount, type).
 *
 * Mapea a la tabla personal_wallets del MER (relación 1:1 con User, "owns").
 */
@Entity
@Table(name = "personal_wallets")
@Getter
@Setter
@NoArgsConstructor
public class PersonalWallet extends Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "wallet_id")
    private Long walletId;

    @Column(name = "monthly_savings_goal", columnDefinition = "DECIMAL(12,2)")
    private double monthlySavingsGoal;

    @Column(name = "cushion_balance", columnDefinition = "DECIMAL(12,2)")
    private double cushionBalance;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User owner;

    /** adjustPrivateBudget(frequency): calcula las cuotas de ahorro ("daily"|"weekly"|"monthly"). */
    public double adjustPrivateBudget(String frequency) {
        int periods = switch (frequency.toLowerCase()) {
            case "diaria", "daily" -> 30;
            case "quincenal", "biweekly" -> 2;
            default -> 1; // mensual
        };
        return periods == 0 ? 0 : monthlySavingsGoal / periods;
    }

    /** verifySpendingLimit(transactionAmount): valida si el gasto es prudente según el saldo libre. */
    public boolean verifySpendingLimit(double transactionAmount) {
        double saldoLibre = currentBalance - cushionBalance;
        return transactionAmount <= saldoLibre;
    }

    /**
     * manageCushion(amount, type): protege ("APARTAR") o libera ("LIBERAR") dinero del colchón.
     * APARTAR no puede dejar currentBalance en negativo; LIBERAR no puede sacar más de lo
     * que hay realmente apartado en el colchón.
     */
    public void manageCushion(double amount, String type) {
        if ("APARTAR".equalsIgnoreCase(type)) {
            if (amount > currentBalance) {
                throw new IllegalStateException("No puedes apartar más de lo que tienes disponible en tu saldo.");
            }
            this.cushionBalance += amount;
            this.currentBalance -= amount;
        } else if ("LIBERAR".equalsIgnoreCase(type)) {
            if (amount > cushionBalance) {
                throw new IllegalStateException("No puedes liberar más de lo que tienes apartado en el colchón.");
            }
            this.cushionBalance -= amount;
            this.currentBalance += amount;
        }
    }
}
