package com.syncfund.application.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Datos para Transaction.categorize(categoryId). */
@Data
public class CategorizeTransactionRequest {
    @NotNull(message = "La categoría es obligatoria")
    private Long categoryId;
}
