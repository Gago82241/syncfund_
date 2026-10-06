package com.syncfund.application.dto.request;

import lombok.Data;

/** Datos para User.updateData(newName, newEmail). Ambos opcionales. */
@Data
public class UpdateUserRequest {
    private String name;
    private String email;
}
