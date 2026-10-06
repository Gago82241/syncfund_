package com.syncfund.application.exception;

/** Error de regla de negocio (saldo insuficiente, tipo inválido, discrepancia de auditoría, etc). */
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
