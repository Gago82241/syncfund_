package com.syncfund;

import com.jayway.jsonpath.JsonPath;
import com.syncfund.domain.model.User;
import com.syncfund.persistence.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * Límites de entrada alineados con las columnas: un dato demasiado largo o grande debe responder
 * 400 con un mensaje por campo, nunca llegar a MySQL (ni a BCrypt) y terminar en 500.
 *
 * Cada prueba corre dentro de una transacción que se deshace al terminar (@Transactional),
 * así que la base local queda intacta. Los usuarios se crean con correos aleatorios.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class LimitesEntradaIntegrationTests {

    private static final String REVISA_LOS_DATOS = "Revisa los datos ingresados.";
    private static final String CLAVE = "clave-123";
    /** 37 "ñ" = 37 caracteres pero 74 bytes en UTF-8: pasa @Size y debe fallar por bytes. */
    private static final String CLAVE_74_BYTES = "ñ".repeat(37);
    private static final String CLAVE_DEMASIADO_LARGA =
            "Es demasiado larga. Usa una más corta (máximo 72; las tildes, la ñ y los emojis ocupan más).";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ---- Registro ----

    @Test
    void registroConNombreDe101CaracteresResponde400() throws Exception {
        assertCampoInvalido(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(registroJson("a".repeat(101), correoAleatorio(), CLAVE)),
                "name", "El nombre puede tener máximo 100 caracteres");
    }

    @Test
    void registroConCorreoDe151CaracteresResponde400() throws Exception {
        String correo = correoDeLargo(151);

        assertCampoInvalido(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(registroJson("Ana", correo, CLAVE)),
                "email", "El correo puede tener máximo 150 caracteres");
    }

    @Test
    void registroConContrasenaDe7CaracteresResponde400() throws Exception {
        assertCampoInvalido(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(registroJson("Ana", correoAleatorio(), "clave12")),
                "password", "La contraseña debe tener al menos 8 caracteres");
    }

    @Test
    void registroConContrasenaDeMasDe72BytesResponde400() throws Exception {
        assertCampoInvalido(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(registroJson("Ana", correoAleatorio(), CLAVE_74_BYTES)),
                "password", CLAVE_DEMASIADO_LARGA);
    }

    @Test
    void registroEnLosLimitesResponde201() throws Exception {
        String correo = correoDeLargo(150);

        assertEquals(201, status(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content(registroJson("a".repeat(100), correo, "ñ".repeat(36)))));
        assertEquals(201, status(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content(registroJson("Ana", correoAleatorio(), "clave-12"))));
    }

    // ---- Login ----

    @Test
    void loginConContrasenaDeMasDe72BytesResponde400() throws Exception {
        assertCampoInvalido(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + correoAleatorio() + "\",\"password\":\"" + CLAVE_74_BYTES + "\"}"),
                "password", CLAVE_DEMASIADO_LARGA);
    }

    @Test
    void cuentaAntiguaConContrasenaDe6CaracteresSigueEntrando() throws Exception {
        // Se guarda directo en la base, como las cuentas creadas cuando el mínimo era 6.
        String correo = correoAleatorio();
        User antigua = new User();
        antigua.setName("Cuenta antigua");
        antigua.setEmail(correo);
        antigua.setPassword(passwordEncoder.encode("abc123"));
        userRepository.save(antigua);

        assertEquals(200, status(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + correo + "\",\"password\":\"abc123\"}")));
    }

    // ---- Utilidades ----

    private void assertCampoInvalido(MockHttpServletRequestBuilder request, String campo, String mensaje)
            throws Exception {
        MvcResult result = mockMvc.perform(request).andReturn();
        String body = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertEquals(400, result.getResponse().getStatus(), body);
        assertEquals(400, ((Number) JsonPath.read(body, "$.status")).intValue());
        assertEquals(REVISA_LOS_DATOS, JsonPath.read(body, "$.message"));
        assertEquals(mensaje, JsonPath.read(body, "$.errors." + campo));
    }

    private int status(MockHttpServletRequestBuilder request) throws Exception {
        return mockMvc.perform(request).andReturn().getResponse().getStatus();
    }

    private static String registroJson(String nombre, String correo, String clave) {
        return "{\"name\":\"" + nombre + "\",\"email\":\"" + correo + "\",\"password\":\"" + clave + "\"}";
    }

    private static String correoAleatorio() {
        return "it-" + UUID.randomUUID() + "@syncfund.test";
    }

    /**
     * Correo aleatorio con formato válido y el largo pedido: @Email limita la parte local a 64
     * caracteres y cada parte del dominio a 63, así que el relleno va en varias partes del dominio.
     */
    private static String correoDeLargo(int largo) {
        StringBuilder correo = new StringBuilder("it-" + UUID.randomUUID() + "@");
        String terminacion = "syncfund.test";
        while (correo.length() + 10 + terminacion.length() + 2 <= largo) {
            correo.append("bbbbbbbbb.");
        }
        correo.append("b".repeat(largo - correo.length() - terminacion.length() - 1)).append('.');
        correo.append(terminacion);
        assertEquals(largo, correo.length());
        return correo.toString();
    }

    private MockHttpServletRequestBuilder como(String token, MockHttpServletRequestBuilder request) {
        return request.header(HttpHeaders.AUTHORIZATION, "Bearer " + token).contentType(MediaType.APPLICATION_JSON);
    }
}
