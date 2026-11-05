package com.syncfund.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Datos para SharedProject.addMember(userId) — identifica al usuario por email, no por ID. */
@Data
public class AddMemberRequest {
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no tiene un formato válido")
    private String email;
}
