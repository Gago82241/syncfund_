package com.syncfund.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Datos para crear un SharedProject. */
@Data
public class CreateSharedProjectRequest {
    @NotBlank(message = "El nombre del proyecto es obligatorio")
    @Size(max = 100, message = "El nombre del proyecto puede tener máximo 100 caracteres")
    private String name;

    @Size(max = 500, message = "La descripción puede tener máximo 500 caracteres")
    private String description;

    @NotNull(message = "El administrador del proyecto es obligatorio")
    private Long adminId;
}
