package com.syncfund.domain.model;

import com.syncfund.domain.observer.IObservable;
import com.syncfund.domain.observer.IObserver;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * SharedProject (inherits from Wallet) + rol de Sujeto Observable.
 * Atributos: memberIdsList, adminId, commonFund (= currentBalance heredado).
 * Métodos: addMember(userId), registerSelectiveExpense(...), distributeContribution(...),
 * notifyPendingDebt(), addObserver(), removeObserver(), notifyObservers() (patrón Observer).
 *
 * Mapea a la tabla shared_projects del MER + project_participants como tabla intermedia
 * (memberIdsList / relación "participates_in").
 */
@Entity
@Table(name = "shared_projects")
@Getter
@Setter
@NoArgsConstructor
public class SharedProject extends Wallet implements IObservable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_id")
    private Long projectId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @ManyToMany
    @JoinTable(
            name = "project_participants",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> members = new ArrayList<>();

    /**
     * Observadores en tiempo de ejecución (no persistidos): se reconstruyen a partir de
     * "members" cuando el proyecto se carga en memoria (ver Parte 2 - FinancialManager).
     */
    @Transient
    private List<IObserver> observers = new ArrayList<>();

    /** addMember(userId): incorpora a un nuevo integrante al proyecto (colaborador: User). */
    public void addMember(User user) {
        if (!members.contains(user)) {
            members.add(user);
            addObserver(user);
        }
    }

    /**
     * registerSelectiveExpense(amount, payerId, involvedIdsList):
     * Registra quién pagó y descuenta del fondo, marcando la deuda solo a los involucrados.
     * La repartición matemática la hace DebtCalculator (ver domain/util), coordinada por
     * FinancialManager (Parte 2), que es quien finalmente llama a este método.
     */
    public void registerSelectiveExpense(double amount, Long payerId, List<Long> involvedIdsList, String description) {
        this.currentBalance -= amount;
        notifyObservers(amount, description);
    }

    /** distributeContribution(amount, contributorId): un miembro aporta al fondo. */
    public void distributeContribution(double amount, Long contributorId, String description) {
        this.currentBalance += amount;
        notifyObservers(amount, description);
    }

    /**
     * notifyPendingDebt(): cruza gastos "involucrado" vs "aportes" y avisa saldo negativo.
     * El cálculo real (determineNetBalance) vive en DebtCalculator; aquí solo se dispara
     * la notificación hacia los colaboradores (User, DebtCalculator).
     */
    public void notifyPendingDebt(String message) {
        notifyObservers(0.0, message);
    }

    // ---- IObservable ----

    @Override
    public void addObserver(IObserver observer) {
        if (!observers.contains(observer)) {
            observers.add(observer);
        }
    }

    @Override
    public void removeObserver(IObserver observer) {
        observers.remove(observer);
    }

    @Override
    public void notifyObservers(double amount, String description) {
        for (IObserver observer : observers) {
            observer.update(this.name, amount, description);
        }
    }
}
