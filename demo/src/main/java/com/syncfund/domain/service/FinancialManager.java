package com.syncfund.domain.service;

import com.syncfund.domain.model.*;
import com.syncfund.domain.util.DebtCalculator;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * FinancialManager (Coordinator Class) del diagrama de clases.
 * "No posee" atributos propios: se diseña como servicio global (Singleton) para mantener
 * la arquitectura ligera y sin estados redundantes.
 *
 * En Spring, el equivalente natural a "Singleton" es un @Service (bean de alcance singleton
 * por defecto en el contenedor de IoC) — evita reimplementar el patrón GoF a mano.
 *
 * Métodos: processTransaction(), syncBalances() (synchronizeBalances en el documento),
 * auditWallet().
 *
 * NOTA: la orquestación completa (cargar entidades desde los repositorios, guardar,
 * exponer vía REST) se construye en la Parte 2 (capa de Aplicación). Aquí queda la
 * lógica de dominio pura, tal como la describe el documento.
 */
@Service
public class FinancialManager {

    private final DebtCalculator debtCalculator;

    public FinancialManager(DebtCalculator debtCalculator) {
        this.debtCalculator = debtCalculator;
    }

    /**
     * processTransaction(userId, walletId, transactionData): punto de entrada principal.
     * Si es en un SharedProject, invoca a DebtCalculator para repartir el gasto entre los
     * involucrados; luego ordena a la Wallet correspondiente actualizar su currentBalance
     * y registra la Transaction.
     */
    public boolean processTransaction(Wallet wallet, Transaction transaction, boolean allowOverdraft) {
        boolean success = transaction.execute(wallet, allowOverdraft);

        if (success && wallet instanceof SharedProject sharedProject
                && transaction.getType() == Transaction.TransactionType.GASTO
                && !transaction.getInvolvedIdsList().isEmpty()) {

            double share = debtCalculator.splitBill(transaction.getAmount(), transaction.getInvolvedIdsList());
            sharedProject.notifyObservers(share, transaction.getDescription());
        }

        return success;
    }

    /**
     * syncBalances(userId): recorre todas las billeteras vinculadas al usuario, suma sus
     * saldos y actualiza el GeneralSummary del objeto User.
     */
    public double syncBalances(User user) {
        return user.getGeneralSummary();
    }

    /**
     * auditWallet(walletId): control de calidad preventivo. Suma matemáticamente todos
     * los montos del transactionHistory y verifica que el resultado sea idéntico al
     * currentBalance. Si hay discrepancia, lanza una excepción de sistema.
     */
    public void auditWallet(Wallet wallet, List<Transaction> transactionHistory) {
        double calculated = 0.0;
        for (Transaction t : transactionHistory) {
            calculated += (t.getType() == Transaction.TransactionType.INGRESO)
                    ? t.getAmount()
                    : -t.getAmount();
        }

        if (Math.abs(calculated - wallet.getCurrentBalance()) > 0.001) {
            throw new IllegalStateException(
                    "Discrepancia detectada en auditWallet: calculado=" + calculated
                            + " vs currentBalance=" + wallet.getCurrentBalance());
        }
    }
}
