package com.syncfund.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Transaction (diagrama de clases).
 * Atributos: transactionId, amount, description, dateTime, type, originWalletId, involvedIdsList.
 * Métodos: execute(), revert(), categorize(categoryId).
 *
 * Nota de diseño: el MER del documento solo define project_id (ligado a SharedProject).
 * Para respetar el atributo "originWalletId" del diagrama de clases (que cubre tanto
 * PersonalWallet como SharedProject), se añade un discriminador "originWalletType".
 * No es una clase nueva: es un dato de apoyo del propio atributo originWalletId.
 */
@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
public class Transaction {

    public enum TransactionType { INGRESO, GASTO }
    public enum OriginWalletType { PERSONAL, SHARED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long transactionId;

    @Column(nullable = false, columnDefinition = "DECIMAL(12,2)")
    private double amount;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(name = "date_time", nullable = false)
    private LocalDateTime dateTime = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TransactionType type;

    @Column(name = "origin_wallet_id", nullable = false)
    private Long originWalletId;

    @Enumerated(EnumType.STRING)
    @Column(name = "origin_wallet_type", nullable = false, length = 10)
    private OriginWalletType originWalletType;

    // involvedIdsList: solo aplica cuando originWalletType = SHARED.
    @ElementCollection
    @CollectionTable(name = "transaction_involved_users", joinColumns = @JoinColumn(name = "transaction_id"))
    @Column(name = "user_id")
    private List<Long> involvedIdsList = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    /** execute(): valida que la billetera tenga saldo (o permiso de sobregiro) y procesa el movimiento. */
    public boolean execute(Wallet wallet, boolean allowOverdraft) {
        if (type == TransactionType.GASTO && !allowOverdraft && wallet.getBalance() < amount) {
            return false;
        }
        wallet.recordTransaction(this);
        return true;
    }

    /** revert(): deshace la operación en caso de error, ajustando el saldo de la billetera. */
    public void revert(Wallet wallet) {
        if (type == TransactionType.INGRESO) {
            wallet.setCurrentBalance(wallet.getCurrentBalance() - amount);
        } else {
            wallet.setCurrentBalance(wallet.getCurrentBalance() + amount);
        }
    }

    /** categorize(categoryId): vincula la transacción a una etiqueta específica. */
    public void categorize(Category category) {
        this.category = category;
    }
}
