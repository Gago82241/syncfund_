package com.syncfund.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Datos para User.updateData(newName, newEmail). Ambos opcionales. */
@Data
public class UpdateUserRequest {
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String name;

    @Email(message = "El correo no tiene un formato válido")
    @Size(max = 150, message = "El correo no puede superar los 150 caracteres")
    private String email;
}
