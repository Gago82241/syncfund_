package com.syncfund.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

/** Datos para crear una Category. */
@Data
public class CreateCategoryRequest {
    @NotBlank
    private String name;

    @PositiveOrZero
    private double monthlyLimit;
}
