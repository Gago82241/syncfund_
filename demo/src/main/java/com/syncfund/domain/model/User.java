package com.syncfund.domain.model;

import com.syncfund.domain.observer.IObserver;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * USER (diagrama de clases).
 * Atributos: id, name, email, password, walletIdsList.
 * Métodos: login(), logout(), updateData(), getGeneralSummary().
 *
 * Implementa IObserver: en la Máquina de estados de SharedProject, el patrón Observer
 * notifica a los participantes (Users) cuando cambia el saldo del proyecto compartido.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User implements IObserver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    // "Su llave (encriptada, idealmente)" -> se guarda ya encriptada (ver application/service, Parte 2)
    @Column(name = "password_hash", nullable = false, length = 255)
    private String password;

    // walletIdsList: la billetera personal es 1:1 (ver MER); los SharedProject se resuelven
    // vía la tabla intermedia project_participants (memberIdsList en SharedProject).
    @OneToOne(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private PersonalWallet personalWallet;

    @ManyToMany(mappedBy = "members", fetch = FetchType.LAZY)
    private List<SharedProject> sharedProjects = new ArrayList<>();

    // ---- Métodos del diagrama ----

    /** login(email, password): se valida en la capa de Aplicación (Parte 2) contra el repositorio. */
    public boolean login(String email, String rawPassword, String matchedEncodedPassword) {
        return this.email.equalsIgnoreCase(email) && matchedEncodedPassword.equals(this.password);
    }

    /** logout(): limpia la sesión actual (se maneja a nivel de token/sesión en la capa de Aplicación). */
    public void logout() {
        // Sin estado de sesión en el dominio: la invalidación de sesión/token ocurre en Application Layer.
    }

    /** updateData(): actualización de correo o nombre. */
    public void updateData(String newName, String newEmail) {
        if (newName != null && !newName.isBlank()) {
            this.name = newName;
        }
        if (newEmail != null && !newEmail.isBlank()) {
            this.email = newEmail;
        }
    }

    /** getGeneralSummary(): "Saldo Total" sumando lo que hay en su walletIdsList. */
    public double getGeneralSummary() {
        double total = 0.0;
        if (personalWallet != null) {
            total += personalWallet.getCurrentBalance();
        }
        for (SharedProject project : sharedProjects) {
            total += project.getCurrentBalance();
        }
        return total;
    }

    /**
     * IObserver.update(): la app del usuario "recalcula su UI" cuando un SharedProject
     * notifica un nuevo movimiento (ver Diagrama de secuencia).
     */
    @Override
    public void update(String projectName, double newTransactionAmount, String description) {
        // En este nivel de dominio solo se deja el punto de extensión.
        // La Parte 2 (capa de Aplicación) conectará esto con WebSockets/push hacia el frontend React.
    }
}
