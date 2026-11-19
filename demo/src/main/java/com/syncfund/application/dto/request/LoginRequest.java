package com.syncfund.application.dto.request;

import com.syncfund.application.dto.request.validation.MaxUtf8Bytes;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Datos para User.login(email, password). La contraseña no tiene mínimo (las cuentas antiguas
 * pueden tener 6 o 7 caracteres), pero sí el máximo en bytes de BCrypt.
 */
@Data
public class LoginRequest {
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no tiene un formato válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @MaxUtf8Bytes(value = RegisterUserRequest.PASSWORD_MAX_BYTES, message = RegisterUserRequest.PASSWORD_TOO_LONG)
    private String password;
}
