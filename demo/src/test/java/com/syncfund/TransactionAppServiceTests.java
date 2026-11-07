package com.syncfund;

import com.syncfund.application.dto.request.CategorizeTransactionRequest;
import com.syncfund.application.dto.request.CreateTransactionRequest;
import com.syncfund.application.dto.response.TransactionResponse;
import com.syncfund.application.exception.ForbiddenException;
import com.syncfund.application.mapper.TransactionMapper;
import com.syncfund.application.service.CategoryAppService;
import com.syncfund.application.service.TransactionAppService;
import com.syncfund.domain.model.Category;
import com.syncfund.domain.model.PersonalWallet;
import com.syncfund.domain.model.SharedProject;
import com.syncfund.domain.model.Transaction;
import com.syncfund.domain.model.User;
import com.syncfund.domain.service.FinancialManager;
import com.syncfund.domain.util.DebtCalculator;
import com.syncfund.persistence.repository.PersonalWalletRepository;
import com.syncfund.persistence.repository.SharedProjectRepository;
import com.syncfund.persistence.repository.TransactionRepository;
import com.syncfund.security.CurrentUserProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** Comprueba que un movimiento solo pueda clasificarse con una categoría propia. */
@ExtendWith(MockitoExtension.class)
class TransactionAppServiceTests {

    private static final Long CURRENT_USER_ID = 1L;
    private static final Long OTHER_USER_ID = 2L;
    private static final Long OWN_CATEGORY_ID = 10L;
    private static final Long OTHER_CATEGORY_ID = 20L;
    private static final Long WALLET_ID = 100L;
    private static final Long TRANSACTION_ID = 500L;

    @Mock private TransactionRepository transactionRepository;
    @Mock private PersonalWalletRepository personalWalletRepository;
    @Mock private SharedProjectRepository sharedProjectRepository;
    @Mock private CategoryAppService categoryAppService;
    @Mock private FinancialManager financialManager;
    @Mock private DebtCalculator debtCalculator;
    @Mock private CurrentUserProvider currentUserProvider;

    private TransactionAppService service;
    private User currentUser;
    private User otherUser;
    private Category ownCategory;

    @BeforeEach
    void setUp() {
        service = new TransactionAppService(transactionRepository, personalWalletRepository, sharedProjectRepository,
                categoryAppService, financialManager, debtCalculator, new TransactionMapper(), currentUserProvider);

        currentUser = user(CURRENT_USER_ID);
        otherUser = user(OTHER_USER_ID);
        ownCategory = new Category();
        ownCategory.setCategoryId(OWN_CATEGORY_ID);
        ownCategory.setOwner(currentUser);

        lenient().when(currentUserProvider.getUserId()).thenReturn(CURRENT_USER_ID);
        lenient().when(categoryAppService.getOwnedCategory(OWN_CATEGORY_ID)).thenReturn(ownCategory);
        lenient().when(categoryAppService.getOwnedCategory(OTHER_CATEGORY_ID))
                .thenThrow(new ForbiddenException("Esta categoría no te pertenece."));
        lenient().when(financialManager.processTransaction(any(), any(), anyBoolean())).thenReturn(true);
        lenient().when(transactionRepository.save(any(Transaction.class))).thenAnswer(call -> call.getArgument(0));
    }

    @Test
    void crearSinCategoriaFunciona() {
        givenPersonalWallet(currentUser);

        TransactionResponse response = service.create(createRequest("PERSONAL", null));

        assertNull(response.getCategoryId());
        verifyNoInteractions(categoryAppService);
    }

    @Test
    void crearConCategoriaPropiaLaAsigna() {
        givenPersonalWallet(currentUser);

        TransactionResponse response = service.create(createRequest("PERSONAL", OWN_CATEGORY_ID));

        assertEquals(OWN_CATEGORY_ID, response.getCategoryId());
    }

    @Test
    void crearConCategoriaAjenaResponde403SinTocarSaldosNiGuardar() {
        givenPersonalWallet(currentUser);

        assertThrows(ForbiddenException.class, () -> service.create(createRequest("PERSONAL", OTHER_CATEGORY_ID)));

        verifyNothingProcessed();
    }

