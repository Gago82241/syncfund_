package com.syncfund.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Datos para crear una Category. */
@Data
public class CreateCategoryRequest {
    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Size(max = 100, message = "El nombre de la categoría puede tener máximo 100 caracteres")
    private String name;

    @PositiveOrZero(message = "El límite mensual no puede ser negativo")
    private double monthlyLimit;
}
