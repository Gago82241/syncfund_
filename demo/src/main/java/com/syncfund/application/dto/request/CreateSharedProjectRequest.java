package com.syncfund.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Datos para crear un SharedProject. */
@Data
public class CreateSharedProjectRequest {
    @NotBlank
    private String name;

    private String description;

    @NotNull
    private Long adminId;
}
