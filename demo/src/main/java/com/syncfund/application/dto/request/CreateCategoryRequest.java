package com.syncfund.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

/** Datos para crear una Category. */
@Data
public class CreateCategoryRequest {
    @NotBlank(message = "El nombre de la categoría es obligatorio")
    private String name;

    @PositiveOrZero(message = "El límite mensual no puede ser negativo")
    private double monthlyLimit;
}
