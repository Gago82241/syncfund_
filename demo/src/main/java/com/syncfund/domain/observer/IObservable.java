package com.syncfund.domain.observer;

/**
 * Interfaz IObservable (Diagrama de clases - Patrón Observer).
 * SharedProject es el "Sujeto Observable": mantiene una lista dinámica de IObserver
 * (los participantes) y los notifica cuando el estado financiero cambia.
 */
public interface IObservable {
    void addObserver(IObserver observer);
    void removeObserver(IObserver observer);
    void notifyObservers(double amount, String description);
}
