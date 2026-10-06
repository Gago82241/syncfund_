package com.syncfund.application.exception;

/** Entidad no encontrada (User, Wallet, SharedProject, Transaction, Category). */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
