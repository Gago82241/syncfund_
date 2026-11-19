package com.syncfund.application.dto.request;

import com.syncfund.application.dto.request.validation.MaxUtf8Bytes;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Datos para User (registro). Los máximos salen de las columnas de users (nombre 100, correo 150)
 * y de BCrypt (72 bytes). El mínimo de 8 caracteres solo aplica al crear la contraseña: el login
 * no lo exige, así que las cuentas antiguas de 6 o 7 caracteres siguen entrando.
 */
@Data
public class RegisterUserRequest {
    public static final int PASSWORD_MAX_BYTES = 72;
    public static final String PASSWORD_TOO_LONG =
            "Es demasiado larga. Usa una más corta (máximo 72; las tildes, la ñ y los emojis ocupan más).";

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre puede tener máximo 100 caracteres")
    private String name;

    @NotBlank(message = "El correo es obligatorio")
    @Email(regexp = EmailFormat.REGEXP, message = "El correo no tiene un formato válido")
    @Size(max = 150, message = "El correo puede tener máximo 150 caracteres")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @MaxUtf8Bytes(value = PASSWORD_MAX_BYTES, message = PASSWORD_TOO_LONG)
    private String password;
}