    @Test
    void miembroDeUnProyectoNoPuedeUsarLaCategoriaDeOtroMiembro() {
        givenProject(currentUser, otherUser);

        assertThrows(ForbiddenException.class, () -> service.create(createRequest("SHARED", OTHER_CATEGORY_ID)));

        verifyNothingProcessed();
    }

    @Test
    void miembroDeUnProyectoPuedeUsarSuCategoria() {
        givenProject(currentUser, otherUser);

        TransactionResponse response = service.create(createRequest("SHARED", OWN_CATEGORY_ID));

        assertEquals(OWN_CATEGORY_ID, response.getCategoryId());
    }

    @Test
    void clasificarMovimientoDeBilleteraAjenaResponde403() {
        givenPersonalWallet(otherUser);
        givenTransaction(Transaction.OriginWalletType.PERSONAL);

        assertThrows(ForbiddenException.class, () -> service.categorize(TRANSACTION_ID, categorizeRequest(OWN_CATEGORY_ID)));

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void clasificarMovimientoDeProyectoAjenoResponde403() {
        givenProject(otherUser);
        givenTransaction(Transaction.OriginWalletType.SHARED);

        assertThrows(ForbiddenException.class, () -> service.categorize(TRANSACTION_ID, categorizeRequest(OWN_CATEGORY_ID)));

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void clasificarConCategoriaAjenaResponde403() {
        givenPersonalWallet(currentUser);
        givenTransaction(Transaction.OriginWalletType.PERSONAL);

        assertThrows(ForbiddenException.class, () -> service.categorize(TRANSACTION_ID, categorizeRequest(OTHER_CATEGORY_ID)));

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void clasificarMovimientoPropioConCategoriaPropiaFunciona() {
        givenPersonalWallet(currentUser);
        givenTransaction(Transaction.OriginWalletType.PERSONAL);

        TransactionResponse response = service.categorize(TRANSACTION_ID, categorizeRequest(OWN_CATEGORY_ID));

        assertEquals(OWN_CATEGORY_ID, response.getCategoryId());
    }

    private void verifyNothingProcessed() {
        verify(financialManager, never()).processTransaction(any(), any(), anyBoolean());
        verify(personalWalletRepository, never()).save(any());
        verify(sharedProjectRepository, never()).save(any());
        verify(transactionRepository, never()).save(any());
    }

    private void givenPersonalWallet(User owner) {
        PersonalWallet wallet = new PersonalWallet();
        wallet.setOwner(owner);
        when(personalWalletRepository.findById(WALLET_ID)).thenReturn(Optional.of(wallet));
    }

    private void givenProject(User... members) {
        SharedProject project = new SharedProject();
        project.setMembers(List.of(members));
        when(sharedProjectRepository.findById(WALLET_ID)).thenReturn(Optional.of(project));
    }

    private void givenTransaction(Transaction.OriginWalletType walletType) {
        Transaction transaction = new Transaction();
        transaction.setTransactionId(TRANSACTION_ID);
        transaction.setType(Transaction.TransactionType.GASTO);
        transaction.setOriginWalletId(WALLET_ID);
        transaction.setOriginWalletType(walletType);
        when(transactionRepository.findById(TRANSACTION_ID)).thenReturn(Optional.of(transaction));
    }

    private static CreateTransactionRequest createRequest(String walletType, Long categoryId) {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setAmount(50);
        request.setDescription("Almuerzo");
        request.setType("GASTO");
        request.setOriginWalletId(WALLET_ID);
        request.setOriginWalletType(walletType);
        request.setCategoryId(categoryId);
        return request;
    }

    private static CategorizeTransactionRequest categorizeRequest(Long categoryId) {
        CategorizeTransactionRequest request = new CategorizeTransactionRequest();
        request.setCategoryId(categoryId);
        return request;
    }

    private static User user(Long id) {
        User user = new User();
        user.setId(id);
        return user;
    }
}
