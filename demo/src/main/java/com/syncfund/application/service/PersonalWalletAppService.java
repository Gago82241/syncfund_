package com.syncfund.application.service;

import com.syncfund.application.dto.request.ManageCushionRequest;
import com.syncfund.application.dto.request.SetSavingsGoalRequest;
import com.syncfund.application.dto.response.PersonalWalletResponse;
import com.syncfund.application.exception.ForbiddenException;
import com.syncfund.application.exception.ResourceNotFoundException;
import com.syncfund.application.mapper.PersonalWalletMapper;
import com.syncfund.domain.model.PersonalWallet;
import com.syncfund.persistence.repository.PersonalWalletRepository;
import com.syncfund.security.CurrentUserProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Orquesta PersonalWallet: adjustPrivateBudget, verifySpendingLimit, manageCushion.
 * Cada operación valida que la billetera pertenezca al usuario autenticado — una
 * PersonalWallet es información financiera privada, nadie más debería poder leerla
 * ni modificarla, sin importar que conozca el walletId.
 */
@Service
public class PersonalWalletAppService {

    private final PersonalWalletRepository personalWalletRepository;
    private final PersonalWalletMapper mapper;
    private final CurrentUserProvider currentUserProvider;

    public PersonalWalletAppService(PersonalWalletRepository personalWalletRepository,
                                     PersonalWalletMapper mapper,
                                     CurrentUserProvider currentUserProvider) {
        this.personalWalletRepository = personalWalletRepository;
        this.mapper = mapper;
        this.currentUserProvider = currentUserProvider;
    }

    public PersonalWalletResponse getByUserId(Long userId) {
        requireSelf(userId);
        return mapper.toResponse(findByUser(userId));
    }

    @Transactional
    public PersonalWalletResponse setSavingsGoal(Long walletId, SetSavingsGoalRequest request) {
        PersonalWallet wallet = findOwnedById(walletId);
        wallet.setMonthlySavingsGoal(request.getMonthlySavingsGoal());
        return mapper.toResponse(personalWalletRepository.save(wallet));
    }

    @Transactional
    public PersonalWalletResponse manageCushion(Long walletId, ManageCushionRequest request) {
        PersonalWallet wallet = findOwnedById(walletId);
        wallet.manageCushion(request.getAmount(), request.getType());
        return mapper.toResponse(personalWalletRepository.save(wallet));
    }

    /** PersonalWallet.adjustPrivateBudget(frequency): cuota de ahorro calculada. */
    public double adjustPrivateBudget(Long walletId, String frequency) {
        return findOwnedById(walletId).adjustPrivateBudget(frequency);
    }

    /** PersonalWallet.verifySpendingLimit(transactionAmount). */
    public boolean verifySpendingLimit(Long walletId, double amount) {
        return findOwnedById(walletId).verifySpendingLimit(amount);
    }

    private PersonalWallet findOwnedById(Long walletId) {
        PersonalWallet wallet = personalWalletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Billetera personal no encontrada: " + walletId));

        if (!wallet.getOwner().getId().equals(currentUserProvider.getUserId())) {
            throw new ForbiddenException("Esta billetera personal no te pertenece.");
        }
        return wallet;
    }

    private PersonalWallet findByUser(Long userId) {
        return personalWalletRepository.findByOwnerId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Billetera personal no encontrada para el usuario: " + userId));
    }

    private void requireSelf(Long userId) {
        if (!currentUserProvider.getUserId().equals(userId)) {
            throw new ForbiddenException("No puedes ver la billetera personal de otro usuario.");
        }
    }
}
