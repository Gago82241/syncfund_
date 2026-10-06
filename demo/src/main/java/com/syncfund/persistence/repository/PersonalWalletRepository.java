package com.syncfund.persistence.repository;

import com.syncfund.domain.model.PersonalWallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PersonalWalletRepository extends JpaRepository<PersonalWallet, Long> {
    Optional<PersonalWallet> findByOwnerId(Long userId);
}
