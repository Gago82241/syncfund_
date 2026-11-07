package com.syncfund;

import com.syncfund.application.mapper.CategoryMapper;
import com.syncfund.application.mapper.PersonalWalletMapper;
import com.syncfund.application.mapper.SharedProjectMapper;
import com.syncfund.application.mapper.TransactionMapper;
import com.syncfund.application.mapper.UserMapper;
import com.syncfund.application.service.CategoryAppService;
import com.syncfund.application.service.PersonalWalletAppService;
import com.syncfund.application.service.SharedProjectAppService;
import com.syncfund.application.service.TransactionAppService;
import com.syncfund.application.service.UserAppService;
import com.syncfund.config.CorsConfig;
import com.syncfund.config.SecurityConfig;
import com.syncfund.domain.model.PersonalWallet;
import com.syncfund.domain.model.SharedProject;
import com.syncfund.domain.model.Transaction;
import com.syncfund.domain.model.User;
import com.syncfund.domain.service.FinancialManager;
import com.syncfund.domain.util.DebtCalculator;
import com.syncfund.persistence.repository.CategoryRepository;
import com.syncfund.persistence.repository.PersonalWalletRepository;
import com.syncfund.persistence.repository.SharedProjectRepository;
import com.syncfund.persistence.repository.TransactionRepository;
import com.syncfund.persistence.repository.UserRepository;
import com.syncfund.security.CurrentUserProvider;
import com.syncfund.security.JwtService;
import com.syncfund.security.RestAuthenticationEntryPoint;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Comprueba la autorización de punta a punta (token real, services reales, formato de
 * error real), sin necesitar la base de datos: solo los repositories son simulados.
 */
@WebMvcTest
@Import({SecurityConfig.class, CorsConfig.class, JwtService.class, RestAuthenticationEntryPoint.class,
        CurrentUserProvider.class, FinancialManager.class, DebtCalculator.class,
        CategoryAppService.class, PersonalWalletAppService.class, SharedProjectAppService.class,
        TransactionAppService.class, UserAppService.class,
        CategoryMapper.class, PersonalWalletMapper.class, SharedProjectMapper.class,
        TransactionMapper.class, UserMapper.class})
@TestPropertySource(properties = {
        "jwt.secret=clave-ficticia-solo-para-pruebas-automaticas-0123456789",
        "jwt.expiration-ms=60000",
        "app.cors.allowed-origins=http://localhost:5173"
})
class AuthorizationApiTests {

    private static final Long CURRENT_USER_ID = 1L;
    private static final Long MEMBER_ID = 2L;
    private static final Long OUTSIDER_ID = 3L;
    private static final Long NONEXISTENT_USER_ID = 999L;
    private static final Long PROJECT_ID = 100L;
    private static final Long NONEXISTENT_ID = 404L;
    private static final String INVOLVED_OUTSIDE_MESSAGE = "Solo puedes repartir un gasto entre integrantes del proyecto.";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean private CategoryRepository categoryRepository;
    @MockitoBean private PersonalWalletRepository personalWalletRepository;
    @MockitoBean private SharedProjectRepository sharedProjectRepository;
    @MockitoBean private TransactionRepository transactionRepository;
    @MockitoBean private UserRepository userRepository;

    private User currentUser;
    private User member;
    private User outsider;

    @BeforeEach
    void setUp() {
        currentUser = user(CURRENT_USER_ID);
        member = user(MEMBER_ID);
        outsider = user(OUTSIDER_ID);

        lenient().when(transactionRepository.save(any(Transaction.class))).thenAnswer(call -> {
            Transaction saved = call.getArgument(0);
            saved.setTransactionId(500L);
            return saved;
        });
    }

    // ---- POST /api/projects/{id}/expenses ----

    @Test
    void gastoEntreMiembrosResponde201YDescuentaSoloASusInvolucrados() throws Exception {
        givenProject(currentUser, member);
        PersonalWallet currentUserWallet = givenPersonalWallet(currentUser, 100);
        PersonalWallet memberWallet = givenPersonalWallet(member, 100);

        mockMvc.perform(asCurrentUser(post("/api/projects/" + PROJECT_ID + "/expenses"))
                        .content(expenseJson(CURRENT_USER_ID, CURRENT_USER_ID, MEMBER_ID)))
                .andExpect(status().isCreated());

        assertEquals(75, currentUserWallet.getCurrentBalance());
        assertEquals(75, memberWallet.getCurrentBalance());
    }

