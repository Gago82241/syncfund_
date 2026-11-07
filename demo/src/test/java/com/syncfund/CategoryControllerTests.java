package com.syncfund;

import com.syncfund.application.dto.request.CreateCategoryRequest;
import com.syncfund.application.dto.response.CategoryResponse;
import com.syncfund.application.exception.ForbiddenException;
import com.syncfund.application.service.CategoryAppService;
import com.syncfund.config.CorsConfig;
import com.syncfund.config.SecurityConfig;
import com.syncfund.presentation.controller.CategoryController;
import com.syncfund.security.JwtService;
import com.syncfund.security.RestAuthenticationEntryPoint;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Comprueba cómo responde la API de categorías, sin necesitar la base de datos. */
@WebMvcTest(CategoryController.class)
@Import({SecurityConfig.class, CorsConfig.class, JwtService.class, RestAuthenticationEntryPoint.class})
@TestPropertySource(properties = {
        "jwt.secret=clave-ficticia-solo-para-pruebas-automaticas-0123456789",
        "jwt.expiration-ms=60000",
        "app.cors.allowed-origins=http://localhost:5173"
})
class CategoryControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private CategoryAppService service;

    @Test
    void categoriaAjenaResponde403ConElFormatoAcordado() throws Exception {
        when(service.findById(20L)).thenThrow(new ForbiddenException("Esta categoría no te pertenece."));

        mockMvc.perform(get("/api/categories/20").header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Esta categoría no te pertenece."))
                .andExpect(jsonPath("$.errors").doesNotExist());
    }

    @Test
    void crearIgnoraUnDuenoEnviadoEnElCuerpo() throws Exception {
        when(service.create(any(CreateCategoryRequest.class))).thenReturn(new CategoryResponse(10L, "Comida", 100));

        mockMvc.perform(post("/api/categories")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Comida\",\"monthlyLimit\":100,\"userId\":2,\"owner\":{\"id\":2}}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").doesNotExist())
                .andExpect(jsonPath("$.owner").doesNotExist());

        ArgumentCaptor<CreateCategoryRequest> received = ArgumentCaptor.forClass(CreateCategoryRequest.class);
        verify(service).create(received.capture());
        assertEquals("Comida", received.getValue().getName());
    }

    private String bearerToken() {
        return "Bearer " + jwtService.generateToken(1L, "ana@example.com");
    }
}
