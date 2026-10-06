package com.syncfund.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Extrae el userId del usuario autenticado en la petición actual.
 * JwtAuthenticationFilter deja ese id como "principal" de la autenticación;
 * esta clase es el único lugar que sabe leerlo, para no repetir ese detalle
 * por todo el código.
 */
@Component
public class CurrentUserProvider {

    public Long getUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof Long userId) {
            return userId;
        }
        throw new IllegalStateException("No hay un usuario autenticado en el contexto actual.");
    }
}
