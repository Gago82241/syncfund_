package com.syncfund;

import com.syncfund.application.service.CategoryAppService;
import com.syncfund.application.service.PersonalWalletAppService;
import com.syncfund.application.service.SharedProjectAppService;
import com.syncfund.application.service.TransactionAppService;
import com.syncfund.application.service.UserAppService;
import com.syncfund.config.CorsConfig;
import com.syncfund.config.SecurityConfig;
import com.syncfund.presentation.controller.AuthController;
import com.syncfund.presentation.controller.CategoryController;
import com.syncfund.presentation.controller.PersonalWalletController;
import com.syncfund.presentation.controller.SharedProjectController;
import com.syncfund.presentation.controller.TransactionController;
import com.syncfund.presentation.controller.UserController;
import com.syncfund.security.CurrentUserProvider;
import com.syncfund.security.JwtService;
import com.syncfund.security.RestAuthenticationEntryPoint;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.stream.Stream;

import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Comprueba que cada anotación de los DTO responde su mensaje en español, aunque el cliente pida inglés. */
@WebMvcTest({AuthController.class, CategoryController.class, PersonalWalletController.class,
        SharedProjectController.class, TransactionController.class, UserController.class})
@Import({SecurityConfig.class, CorsConfig.class, JwtService.class, RestAuthenticationEntryPoint.class})
@TestPropertySource(properties = {
        "jwt.secret=clave-ficticia-solo-para-pruebas-automaticas-0123456789",
        "jwt.expiration-ms=60000",
        "app.cors.allowed-origins=http://localhost:5173"
})
class ValidationMessagesTests {

    private static final String BAD_EMAIL = "{\"email\": \"no-es-correo\", \"password\": \"secreta\"}";
    private static final String CORREO_OBLIGATORIO = "El correo es obligatorio";
    private static final String CORREO_INVALIDO = "El correo no tiene un formato válido";
    private static final String MONTO_POSITIVO = "El monto debe ser mayor que cero";
    private static final String DESCRIPCION_OBLIGATORIA = "La descripción es obligatoria";

    // Correos con formato válido: así el único incumplimiento posible es el de longitud.
    private static final String EMAIL_150 = "a@" + "bbbbbbbbb.".repeat(14) + "bbbbb.co";
    private static final String EMAIL_154 = "a@" + "bbbbbbbbb.".repeat(15) + "co";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private UserAppService userAppService;

    @MockitoBean
    private CategoryAppService categoryAppService;

    @MockitoBean
    private PersonalWalletAppService personalWalletAppService;

    @MockitoBean
    private SharedProjectAppService sharedProjectAppService;

    @MockitoBean
    private TransactionAppService transactionAppService;

    @MockitoBean
    private CurrentUserProvider currentUserProvider;

