package com.syncfund.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Datos para crear un SharedProject. */
@Data
public class CreateSharedProjectRequest {
    @NotBlank(message = "El nombre del proyecto es obligatorio")
    private String name;

    private String description;

    @NotNull(message = "El administrador del proyecto es obligatorio")
    private Long adminId;
}
