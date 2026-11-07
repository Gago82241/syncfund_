package com.syncfund;

import com.syncfund.application.dto.request.CreateCategoryRequest;
import com.syncfund.application.dto.response.CategoryResponse;
import com.syncfund.application.exception.BusinessException;
import com.syncfund.application.exception.ForbiddenException;
import com.syncfund.application.exception.ResourceNotFoundException;
import com.syncfund.application.mapper.CategoryMapper;
import com.syncfund.application.service.CategoryAppService;
import com.syncfund.domain.model.Category;
import com.syncfund.domain.model.PersonalWallet;
import com.syncfund.domain.model.SharedProject;
import com.syncfund.domain.model.Transaction;
import com.syncfund.domain.model.User;
import com.syncfund.persistence.repository.CategoryRepository;
import com.syncfund.persistence.repository.PersonalWalletRepository;
import com.syncfund.persistence.repository.SharedProjectRepository;
import com.syncfund.persistence.repository.TransactionRepository;
import com.syncfund.persistence.repository.UserRepository;
import com.syncfund.security.CurrentUserProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Comprueba que cada categoría solo la pueda ver y usar su dueño. */
@ExtendWith(MockitoExtension.class)
class CategoryAppServiceTests {

    private static final Long CURRENT_USER_ID = 1L;
    private static final Long OTHER_USER_ID = 2L;
    private static final Long OWN_CATEGORY_ID = 10L;
    private static final Long OTHER_CATEGORY_ID = 20L;
    private static final Long WALLET_ID = 100L;
    private static final YearMonth MONTH = YearMonth.of(2026, 11);

    @Mock private CategoryRepository categoryRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private UserRepository userRepository;
    @Mock private PersonalWalletRepository personalWalletRepository;
    @Mock private SharedProjectRepository sharedProjectRepository;
    @Mock private CurrentUserProvider currentUserProvider;

    private CategoryAppService service;
    private User currentUser;
    private User otherUser;
    private Category ownCategory;
    private Category otherCategory;

    @BeforeEach
    void setUp() {
        service = new CategoryAppService(categoryRepository, transactionRepository, userRepository,
                personalWalletRepository, sharedProjectRepository, new CategoryMapper(), currentUserProvider);

        currentUser = user(CURRENT_USER_ID);
        otherUser = user(OTHER_USER_ID);
        ownCategory = category(OWN_CATEGORY_ID, currentUser);
        otherCategory = category(OTHER_CATEGORY_ID, otherUser);

        lenient().when(currentUserProvider.getUserId()).thenReturn(CURRENT_USER_ID);
        lenient().when(categoryRepository.findById(OWN_CATEGORY_ID)).thenReturn(Optional.of(ownCategory));
        lenient().when(categoryRepository.findById(OTHER_CATEGORY_ID)).thenReturn(Optional.of(otherCategory));
    }

    @Test
    void crearAsignaComoDuenoAlUsuarioDelToken() {
        when(userRepository.findById(CURRENT_USER_ID)).thenReturn(Optional.of(currentUser));
        when(categoryRepository.save(any(Category.class))).thenAnswer(call -> call.getArgument(0));

        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setName("Comida");
        request.setMonthlyLimit(100);
        service.create(request);

        ArgumentCaptor<Category> saved = ArgumentCaptor.forClass(Category.class);
        verify(categoryRepository).save(saved.capture());
        assertSame(currentUser, saved.getValue().getOwner());
    }

    @Test
    void listarConsultaSoloLasDelUsuarioActual() {
        when(categoryRepository.findByOwnerId(CURRENT_USER_ID)).thenReturn(List.of(ownCategory));

        List<CategoryResponse> result = service.findAll();

        assertEquals(1, result.size());
        assertEquals(OWN_CATEGORY_ID, result.get(0).getCategoryId());
        verify(categoryRepository, never()).findAll();
    }

    @Test
    void consultarCategoriaPropiaLaDevuelve() {
        assertEquals(OWN_CATEGORY_ID, service.findById(OWN_CATEGORY_ID).getCategoryId());
    }

    @Test
    void consultarCategoriaAjenaResponde403() {
        assertThrows(ForbiddenException.class, () -> service.findById(OTHER_CATEGORY_ID));
    }

