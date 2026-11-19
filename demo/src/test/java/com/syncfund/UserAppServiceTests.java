package com.syncfund;

import com.syncfund.application.dto.request.LoginRequest;
import com.syncfund.application.exception.BusinessException;
import com.syncfund.application.mapper.UserMapper;
import com.syncfund.application.service.UserAppService;
import com.syncfund.domain.model.User;
import com.syncfund.persistence.repository.PersonalWalletRepository;
import com.syncfund.persistence.repository.SharedProjectRepository;
import com.syncfund.persistence.repository.UserRepository;
import com.syncfund.security.CurrentUserProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * El login no debe dejar ver si un correo está registrado: ni por el mensaje ni por el tiempo
 * de respuesta. Por eso la contraseña se compara con BCrypt también cuando el correo no existe.
 */
@ExtendWith(MockitoExtension.class)
class UserAppServiceTests {

    private static final String EMAIL = "ana@syncfund.test";
    private static final String CLAVE = "clave-123";

    @Mock private UserRepository userRepository;
    @Mock private PersonalWalletRepository personalWalletRepository;
    @Mock private SharedProjectRepository sharedProjectRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private CurrentUserProvider currentUserProvider;

    private UserAppService service;

    @BeforeEach
    void setUp() {
        service = new UserAppService(userRepository, personalWalletRepository, sharedProjectRepository,
                passwordEncoder, new UserMapper(), currentUserProvider);
    }

    @Test
    void loginConCorreoInexistenteComparaLaClaveIgualQueConUnoExistente() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.empty());

        BusinessException ex = assertThrows(BusinessException.class, () -> service.login(login(EMAIL, CLAVE)));

        assertEquals("Credenciales inválidas", ex.getMessage());
        verify(passwordEncoder).matches(eq(CLAVE), any());
    }

    @Test
    void loginConClaveIncorrectaRespondeElMismoMensaje() {
        User user = new User();
        user.setId(1L);
        user.setEmail(EMAIL);
        user.setPassword("$2a$hash-guardado");
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("otra-clave", "$2a$hash-guardado")).thenReturn(false);

        BusinessException ex = assertThrows(BusinessException.class, () -> service.login(login(EMAIL, "otra-clave")));

        assertEquals("Credenciales inválidas", ex.getMessage());
    }

    private static LoginRequest login(String email, String password) {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);
        return request;
    }
}
