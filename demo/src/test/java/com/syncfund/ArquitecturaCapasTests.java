package com.syncfund;

import com.syncfund.presentation.controller.SharedProjectController;
import com.syncfund.security.CurrentUserProvider;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Constructor;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertFalse;

/**
 * Regla 2 del CLAUDE.md (Controller → Service → Repository → Model): las verificaciones de
 * dueño o membresía viven en los services. Un controller que recibe CurrentUserProvider
 * está decidiendo permisos por su cuenta.
 */
class ArquitecturaCapasTests {

    @Test
    void sharedProjectControllerNoVerificaPermisosPorSuCuenta() {
        for (Constructor<?> constructor : SharedProjectController.class.getConstructors()) {
            assertFalse(Arrays.asList(constructor.getParameterTypes()).contains(CurrentUserProvider.class),
                    "SharedProjectController no debe depender de CurrentUserProvider; la verificación va en el service.");
        }
    }
}
