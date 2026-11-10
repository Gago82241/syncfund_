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
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * Correcciones de la auditoría de autorización, probadas de punta a punta: HTTP con JWT real,
 * controllers, services, repositories y la base MySQL del perfil local.
 *
 * Cada prueba corre dentro de una transacción que se deshace al terminar (@Transactional),
 * así que la base local queda intacta. Los usuarios se crean con correos aleatorios.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class CorreccionesAuditoriaIntegrationTests {

    private static final String SALDO_INSUFICIENTE = "Saldo insuficiente para realizar la transacción.";

    @Autowired
    private MockMvc mockMvc;

    // ---- Sobregiro en la billetera personal ----

    @Test
    void sobregiroEnviadoPorElClienteResponde422YNoCambiaElSaldo() throws Exception {
        Cuenta ana = registrar("Ana");
        depositar(ana, 10_000);

        MvcResult result = mockMvc.perform(como(ana, post("/api/transactions"))
                .content(gastoPersonalJson(ana, 50_000, true))).andReturn();

        assertEquals(422, result.getResponse().getStatus());
        assertEquals(SALDO_INSUFICIENTE,
                JsonPath.read(result.getResponse().getContentAsString(StandardCharsets.UTF_8), "$.message"));
        assertEquals(10_000, saldoBilletera(ana));
        assertEquals(1, cantidadDeMovimientos(ana), "Solo debe quedar el depósito inicial");
    }

    @Test
    void gastoPersonalSinSaldoResponde422() throws Exception {
        Cuenta ana = registrar("Ana");
        depositar(ana, 10_000);

        MvcResult result = mockMvc.perform(como(ana, post("/api/transactions"))
                .content(gastoPersonalJson(ana, 50_000, false))).andReturn();

        assertEquals(422, result.getResponse().getStatus());
        assertEquals(10_000, saldoBilletera(ana));
    }

    @Test
    void gastoPersonalConSaldoSuficienteResponde201AunqueEnvieElCampo() throws Exception {
        Cuenta ana = registrar("Ana");
        depositar(ana, 10_000);

        assertEquals(201, status(como(ana, post("/api/transactions")).content(gastoPersonalJson(ana, 4_000, true))));
        assertEquals(6_000, saldoBilletera(ana));
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

    private String gastoPersonalJson(Cuenta cuenta, double monto, boolean allowOverdraft) throws Exception {
        return "{\"amount\":" + monto + ",\"description\":\"Compra\",\"type\":\"GASTO\",\"originWalletId\":"
                + billetera(cuenta) + ",\"originWalletType\":\"PERSONAL\",\"allowOverdraft\":" + allowOverdraft + "}";
    }

    private int cantidadDeMovimientos(Cuenta cuenta) throws Exception {
        List<Object> movimientos = JsonPath.read(
                ok(como(cuenta, get("/api/transactions/wallet/" + billetera(cuenta) + "?walletType=PERSONAL"))), "$");
        return movimientos.size();
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
