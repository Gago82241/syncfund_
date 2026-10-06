package com.syncfund.persistence.repository;

import com.syncfund.domain.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByOriginWalletIdAndOriginWalletType(
            Long originWalletId, Transaction.OriginWalletType originWalletType);

    List<Transaction> findByOriginWalletIdAndOriginWalletTypeAndDateTimeBetween(
            Long originWalletId, Transaction.OriginWalletType originWalletType,
            LocalDateTime start, LocalDateTime end);

    List<Transaction> findByInvolvedIdsListContaining(Long userId);
}
