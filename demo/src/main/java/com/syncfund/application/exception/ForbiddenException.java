package com.syncfund.application.exception;

/** El usuario autenticado existe y el recurso existe, pero no le pertenece (autorización, no autenticación). */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