    @Test
    void consultarCategoriaInexistenteResponde404() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.findById(99L));
    }

    @Test
    void limiteDeCategoriaPropiaSeCalcula() {
        assertTrue(service.isOverLimit(OWN_CATEGORY_ID, 150));
        assertFalse(service.isOverLimit(OWN_CATEGORY_ID, 50));
    }

    @Test
    void limiteDeCategoriaAjenaResponde403() {
        assertThrows(ForbiddenException.class, () -> service.isOverLimit(OTHER_CATEGORY_ID, 150));
    }

    @Test
    void limiteDeCategoriaInexistenteResponde404() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.isOverLimit(99L, 150));
    }

    @Test
    void gastoDeCategoriaPropiaEnBilleteraPropiaSoloSumaEsaCategoria() {
        when(personalWalletRepository.findById(WALLET_ID)).thenReturn(Optional.of(personalWallet(currentUser)));
        when(transactionRepository.findByOriginWalletIdAndOriginWalletTypeAndDateTimeBetween(
                any(), any(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(expense(30, ownCategory), expense(70, otherCategory)));

        assertEquals(30, service.calculateTotalExpense(OWN_CATEGORY_ID, WALLET_ID, "PERSONAL", MONTH));
    }

    @Test
    void gastoDeCategoriaAjenaResponde403() {
        assertThrows(ForbiddenException.class,
                () -> service.calculateTotalExpense(OTHER_CATEGORY_ID, WALLET_ID, "PERSONAL", MONTH));
        verifyNoTransactionsRead();
    }

    @Test
    void gastoEnBilleteraPersonalAjenaResponde403() {
        when(personalWalletRepository.findById(WALLET_ID)).thenReturn(Optional.of(personalWallet(otherUser)));

        assertThrows(ForbiddenException.class,
                () -> service.calculateTotalExpense(OWN_CATEGORY_ID, WALLET_ID, "PERSONAL", MONTH));
        verifyNoTransactionsRead();
    }

    @Test
    void gastoEnProyectoDelQueNoEsMiembroResponde403() {
        when(sharedProjectRepository.findById(WALLET_ID)).thenReturn(Optional.of(project(otherUser)));

        assertThrows(ForbiddenException.class,
                () -> service.calculateTotalExpense(OWN_CATEGORY_ID, WALLET_ID, "SHARED", MONTH));
        verifyNoTransactionsRead();
    }

    @Test
    void gastoEnProyectoDelQueEsMiembroSeCalcula() {
        when(sharedProjectRepository.findById(WALLET_ID)).thenReturn(Optional.of(project(otherUser, currentUser)));
        when(transactionRepository.findByOriginWalletIdAndOriginWalletTypeAndDateTimeBetween(
                any(), any(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(expense(40, ownCategory)));

        assertEquals(40, service.calculateTotalExpense(OWN_CATEGORY_ID, WALLET_ID, "SHARED", MONTH));
    }

    @Test
    void gastoConTipoDeBilleteraInvalidoResponde422() {
        assertThrows(BusinessException.class,
                () -> service.calculateTotalExpense(OWN_CATEGORY_ID, WALLET_ID, "OTRO", MONTH));
    }

    private void verifyNoTransactionsRead() {
        verify(transactionRepository, never()).findByOriginWalletIdAndOriginWalletTypeAndDateTimeBetween(
                any(), any(), any(LocalDateTime.class), any(LocalDateTime.class));
    }

    private static User user(Long id) {
        User user = new User();
        user.setId(id);
        return user;
    }

    private static Category category(Long id, User owner) {
        Category category = new Category();
        category.setCategoryId(id);
        category.setName("Categoría " + id);
        category.setMonthlyLimit(100);
        category.setOwner(owner);
        return category;
    }

    private static PersonalWallet personalWallet(User owner) {
        PersonalWallet wallet = new PersonalWallet();
        wallet.setOwner(owner);
        return wallet;
    }

    private static SharedProject project(User... members) {
        SharedProject project = new SharedProject();
        project.setMembers(List.of(members));
        return project;
    }

    private static Transaction expense(double amount, Category category) {
        Transaction transaction = new Transaction();
        transaction.setAmount(amount);
        transaction.setType(Transaction.TransactionType.GASTO);
        transaction.categorize(category);
        return transaction;
    }
}
