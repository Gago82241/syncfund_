package com.syncfund.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Category (diagrama de clases).
 * Atributos: categoryId, name, monthlyLimit.
 * Métodos: calculateTotalExpense(walletId, month), alertExcess(currentAmount).
 */
@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long categoryId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "monthly_limit", columnDefinition = "DECIMAL(12,2)")
    private double monthlyLimit;

    /**
     * calculateTotalExpense(walletId, month): recorre las transacciones de esa billetera
     * en el mes actual que coincidan con esta categoría y suma sus montos.
     * Recibe la lista ya filtrada por walletId/month desde el repositorio (Parte 2).
     */
    public double calculateTotalExpense(List<Transaction> transactionsOfWalletAndMonth) {
        return transactionsOfWalletAndMonth.stream()
                .filter(t -> t.getCategory() != null && t.getCategory().getCategoryId().equals(this.categoryId))
                .filter(t -> t.getType() == Transaction.TransactionType.GASTO)
                .mapToDouble(Transaction::getAmount)
                .sum();
    }

    /** alertExcess(currentAmount): compara el gasto acumulado contra el monthlyLimit. */
    public boolean alertExcess(double currentAmount) {
        return currentAmount > monthlyLimit;
    }
}