    static Stream<Arguments> invalidRequests() {
        return Stream.of(
                // AddMemberRequest
                arguments("POST", "/api/projects/1/members", "{}", "email", CORREO_OBLIGATORIO),
                arguments("POST", "/api/projects/1/members", BAD_EMAIL, "email", CORREO_INVALIDO),
                // CategorizeTransactionRequest
                arguments("PUT", "/api/transactions/1/category", "{}", "categoryId", "La categoría es obligatoria"),
                // CreateCategoryRequest
                arguments("POST", "/api/categories", "{}", "name", "El nombre de la categoría es obligatorio"),
                arguments("POST", "/api/categories", "{\"monthlyLimit\": -1}", "monthlyLimit", "El límite mensual no puede ser negativo"),
                // CreateSharedProjectRequest
                arguments("POST", "/api/projects", "{}", "name", "El nombre del proyecto es obligatorio"),
                arguments("POST", "/api/projects", "{}", "adminId", "El administrador del proyecto es obligatorio"),
                // CreateTransactionRequest
                arguments("POST", "/api/transactions", "{}", "amount", MONTO_POSITIVO),
                arguments("POST", "/api/transactions", "{}", "description", DESCRIPCION_OBLIGATORIA),
                arguments("POST", "/api/transactions", "{}", "type", "El tipo de movimiento es obligatorio"),
                arguments("POST", "/api/transactions", "{}", "originWalletId", "La billetera de origen es obligatoria"),
                arguments("POST", "/api/transactions", "{}", "originWalletType", "El tipo de billetera de origen es obligatorio"),
                // DistributeContributionRequest
                arguments("POST", "/api/projects/1/contributions", "{}", "amount", MONTO_POSITIVO),
                arguments("POST", "/api/projects/1/contributions", "{}", "contributorId", "El aportante es obligatorio"),
                arguments("POST", "/api/projects/1/contributions", "{}", "description", DESCRIPCION_OBLIGATORIA),
                // LoginRequest
                arguments("POST", "/api/auth/login", "{}", "email", CORREO_OBLIGATORIO),
                arguments("POST", "/api/auth/login", BAD_EMAIL, "email", CORREO_INVALIDO),
                arguments("POST", "/api/auth/login", "{}", "password", "La contraseña es obligatoria"),
                // ManageCushionRequest
                arguments("POST", "/api/wallets/personal/1/cushion", "{}", "amount", MONTO_POSITIVO),
                arguments("POST", "/api/wallets/personal/1/cushion", "{}", "type", "El tipo de operación es obligatorio"),
                // RegisterSelectiveExpenseRequest
                arguments("POST", "/api/projects/1/expenses", "{}", "amount", MONTO_POSITIVO),
                arguments("POST", "/api/projects/1/expenses", "{}", "payerId", "El pagador es obligatorio"),
                arguments("POST", "/api/projects/1/expenses", "{}", "involvedIdsList", "Debes seleccionar al menos un participante"),
                arguments("POST", "/api/projects/1/expenses", "{}", "description", DESCRIPCION_OBLIGATORIA),
                // SetSavingsGoalRequest
                arguments("PUT", "/api/wallets/personal/1/goal", "{\"monthlySavingsGoal\": -1}", "monthlySavingsGoal", "La meta de ahorro no puede ser negativa"),
                // RegisterUserRequest
                arguments("POST", "/api/auth/register", "{}", "email", CORREO_OBLIGATORIO),
                arguments("POST", "/api/auth/register", BAD_EMAIL, "email", CORREO_INVALIDO),
                // UpdateUserRequest
                arguments("PUT", "/api/users/1", BAD_EMAIL, "email", CORREO_INVALIDO),
                arguments("PUT", "/api/users/1", "{\"email\": \"   \"}", "email", CORREO_INVALIDO),
                arguments("PUT", "/api/users/1", "{\"email\": \"" + EMAIL_154 + "\"}", "email", "El correo no puede superar los 150 caracteres"),
                arguments("PUT", "/api/users/1", "{\"name\": \"" + "a".repeat(101) + "\"}", "name", "El nombre no puede superar los 100 caracteres")
        );
    }

    @ParameterizedTest(name = "{0} {1} {2} -> {3}: {4}")
    @MethodSource("invalidRequests")
    void responde400ConElMensajeEnEspanol(String method, String path, String body, String field, String message) throws Exception {
        send(method, path, body)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors." + field).value(message));
    }

    static Stream<String> validUserUpdates() {
        return Stream.of(
                "{}",
                "{\"name\": \"Ana\"}",
                "{\"name\": \"   \"}",
                "{\"name\": \"" + "a".repeat(100) + "\"}",
                "{\"email\": \"\"}",
                "{\"email\": \"ana@example.com\"}",
                "{\"email\": \"" + EMAIL_150 + "\"}"
        );
    }

    /** La actualización es parcial: lo que no se envía, o llega vacío, no se cambia y no es un error. */
    @ParameterizedTest
    @MethodSource("validUserUpdates")
    void actualizacionParcialDelUsuarioEsValida(String body) throws Exception {
        send("PUT", "/api/users/1", body).andExpect(status().isOk());
    }

    private ResultActions send(String method, String path, String body) throws Exception {
        String token = jwtService.generateToken(1L, "ana@example.com");
        return mockMvc.perform(request(HttpMethod.valueOf(method), path)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .header(HttpHeaders.ACCEPT_LANGUAGE, "en")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }
}
