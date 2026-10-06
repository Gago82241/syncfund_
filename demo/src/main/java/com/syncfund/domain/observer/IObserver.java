package com.syncfund.domain.observer;

/**
 * Interfaz IObserver (Diagrama de clases - Patrón Observer).
 * User la implementa: cuando SharedProject notifica, "la app del usuario recalcula su UI"
 * (ver Diagrama de secuencia).
 */
public interface IObserver {
    void update(String projectName, double newTransactionAmount, String description);
}
