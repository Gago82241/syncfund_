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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

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
    private static final String DESCRIPCION_LARGA = "La descripción puede tener máximo 255 caracteres";
    private static final String MONTO_DEMASIADO_GRANDE = "El monto no puede superar $9.999.999.999";
    private static final String MONTO_MAXIMO = "9999999999";
    private static final String MONTO_FUERA = "10000000000";

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

    // ---- Textos de proyectos, categorías y movimientos ----

    @Test
    void proyectoConNombreDe101CaracteresResponde400() throws Exception {
        Cuenta ana = registrar("Ana");

        assertCampoInvalido(como(ana, post("/api/projects")).content(proyectoJson(ana, "a".repeat(101), "Prueba")),
                "name", "El nombre del proyecto puede tener máximo 100 caracteres");
    }

    @Test
    void proyectoConDescripcionDe501CaracteresResponde400() throws Exception {
        Cuenta ana = registrar("Ana");

        assertCampoInvalido(como(ana, post("/api/projects")).content(proyectoJson(ana, "Finca", "a".repeat(501))),
                "description", "La descripción puede tener máximo 500 caracteres");
    }

    @Test
    void proyectoEnLosLimitesResponde201() throws Exception {
        Cuenta ana = registrar("Ana");

        assertEquals(201, status(como(ana, post("/api/projects"))
                .content(proyectoJson(ana, "a".repeat(100), "a".repeat(500)))));
    }

    @Test
    void categoriaConNombreDe101CaracteresResponde400() throws Exception {
        Cuenta ana = registrar("Ana");

        assertCampoInvalido(como(ana, post("/api/categories")).content(categoriaJson("a".repeat(101), "0")),
                "name", "El nombre de la categoría puede tener máximo 100 caracteres");
    }

    @Test
    void movimientoConDescripcionDe256CaracteresResponde400() throws Exception {
        Cuenta ana = registrar("Ana");

        assertCampoInvalido(como(ana, post("/api/transactions")).content(movimientoJson(ana, "1000", "a".repeat(256))),
                "description", DESCRIPCION_LARGA);
    }

    @Test
    void movimientoConDescripcionDe255CaracteresResponde201() throws Exception {
        Cuenta ana = registrar("Ana");

        assertEquals(201, status(como(ana, post("/api/transactions")).content(movimientoJson(ana, "1000", "a".repeat(255)))));
    }

    @Test
    void aporteConDescripcionDe256CaracteresResponde400() throws Exception {
        Cuenta ana = registrar("Ana");
        depositar(ana, "100000");
        long proyecto = crearProyecto(ana);

        assertCampoInvalido(como(ana, post("/api/projects/" + proyecto + "/contributions"))
                        .content(aporteJson(ana, "1000", "a".repeat(256))),
                "description", DESCRIPCION_LARGA);
    }

    @Test
    void gastoCompartidoConDescripcionDe256CaracteresResponde400() throws Exception {
        Cuenta ana = registrar("Ana");
        depositar(ana, "100000");
        long proyecto = crearProyecto(ana);
        assertEquals(200, status(como(ana, post("/api/projects/" + proyecto + "/contributions"))
                .content(aporteJson(ana, "50000", "Aporte"))));

        assertCampoInvalido(como(ana, post("/api/projects/" + proyecto + "/expenses"))
                        .content(gastoCompartidoJson(ana, "1000", "a".repeat(256))),
                "description", DESCRIPCION_LARGA);
    }

    // ---- Montos: DECIMAL(12,2) admite hasta 9.999.999.999,99 ----

    @Test
    void movimientoConMontoQueNoCabeResponde400() throws Exception {
        Cuenta ana = registrar("Ana");

        assertCampoInvalido(como(ana, post("/api/transactions")).content(movimientoJson(ana, MONTO_FUERA, "Salario")),
                "amount", MONTO_DEMASIADO_GRANDE);
    }

    @Test
    void movimientoConElMontoMaximoResponde201() throws Exception {
        Cuenta ana = registrar("Ana");

        assertEquals(201, status(como(ana, post("/api/transactions")).content(movimientoJson(ana, MONTO_MAXIMO, "Salario"))));
    }

    @Test
    void categoriaConLimiteQueNoCabeResponde400() throws Exception {
        Cuenta ana = registrar("Ana");

        assertCampoInvalido(como(ana, post("/api/categories")).content(categoriaJson("Mercado", MONTO_FUERA)),
                "monthlyLimit", "El límite mensual no puede superar $9.999.999.999");
    }

    @Test
    void categoriaConElLimiteMaximoResponde201() throws Exception {
        Cuenta ana = registrar("Ana");

        assertEquals(201, status(como(ana, post("/api/categories")).content(categoriaJson("Mercado", MONTO_MAXIMO))));
    }

    @Test
    void aporteConMontoQueNoCabeResponde400() throws Exception {
        Cuenta ana = registrar("Ana");
        long proyecto = crearProyecto(ana);

        assertCampoInvalido(como(ana, post("/api/projects/" + proyecto + "/contributions"))
                        .content(aporteJson(ana, MONTO_FUERA, "Aporte")),
                "amount", MONTO_DEMASIADO_GRANDE);
    }

    @Test
    void gastoCompartidoConMontoQueNoCabeResponde400() throws Exception {
        Cuenta ana = registrar("Ana");
        long proyecto = crearProyecto(ana);

        assertCampoInvalido(como(ana, post("/api/projects/" + proyecto + "/expenses"))
                        .content(gastoCompartidoJson(ana, MONTO_FUERA, "Mercado")),
                "amount", MONTO_DEMASIADO_GRANDE);
    }

    @Test
    void pagoEntreIntegrantesConMontoQueNoCabeResponde400() throws Exception {
        Cuenta ana = registrar("Ana");
        Cuenta beto = registrar("Beto");
        long proyecto = crearProyecto(ana);
        assertEquals(200, status(como(ana, post("/api/projects/" + proyecto + "/members"))
                .content("{\"email\":\"" + beto.email() + "\"}")));

        assertCampoInvalido(como(beto, post("/api/projects/" + proyecto + "/settlements"))
                        .content("{\"payerId\":" + beto.id() + ",\"payeeId\":" + ana.id() + ",\"amount\":" + MONTO_FUERA + "}"),
                "amount", MONTO_DEMASIADO_GRANDE);
    }

    @Test
    void colchonConMontoQueNoCabeResponde400() throws Exception {
        Cuenta ana = registrar("Ana");

        assertCampoInvalido(como(ana, post("/api/wallets/personal/" + billetera(ana) + "/cushion"))
                        .content("{\"amount\":" + MONTO_FUERA + ",\"type\":\"APARTAR\"}"),
                "amount", MONTO_DEMASIADO_GRANDE);
    }

    @Test
    void metaDeAhorroQueNoCabeResponde400() throws Exception {
        Cuenta ana = registrar("Ana");

        assertCampoInvalido(como(ana, put("/api/wallets/personal/" + billetera(ana) + "/goal"))
                        .content("{\"monthlySavingsGoal\":" + MONTO_FUERA + "}"),
                "monthlySavingsGoal", "La meta de ahorro no puede superar $9.999.999.999");
    }

    // ---- Utilidades ----

    private record Cuenta(long id, String email, String token) {
    }

    private Cuenta registrar(String nombre) throws Exception {
        String email = correoAleatorio();
        String body = mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(registroJson(nombre, email, CLAVE)))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        return new Cuenta(((Number) JsonPath.read(body, "$.user.id")).longValue(), email, JsonPath.read(body, "$.token"));
    }

    private long billetera(Cuenta cuenta) throws Exception {
        String body = mockMvc.perform(como(cuenta, get("/api/wallets/personal/user/" + cuenta.id())))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        return ((Number) JsonPath.read(body, "$.walletId")).longValue();
    }

    private void depositar(Cuenta cuenta, String monto) throws Exception {
        assertEquals(201, status(como(cuenta, post("/api/transactions")).content(movimientoJson(cuenta, monto, "Salario"))));
    }

    private long crearProyecto(Cuenta admin) throws Exception {
        String body = mockMvc.perform(como(admin, post("/api/projects")).content(proyectoJson(admin, "Finca", "Prueba")))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        return ((Number) JsonPath.read(body, "$.projectId")).longValue();
    }

    private String movimientoJson(Cuenta cuenta, String monto, String descripcion) throws Exception {
        return "{\"amount\":" + monto + ",\"description\":\"" + descripcion + "\",\"type\":\"INGRESO\",\"originWalletId\":"
                + billetera(cuenta) + ",\"originWalletType\":\"PERSONAL\"}";
    }

    private static String proyectoJson(Cuenta admin, String nombre, String descripcion) {
        return "{\"name\":\"" + nombre + "\",\"description\":\"" + descripcion + "\",\"adminId\":" + admin.id() + "}";
    }

    private static String categoriaJson(String nombre, String limite) {
        return "{\"name\":\"" + nombre + "\",\"monthlyLimit\":" + limite + "}";
    }

    private static String aporteJson(Cuenta aportante, String monto, String descripcion) {
        return "{\"amount\":" + monto + ",\"contributorId\":" + aportante.id() + ",\"description\":\"" + descripcion + "\"}";
    }

    private static String gastoCompartidoJson(Cuenta pagador, String monto, String descripcion) {
        return "{\"amount\":" + monto + ",\"payerId\":" + pagador.id() + ",\"involvedIdsList\":[" + pagador.id()
                + "],\"description\":\"" + descripcion + "\"}";
    }

    private MockHttpServletRequestBuilder como(Cuenta cuenta, MockHttpServletRequestBuilder request) {
        return como(cuenta.token(), request);
    }

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
