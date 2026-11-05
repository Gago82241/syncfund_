package com.syncfund;

import com.syncfund.application.exception.ForbiddenException;
import com.syncfund.application.exception.ResourceNotFoundException;
import com.syncfund.application.service.UserAppService;
import com.syncfund.config.CorsConfig;
import com.syncfund.config.SecurityConfig;
import com.syncfund.domain.model.PersonalWallet;
import com.syncfund.presentation.controller.AuthController;
import com.syncfund.security.JwtService;
import com.syncfund.security.RestAuthenticationEntryPoint;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Comprueba que los errores no revelan detalles internos y usan el código HTTP correcto. */
@WebMvcTest({AuthController.class, GlobalExceptionHandlerTests.FailingController.class})
@Import({SecurityConfig.class, CorsConfig.class, JwtService.class, RestAuthenticationEntryPoint.class,
        GlobalExceptionHandlerTests.FailingController.class})
@ExtendWith(OutputCaptureExtension.class)
@TestPropertySource(properties = {
        "jwt.secret=clave-ficticia-solo-para-pruebas-automaticas-0123456789",
        "jwt.expiration-ms=60000",
        "app.cors.allowed-origins=http://localhost:5173"
})
class GlobalExceptionHandlerTests {

    private static final String INTERNAL_DETAIL = "jdbc:mysql://servidor-interno:3306/syncfund";

    @RestController
    static class FailingController {

        @GetMapping("/test/inesperado")
        void unexpected() {
            throw new RuntimeException(INTERNAL_DETAIL);
        }

        @GetMapping("/test/estado-libreria")
        void illegalStateFromLibrary() {
            Assert.state(false, INTERNAL_DETAIL);
        }

        @GetMapping("/test/colchon")
        void illegalStateFromDomain() {
            new PersonalWallet().manageCushion(100, "LIBERAR");
        }

        @GetMapping("/test/numero/{id}")
        void numericId(@PathVariable Long id) {
        }

        @GetMapping("/test/prohibido")
        void forbidden() {
            throw new ForbiddenException("No tienes permiso.");
        }

        @GetMapping("/test/no-encontrado")
        void notFound() {
            throw new ResourceNotFoundException("No existe.");
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private UserAppService userAppService;

    private MockHttpServletRequestBuilder authenticatedGet(String path) {
        String token = jwtService.generateToken(1L, "ana@example.com");
        return get(path).header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
    }

    @Test
    void errorInesperadoNoFiltraSuMensajePeroQuedaEnElLog(CapturedOutput output) throws Exception {
        mockMvc.perform(authenticatedGet("/test/inesperado"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(content().string(not(containsString(INTERNAL_DETAIL))));

        assertTrue(output.getOut().contains(INTERNAL_DETAIL));
    }

    @Test
    void illegalStateDeUnaLibreriaSeTrataComoErrorInterno() throws Exception {
        mockMvc.perform(authenticatedGet("/test/estado-libreria"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(not(containsString(INTERNAL_DETAIL))));
    }

    @Test
    void illegalStateDelDominioConservaSuMensaje() throws Exception {
        mockMvc.perform(authenticatedGet("/test/colchon"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("No puedes liberar más de lo que tienes apartado en el colchón."));
    }

    @Test
    void jsonMalFormadoResponde400() throws Exception {
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{ no es json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Los datos enviados no tienen un formato válido."));
    }

    @Test
    void idNoNumericoResponde400() throws Exception {
        mockMvc.perform(authenticatedGet("/test/numero/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Uno de los valores de la solicitud no es válido."));
    }

    @Test
    void rutaInexistenteResponde404() throws Exception {
        mockMvc.perform(authenticatedGet("/api/ruta-que-no-existe"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("El recurso solicitado no existe."));
    }

    @Test
    void contrasenaVaciaResponde400ConUnMensajePorCampo() throws Exception {
        // La contraseña vacía incumple @NotBlank y @Size a la vez: no debe terminar en 500.
        String body = "{\"name\": \"Ana\", \"email\": \"no-es-correo\", \"password\": \"\"}";

        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Revisa los datos ingresados."))
                .andExpect(jsonPath("$.errors.password").isString())
                .andExpect(jsonPath("$.errors.email").value("El correo no tiene un formato válido"))
                .andExpect(jsonPath("$.errors.name").doesNotExist());
    }

    @Test
    void sinPermisoResponde403SoloConStatusYMessage() throws Exception {
        assertOnlyStatusAndMessage(authenticatedGet("/test/prohibido"), 403, "No tienes permiso.");
    }

    @Test
    void noEncontradoResponde404SoloConStatusYMessage() throws Exception {
        assertOnlyStatusAndMessage(authenticatedGet("/test/no-encontrado"), 404, "No existe.");
    }

    private void assertOnlyStatusAndMessage(MockHttpServletRequestBuilder request, int expectedStatus, String expectedMessage) throws Exception {
        mockMvc.perform(request)
                .andExpect(status().is(expectedStatus))
                .andExpect(jsonPath("$.status").value(expectedStatus))
                .andExpect(jsonPath("$.message").value(expectedMessage))
                .andExpect(jsonPath("$.errors").doesNotExist())
                .andExpect(jsonPath("$.timestamp").doesNotExist())
                .andExpect(jsonPath("$.error").doesNotExist())
                .andExpect(jsonPath("$.details").doesNotExist());
    }
}
