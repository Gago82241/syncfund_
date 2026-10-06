package com.syncfund.application.dto.response;

/** Lo que recibe el frontend al hacer login/registro: el token + los datos del usuario. */
public record AuthResponse(String token, UserResponse user) {
}
