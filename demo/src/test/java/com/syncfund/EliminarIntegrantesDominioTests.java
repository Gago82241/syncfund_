package com.syncfund;

import com.syncfund.domain.model.PersonalWallet;
import com.syncfund.domain.model.SharedProject;
import com.syncfund.domain.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;

/**
 * SharedProject.removeParticipant(): el integrante deja de estar en la lista y de ser observador,
 * se notifica a los que quedan (patrón Observer) y el fondo no cambia. Las reglas de permisos y de
 * saldo al día las valida SharedProjectAppService, no el dominio.
 */
class EliminarIntegrantesDominioTests {

    private SharedProject project;
    private User ana;
    private User beto;
    private User caro;

    @BeforeEach
    void setUp() {
        project = new SharedProject();
        project.setName("Viaje");
        project.setCurrentBalance(15_000);
        // Espías de User reales: permiten verificar las notificaciones sin cambiar su comportamiento.
        ana = spy(user(1L, "Ana"));
        beto = spy(user(2L, "Beto"));
        caro = spy(user(3L, "Caro"));
        project.addMember(ana);
        project.addMember(beto);
        project.addMember(caro);
    }

    @Test
    void quitaAlIntegranteDeLaLista() {
        project.removeParticipant(beto);

        assertEquals(List.of(1L, 3L), memberIds());
    }

    @Test
    void quitaAlIntegrantePorIdAunqueSeaOtraInstancia() {
        // Al cargar desde la base, el User puede llegar como otra instancia con el mismo id.
        project.removeParticipant(user(2L, "Beto"));

        assertEquals(List.of(1L, 3L), memberIds());
    }

    @Test
    void notificaALosQueQuedanConMontoCero() {
        project.removeParticipant(beto);

        verify(ana).update("Viaje", 0.0, "Beto ya no es integrante del proyecto");
        verify(caro).update("Viaje", 0.0, "Beto ya no es integrante del proyecto");
    }

    @Test
    void elEliminadoDejaDeSerObservador() {
        project.removeParticipant(beto);
        project.distributeContribution(10_000, 1L, "Aporte de Ana");

        verify(beto, never()).update("Viaje", 0.0, "Beto ya no es integrante del proyecto");
        verify(beto, never()).update("Viaje", 10_000, "Aporte de Ana");
        verify(ana).update("Viaje", 10_000, "Aporte de Ana");
    }

    @Test
    void noCambiaElFondo() {
        project.removeParticipant(beto);

        assertEquals(15_000, project.getCurrentBalance());
    }

    @Test
    void laNotificacionNoModificaNingunDatoDeLosUsuarios() {
        // User.update() es solo un punto de extensión: con monto 0 no debe tocar nada.
        PersonalWallet wallet = new PersonalWallet();
        wallet.setCurrentBalance(100_000);
        ana.setPersonalWallet(wallet);
        ana.setEmail("ana@correo.com");
        ana.setPassword("hash");

        project.removeParticipant(beto);

        assertEquals("Ana", ana.getName());
        assertEquals("ana@correo.com", ana.getEmail());
        assertEquals("hash", ana.getPassword());
        assertEquals(100_000, ana.getPersonalWallet().getCurrentBalance());
        assertEquals(100_000, ana.getGeneralSummary());
        assertEquals("Beto", beto.getName());
    }

    @Test
    void quitarAQuienNoEsIntegranteLanzaExcepcionSinCambiarNada() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> project.removeParticipant(user(9L, "Intrusa")));

        assertEquals("Esa persona no es integrante del proyecto.", ex.getMessage());
        assertEquals(List.of(1L, 2L, 3L), memberIds());
        verify(ana, never()).update("Viaje", 0.0, "Intrusa ya no es integrante del proyecto");
    }

    @Test
    void puedeVolverASerAgregadoYRecibirNotificaciones() {
        project.removeParticipant(beto);
        project.addMember(beto);
        project.distributeContribution(5_000, 2L, "Aporte de Beto");

        assertEquals(List.of(1L, 3L, 2L), memberIds());
        verify(beto).update("Viaje", 5_000, "Aporte de Beto");
    }

    private List<Long> memberIds() {
        return project.getMembers().stream().map(User::getId).toList();
    }

    private static User user(Long id, String name) {
        User user = new User();
        user.setId(id);
        user.setName(name);
        return user;
    }
}
