package com.syncfund;

import com.syncfund.application.service.UserAppService;
import com.syncfund.config.CorsConfig;
import com.syncfund.config.SecurityConfig;
import com.syncfund.presentation.controller.AuthController;
import com.syncfund.security.JwtService;
import com.syncfund.security.RestAuthenticationEntryPoint;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Comprueba cómo responde la cadena de seguridad, sin necesitar la base de datos. */
@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, CorsConfig.class, JwtService.class, RestAuthenticationEntryPoint.class})
@TestPropertySource(properties = {
        "jwt.secret=" + SecurityErrorResponseTests.TEST_SECRET,
        "jwt.expiration-ms=60000",
        "app.cors.allowed-origins=" + SecurityErrorResponseTests.ORIGIN
})
class SecurityErrorResponseTests {

    static final String TEST_SECRET = "clave-ficticia-solo-para-pruebas-automaticas-0123456789";
    static final String ORIGIN = "http://localhost:5173";
    private static final String PROTECTED_ROUTE = "/api/categories";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private UserAppService userAppService;

    @Test
    void sinTokenResponde401ConJson() throws Exception {
        mockMvc.perform(get(PROTECTED_ROUTE))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void tokenInvalidoResponde401() throws Exception {
        mockMvc.perform(get(PROTECTED_ROUTE).header(HttpHeaders.AUTHORIZATION, "Bearer token-alterado"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void tokenVencidoResponde401() throws Exception {
        String expired = new JwtService(TEST_SECRET, -1000).generateToken(1L, "ana@example.com");

        mockMvc.perform(get(PROTECTED_ROUTE).header(HttpHeaders.AUTHORIZATION, "Bearer " + expired))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void tokenValidoNoEsRechazadoComoNoAutenticado() throws Exception {
        String token = jwtService.generateToken(1L, "ana@example.com");

        int responseStatus = mockMvc.perform(get(PROTECTED_ROUTE).header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andReturn().getResponse().getStatus();

        assertNotEquals(401, responseStatus);
        assertNotEquals(403, responseStatus);
    }

    @Test
    void respuesta401ConservaHeadersCors() throws Exception {
        mockMvc.perform(get(PROTECTED_ROUTE).header(HttpHeaders.ORIGIN, ORIGIN))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, ORIGIN));
    }

    @Test
    void preflightNoExigeToken() throws Exception {
        mockMvc.perform(options(PROTECTED_ROUTE)
                        .header(HttpHeaders.ORIGIN, ORIGIN)
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, HttpHeaders.AUTHORIZATION))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, ORIGIN));
    }

    @Test
    void rutaDeAuthNoExigeToken() throws Exception {
        // Un cuerpo vacío llega hasta la validación del DTO (400): la seguridad no lo frenó.
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
    }
}