    @Test
    void gastoConInvolucradoFueraDelProyectoResponde403SinTocarSaldos() throws Exception {
        givenProject(currentUser, member);
        PersonalWallet outsiderWallet = givenPersonalWallet(outsider, 100);

        mockMvc.perform(asCurrentUser(post("/api/projects/" + PROJECT_ID + "/expenses"))
                        .content(expenseJson(CURRENT_USER_ID, CURRENT_USER_ID, OUTSIDER_ID)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value(INVOLVED_OUTSIDE_MESSAGE));

        assertEquals(100, outsiderWallet.getCurrentBalance());
        verifyNothingSaved();
    }

    @Test
    void gastoConInvolucradoInexistenteRespondeIgualQueConUnoAjeno() throws Exception {
        givenProject(currentUser, member);

        mockMvc.perform(asCurrentUser(post("/api/projects/" + PROJECT_ID + "/expenses"))
                        .content(expenseJson(CURRENT_USER_ID, NONEXISTENT_USER_ID)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(INVOLVED_OUTSIDE_MESSAGE));

        verifyNothingSaved();
    }

    @Test
    void gastoEnProyectoDelQueNoEsMiembroResponde403() throws Exception {
        givenProject(member);

        mockMvc.perform(asCurrentUser(post("/api/projects/" + PROJECT_ID + "/expenses"))
                        .content(expenseJson(CURRENT_USER_ID, MEMBER_ID)))
                .andExpect(status().isForbidden());

        verifyNothingSaved();
    }

    @Test
    void gastoANombreDeOtroPagadorResponde403() throws Exception {
        givenProject(currentUser, member);

        mockMvc.perform(asCurrentUser(post("/api/projects/" + PROJECT_ID + "/expenses"))
                        .content(expenseJson(MEMBER_ID, CURRENT_USER_ID)))
                .andExpect(status().isForbidden());

        verifyNothingSaved();
    }

    @Test
    void gastoEnProyectoInexistenteResponde404() throws Exception {
        when(sharedProjectRepository.findById(NONEXISTENT_ID)).thenReturn(Optional.empty());

        mockMvc.perform(asCurrentUser(post("/api/projects/" + NONEXISTENT_ID + "/expenses"))
                        .content(expenseJson(CURRENT_USER_ID, CURRENT_USER_ID)))
                .andExpect(status().isNotFound());
    }

    // ---- POST /api/transactions con billetera SHARED ----

    @Test
    void movimientoCompartidoEntreMiembrosResponde201() throws Exception {
        givenProject(currentUser, member);
        PersonalWallet memberWallet = givenPersonalWallet(member, 100);

        mockMvc.perform(asCurrentUser(post("/api/transactions"))
                        .content(sharedTransactionJson(PROJECT_ID, MEMBER_ID)))
                .andExpect(status().isCreated());

        assertEquals(50, memberWallet.getCurrentBalance());
    }

    @Test
    void movimientoCompartidoConInvolucradoFueraDelProyectoResponde403SinTocarSaldos() throws Exception {
        givenProject(currentUser, member);
        PersonalWallet outsiderWallet = givenPersonalWallet(outsider, 100);

        mockMvc.perform(asCurrentUser(post("/api/transactions"))
                        .content(sharedTransactionJson(PROJECT_ID, OUTSIDER_ID)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(INVOLVED_OUTSIDE_MESSAGE));

        assertEquals(100, outsiderWallet.getCurrentBalance());
        verifyNothingSaved();
    }

    @Test
    void movimientoCompartidoEnProyectoAjenoResponde403() throws Exception {
        givenProject(member);

        mockMvc.perform(asCurrentUser(post("/api/transactions"))
                        .content(sharedTransactionJson(PROJECT_ID, MEMBER_ID)))
                .andExpect(status().isForbidden());

        verifyNothingSaved();
    }

    @Test
    void movimientoCompartidoEnProyectoInexistenteResponde404() throws Exception {
        when(sharedProjectRepository.findById(NONEXISTENT_ID)).thenReturn(Optional.empty());

        mockMvc.perform(asCurrentUser(post("/api/transactions"))
                        .content(sharedTransactionJson(NONEXISTENT_ID, CURRENT_USER_ID)))
                .andExpect(status().isNotFound());
    }

    private void verifyNothingSaved() {
        verify(personalWalletRepository, never()).save(any());
        verify(sharedProjectRepository, never()).save(any());
        verify(transactionRepository, never()).save(any());
    }

    private MockHttpServletRequestBuilder asCurrentUser(MockHttpServletRequestBuilder request) {
        return request
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtService.generateToken(CURRENT_USER_ID, "ana@example.com"))
                .contentType(MediaType.APPLICATION_JSON);
    }

    private void givenProject(User... members) {
        SharedProject project = new SharedProject();
        project.setProjectId(PROJECT_ID);
        project.setMembers(List.of(members));
        when(sharedProjectRepository.findById(PROJECT_ID)).thenReturn(Optional.of(project));
    }

    private PersonalWallet givenPersonalWallet(User owner, double balance) {
        PersonalWallet wallet = new PersonalWallet();
        wallet.setOwner(owner);
        wallet.setCurrentBalance(balance);
        lenient().when(personalWalletRepository.findByOwnerId(owner.getId())).thenReturn(Optional.of(wallet));
        return wallet;
    }

    private static String expenseJson(Long payerId, Long... involvedIds) {
        return "{\"amount\":50,\"description\":\"Almuerzo\",\"payerId\":" + payerId
                + ",\"involvedIdsList\":" + List.of(involvedIds) + "}";
    }

    private static String sharedTransactionJson(Long projectId, Long... involvedIds) {
        return "{\"amount\":50,\"description\":\"Almuerzo\",\"type\":\"GASTO\",\"originWalletId\":" + projectId
                + ",\"originWalletType\":\"SHARED\",\"allowOverdraft\":true,\"involvedIdsList\":" + List.of(involvedIds) + "}";
    }

    private static User user(Long id) {
        User user = new User();
        user.setId(id);
        return user;
    }
}
