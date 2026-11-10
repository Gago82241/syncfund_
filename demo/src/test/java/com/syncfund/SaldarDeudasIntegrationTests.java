package com.syncfund;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * Situación del proyecto y pago de deudas entre integrantes, de punta a punta: HTTP con JWT real,
 * validación, controllers, services, repositories y la base MySQL del perfil local.
 *
 * Cada prueba corre dentro de una transacción que se deshace al terminar (@Transactional).
 * Los usuarios se crean con correos aleatorios para no chocar con datos existentes.
 *
 * Ejemplo base (sección 6 del plan): billeteras Ana 200.000, Beto 100.000, Caro 100.000.
 * Ana aporta 90.000 y Beto 30.000; gasto de 105.000 entre los tres (35.000 c/u). Fondo 15.000.
 * Saldos: Ana a favor 55.000, Beto debe 5.000, Caro debe 35.000.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class SaldarDeudasIntegrationTests {

    private static final double DELTA = 0.001;

    @Autowired
    private MockMvc mockMvc;

    // ---- Situación del proyecto ----

    @Test
    void situacionDelEjemploConNumerosConcretos() throws Exception {
        Ejemplo e = ejemplo();

        String body = ok(como(e.caro(), get(situacionUrl(e.proyecto()))));

        assertEquals(e.proyecto(), numero(body, "$.projectId"), DELTA);
        assertEquals(15_000, numero(body, "$.fund"), DELTA);
        assertEquals(15_000, numero(body, "$.totalBalances"), DELTA);
        assertEquals(0, numero(body, "$.unassigned"), DELTA);

        assertEquals("Ana", JsonPath.read(body, "$.members[0].name"));
        assertEquals(90_000, numero(body, "$.members[0].contributed"), DELTA);
        assertEquals(35_000, numero(body, "$.members[0].shareOfExpenses"), DELTA);
        assertEquals(55_000, numero(body, "$.members[0].netBalance"), DELTA);
        assertEquals(-5_000, saldoEnSituacion(body, e.beto()), DELTA);
        assertEquals(-35_000, saldoEnSituacion(body, e.caro()), DELTA);
    }

    @Test
    void situacionNoExponeCorreosNiSaldosDeBilletera() throws Exception {
        Ejemplo e = ejemplo();

        String body = ok(como(e.beto(), get(situacionUrl(e.proyecto()))));

        for (Cuenta cuenta : List.of(e.ana(), e.beto(), e.caro())) {
            assertFalse(body.contains(cuenta.email()), "La situación no debe incluir correos: " + body);
        }
        List<Map<String, Object>> members = JsonPath.read(body, "$.members");
        for (Map<String, Object> member : members) {
            assertEquals(Set.of("userId", "name", "contributed", "shareOfExpenses",
                    "paymentsMade", "paymentsReceived", "netBalance"), member.keySet());
        }
        assertFalse(body.contains("110000"), "No debe aparecer el saldo de la billetera de Ana: " + body);
    }

    @Test
    void situacionDeUnProyectoAjenoResponde403() throws Exception {
        Ejemplo e = ejemplo();
        Cuenta intrusa = registrar("Intrusa");

        MvcResult result = mockMvc.perform(como(intrusa, get(situacionUrl(e.proyecto())))).andReturn();

        assertEquals(403, result.getResponse().getStatus());
        assertEquals("No perteneces a este proyecto compartido.", mensaje(result));
    }

    @Test
    void situacionSinSesionResponde401() throws Exception {
        Ejemplo e = ejemplo();

        assertEquals(401, mockMvc.perform(get(situacionUrl(e.proyecto()))).andReturn().getResponse().getStatus());
    }

    @Test
    void situacionDeUnProyectoInexistenteResponde404() throws Exception {
        Cuenta ana = registrar("Ana");

        assertEquals(404, status(como(ana, get(situacionUrl(Long.MAX_VALUE)))));
    }

    // ---- Ejemplo base ----

    private record Ejemplo(Cuenta ana, Cuenta beto, Cuenta caro, long proyecto) {
    }

    private Ejemplo ejemplo() throws Exception {
        Cuenta ana = registrar("Ana");
        Cuenta beto = registrar("Beto");
        Cuenta caro = registrar("Caro");
        depositar(ana, 200_000);
        depositar(beto, 100_000);
        depositar(caro, 100_000);
        long proyecto = crearProyecto(ana, "Viaje");
        agregarIntegrante(ana, proyecto, beto);
        agregarIntegrante(ana, proyecto, caro);
        assertEquals(200, aportar(ana, proyecto, 90_000));
        assertEquals(200, aportar(beto, proyecto, 30_000));
        assertEquals(201, gastar(ana, proyecto, 105_000, ana, beto, caro));
        return new Ejemplo(ana, beto, caro, proyecto);
    }

    // ---- Utilidades HTTP ----

    private record Cuenta(long id, String email, String token) {
    }

    private static String situacionUrl(long proyecto) {
        return "/api/projects/" + proyecto + "/balances";
    }

    private double saldoEnSituacion(String body, Cuenta cuenta) {
        List<Object> saldos = JsonPath.read(body, "$.members[?(@.userId == " + cuenta.id() + ")].netBalance");
        assertEquals(1, saldos.size(), body);
        return ((Number) saldos.get(0)).doubleValue();
    }

    private Cuenta registrar(String nombre) throws Exception {
        String email = "it-" + UUID.randomUUID() + "@syncfund.test";
        String body = mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + nombre + "\",\"email\":\"" + email + "\",\"password\":\"clave-123\"}"))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        return new Cuenta(((Number) JsonPath.read(body, "$.user.id")).longValue(), email, JsonPath.read(body, "$.token"));
    }

    private long billetera(Cuenta cuenta) throws Exception {
        return ((Number) JsonPath.read(leerBilletera(cuenta), "$.walletId")).longValue();
    }

    private double saldoBilletera(Cuenta cuenta) throws Exception {
        return ((Number) JsonPath.read(leerBilletera(cuenta), "$.currentBalance")).doubleValue();
    }

    private String leerBilletera(Cuenta cuenta) throws Exception {
        return ok(como(cuenta, get("/api/wallets/personal/user/" + cuenta.id())));
    }

    private void depositar(Cuenta cuenta, double monto) throws Exception {
        String json = "{\"amount\":" + monto + ",\"description\":\"Salario\",\"type\":\"INGRESO\",\"originWalletId\":"
                + billetera(cuenta) + ",\"originWalletType\":\"PERSONAL\"}";
        assertEquals(201, status(como(cuenta, post("/api/transactions")).content(json)));
    }

    private long crearProyecto(Cuenta admin, String nombre) throws Exception {
        String body = mockMvc.perform(como(admin, post("/api/projects"))
                        .content("{\"name\":\"" + nombre + "\",\"description\":\"Prueba\",\"adminId\":" + admin.id() + "}"))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        return ((Number) JsonPath.read(body, "$.projectId")).longValue();
    }

    private void agregarIntegrante(Cuenta admin, long proyecto, Cuenta integrante) throws Exception {
        assertEquals(200, status(como(admin, post("/api/projects/" + proyecto + "/members"))
                .content("{\"email\":\"" + integrante.email() + "\"}")));
    }

    private int aportar(Cuenta cuenta, long proyecto, double monto) throws Exception {
        return status(como(cuenta, post("/api/projects/" + proyecto + "/contributions"))
                .content("{\"amount\":" + monto + ",\"contributorId\":" + cuenta.id() + ",\"description\":\"Aporte al fondo\"}"));
    }

    private int gastar(Cuenta pagador, long proyecto, double monto, Cuenta... involucrados) throws Exception {
        String ids = Arrays.stream(involucrados).map(c -> String.valueOf(c.id())).collect(Collectors.joining(","));
        return status(como(pagador, post("/api/projects/" + proyecto + "/expenses"))
                .content("{\"amount\":" + monto + ",\"payerId\":" + pagador.id() + ",\"involvedIdsList\":[" + ids
                        + "],\"description\":\"Mercado\"}"));
    }

    private double fondo(Cuenta cuenta, long proyecto) throws Exception {
        return numero(ok(como(cuenta, get("/api/projects/" + proyecto))), "$.currentBalance");
    }

    private double saldoNeto(Cuenta cuenta, long proyecto) throws Exception {
        return numero(ok(como(cuenta, get("/api/projects/" + proyecto + "/debts/" + cuenta.id()))), "$.netBalance");
    }

    private String movimientos(Cuenta cuenta, long walletId, String tipo) throws Exception {
        return ok(como(cuenta, get("/api/transactions/wallet/" + walletId + "?walletType=" + tipo)));
    }

    private static double numero(String body, String path) {
        return ((Number) JsonPath.read(body, path)).doubleValue();
    }

    private static String mensaje(MvcResult result) throws Exception {
        return JsonPath.read(result.getResponse().getContentAsString(StandardCharsets.UTF_8), "$.message");
    }

    private MockHttpServletRequestBuilder como(Cuenta cuenta, MockHttpServletRequestBuilder request) {
        return request.header(HttpHeaders.AUTHORIZATION, "Bearer " + cuenta.token())
                .contentType(MediaType.APPLICATION_JSON);
    }

    private int status(MockHttpServletRequestBuilder request) throws Exception {
        return mockMvc.perform(request).andReturn().getResponse().getStatus();
    }

    private String ok(MockHttpServletRequestBuilder request) throws Exception {
        MvcResult result = mockMvc.perform(request).andReturn();
        assertEquals(200, result.getResponse().getStatus(), result.getResponse().getContentAsString(StandardCharsets.UTF_8));
        return result.getResponse().getContentAsString(StandardCharsets.UTF_8);
    }
}
