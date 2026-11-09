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
import java.util.UUID;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * Flujo real de punta a punta del fondo de un proyecto compartido: HTTP con JWT real,
 * validación, controllers, services, repositories y la base MySQL del perfil local.
 *
 * Cada prueba corre dentro de una transacción que se deshace al terminar (@Transactional),
 * así que la base local queda intacta. Solo avanzan los contadores AUTO_INCREMENT de MySQL.
 * Los usuarios se crean con correos aleatorios para no chocar con datos existentes.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class FondoCompartidoIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    // ---- Aportes ----

    @Test
    void aporteDescuentaDeLaBilleteraSumaAlFondoYQuedaEnAmbosHistoriales() throws Exception {
        Cuenta ana = registrar("Ana");
        depositar(ana, 150_000);
        long proyecto = crearProyecto(ana, "Viaje a Santa Marta");

        int status = aportar(ana, proyecto, 100_000);

        assertEquals(200, status);
        assertEquals(50_000, saldoBilletera(ana));
        assertEquals(100_000, fondo(ana, proyecto));

        String movimientosBilletera = movimientos(ana, billetera(ana), "PERSONAL");
        assertTrue(contiene(movimientosBilletera, "GASTO", 100_000, "Aporte a «Viaje a Santa Marta»"),
                "La billetera debe tener el GASTO del aporte: " + movimientosBilletera);

        String movimientosProyecto = movimientos(ana, proyecto, "SHARED");
        List<Object> ingresos = JsonPath.read(movimientosProyecto, "$[?(@.type == 'INGRESO')].involvedIdsList");
        assertEquals(1, ingresos.size());
        assertEquals(List.of(ana.id()), ids(ingresos.get(0)));
    }

    @Test
    void aporteSinSaldoSuficienteResponde422YNoCambiaNada() throws Exception {
        Cuenta ana = registrar("Ana");
        depositar(ana, 30_000);
        long proyecto = crearProyecto(ana, "Arriendo");

        MvcResult result = mockMvc.perform(como(ana, post("/api/projects/" + proyecto + "/contributions"))
                .content(aporteJson(ana, 50_000))).andReturn();

        assertEquals(422, result.getResponse().getStatus());
        String body = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertEquals(422, (int) JsonPath.read(body, "$.status"));
        assertEquals("Saldo insuficiente en tu billetera personal para este aporte.", JsonPath.read(body, "$.message"));
        assertEquals(30_000, saldoBilletera(ana));
        assertEquals(0, fondo(ana, proyecto));
        assertEquals("[]", movimientos(ana, proyecto, "SHARED"));
    }

    // ---- Saldo neto ----

    /**
     * Ana aporta 100.000 y Beto 20.000; Caro no aporta.
     * Gasto de 60.000 entre los tres (20.000 c/u) y gasto de 30.000 entre Ana y Beto (15.000 c/u).
     * Ana = 100.000 - 35.000 = 65.000 · Beto = 20.000 - 35.000 = -15.000 · Caro = -20.000.
     * Fondo = 120.000 - 90.000 = 30.000 = suma de los saldos netos.
     */
    @Test
    void saldoNetoConNumerosConcretos() throws Exception {
        Cuenta ana = registrar("Ana");
        Cuenta beto = registrar("Beto");
        Cuenta caro = registrar("Caro");
        depositar(ana, 150_000);
        depositar(beto, 50_000);
        long proyecto = crearProyecto(ana, "Finca");
        agregarIntegrante(ana, proyecto, beto);
        agregarIntegrante(ana, proyecto, caro);

        assertEquals(200, aportar(ana, proyecto, 100_000));
        assertEquals(200, aportar(beto, proyecto, 20_000));
        assertEquals(201, gastar(ana, proyecto, 60_000, ana, beto, caro));
        assertEquals(201, gastar(beto, proyecto, 30_000, ana, beto));

        double netoAna = saldoNeto(ana, proyecto);
        double netoBeto = saldoNeto(beto, proyecto);
        double netoCaro = saldoNeto(caro, proyecto);

        assertEquals(65_000, netoAna);
        assertEquals(-15_000, netoBeto);
        assertEquals(-20_000, netoCaro);
        assertEquals(30_000, fondo(ana, proyecto));
        assertEquals(fondo(ana, proyecto), netoAna + netoBeto + netoCaro);

        // Las billeteras solo cambian por los aportes: los gastos los pagó el fondo.
        assertEquals(50_000, saldoBilletera(ana));   // 150.000 - 100.000
        assertEquals(30_000, saldoBilletera(beto));  //  50.000 -  20.000
        assertEquals(0, saldoBilletera(caro));
    }

    // ---- Gastos: los paga solo el fondo ----

    @Test
    void gastoSoloDescuentaDelFondoYNoDeLasBilleteras() throws Exception {
        Cuenta ana = registrar("Ana");
        Cuenta beto = registrar("Beto");
        depositar(ana, 100_000);
        depositar(beto, 40_000);
        long proyecto = crearProyecto(ana, "Mercado");
        agregarIntegrante(ana, proyecto, beto);
        assertEquals(200, aportar(ana, proyecto, 80_000));

        assertEquals(201, gastar(ana, proyecto, 50_000, ana, beto));

        assertEquals(30_000, fondo(ana, proyecto));
        assertEquals(20_000, saldoBilletera(ana));   // 100.000 - 80.000 del aporte
        assertEquals(40_000, saldoBilletera(beto));  // intacta
        assertEquals(55_000, saldoNeto(ana, proyecto));   // 80.000 - 25.000
        assertEquals(-25_000, saldoNeto(beto, proyecto)); //      0 - 25.000
    }

    @Test
    void gastoMayorQueElFondoResponde422YNoCambiaNada() throws Exception {
        Cuenta ana = registrar("Ana");
        Cuenta beto = registrar("Beto");
        depositar(ana, 100_000);
        long proyecto = crearProyecto(ana, "Paseo");
        agregarIntegrante(ana, proyecto, beto);
        assertEquals(200, aportar(ana, proyecto, 30_000));

        MvcResult result = mockMvc.perform(como(ana, post("/api/projects/" + proyecto + "/expenses"))
                .content(gastoJson(ana, 50_000, ana, beto))).andReturn();

        assertEquals(422, result.getResponse().getStatus());
        String body = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertEquals(422, (int) JsonPath.read(body, "$.status"));
        assertEquals("El fondo del proyecto no tiene saldo suficiente para este gasto.", JsonPath.read(body, "$.message"));
        assertEquals(30_000, fondo(ana, proyecto));
        assertEquals(70_000, saldoBilletera(ana));
        assertEquals(0, saldoBilletera(beto));
        List<Object> gastos = JsonPath.read(movimientos(ana, proyecto, "SHARED"), "$[?(@.type == 'GASTO')]");
        assertTrue(gastos.isEmpty(), "No debe quedar registrado el gasto rechazado");
        assertEquals(30_000, saldoNeto(ana, proyecto));
        assertEquals(0, saldoNeto(beto, proyecto));
    }

    @Test
    void gastoIgualAlFondoLoDejaEnCero() throws Exception {
        Cuenta ana = registrar("Ana");
        depositar(ana, 100_000);
        long proyecto = crearProyecto(ana, "Cena");
        assertEquals(200, aportar(ana, proyecto, 45_000));

        assertEquals(201, gastar(ana, proyecto, 45_000, ana));

        assertEquals(0, fondo(ana, proyecto));
        assertEquals(0, saldoNeto(ana, proyecto));
    }

    @Test
    void ingresoDirectoAlFondoResponde422() throws Exception {
        Cuenta ana = registrar("Ana");
        long proyecto = crearProyecto(ana, "Arriendo");

        String json = "{\"amount\":50000,\"description\":\"Plata extra\",\"type\":\"INGRESO\",\"originWalletId\":"
                + proyecto + ",\"originWalletType\":\"SHARED\",\"involvedIdsList\":[" + ana.id() + "]}";
        MvcResult result = mockMvc.perform(como(ana, post("/api/transactions")).content(json)).andReturn();

        assertEquals(422, result.getResponse().getStatus());
        assertEquals("Para sumar dinero al fondo usa la opción Aportar.",
                JsonPath.read(result.getResponse().getContentAsString(StandardCharsets.UTF_8), "$.message"));
        assertEquals(0, fondo(ana, proyecto));
        assertEquals(0, saldoNeto(ana, proyecto));
    }

    // ---- Utilidades HTTP ----

    private record Cuenta(long id, String email, String token) {
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
        return status(como(cuenta, post("/api/projects/" + proyecto + "/contributions")).content(aporteJson(cuenta, monto)));
    }

    private int gastar(Cuenta pagador, long proyecto, double monto, Cuenta... involucrados) throws Exception {
        return status(como(pagador, post("/api/projects/" + proyecto + "/expenses"))
                .content(gastoJson(pagador, monto, involucrados)));
    }

    private double fondo(Cuenta cuenta, long proyecto) throws Exception {
        return ((Number) JsonPath.read(ok(como(cuenta, get("/api/projects/" + proyecto))), "$.currentBalance")).doubleValue();
    }

    private double saldoNeto(Cuenta cuenta, long proyecto) throws Exception {
        String body = ok(como(cuenta, get("/api/projects/" + proyecto + "/debts/" + cuenta.id())));
        return ((Number) JsonPath.read(body, "$.netBalance")).doubleValue();
    }

    private String movimientos(Cuenta cuenta, long walletId, String tipo) throws Exception {
        return ok(como(cuenta, get("/api/transactions/wallet/" + walletId + "?walletType=" + tipo)));
    }

    private static String aporteJson(Cuenta cuenta, double monto) {
        return "{\"amount\":" + monto + ",\"contributorId\":" + cuenta.id() + ",\"description\":\"Aporte al fondo\"}";
    }

    private static String gastoJson(Cuenta pagador, double monto, Cuenta... involucrados) {
        String ids = Arrays.stream(involucrados).map(c -> String.valueOf(c.id())).collect(Collectors.joining(","));
        return "{\"amount\":" + monto + ",\"payerId\":" + pagador.id() + ",\"involvedIdsList\":[" + ids
                + "],\"description\":\"Mercado\"}";
    }

    private static boolean contiene(String movimientos, String tipo, double monto, String descripcion) {
        List<Object> encontrados = JsonPath.read(movimientos,
                "$[?(@.type == '" + tipo + "' && @.amount == " + monto + " && @.description == '" + descripcion + "')]");
        return !encontrados.isEmpty();
    }

    private static List<Long> ids(Object jsonArray) {
        return ((List<?>) jsonArray).stream().map(id -> ((Number) id).longValue()).toList();
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
