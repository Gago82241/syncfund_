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
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * Eliminar integrantes y salir de un proyecto, de punta a punta: HTTP con JWT real, controllers,
 * services, repositories y la base MySQL del perfil local.
 *
 * Cada prueba corre dentro de una transacción que se deshace al terminar (@Transactional).
 * Los usuarios se crean con correos aleatorios para no chocar con datos existentes.
 *
 * Ejemplo base: Ana (administradora) aporta 90.000, Beto 30.000 y Dani 25.000. Gasto de 100.000
 * entre los cuatro (25.000 c/u) y gasto de 25.000 entre Ana y Beto (12.500 c/u). Fondo 20.000.
 * Saldos: Ana +52.500, Beto −7.500, Caro −25.000, Dani 0 (al día, pero participó en un gasto).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class EliminarIntegrantesIntegrationTests {

    private static final double DELTA = 0.001;

    @Autowired
    private MockMvc mockMvc;

    // ---- Eliminar a un integrante al día ----

    @Test
    void eliminarAQuienEstaAlDiaNoCambiaLosSaldosDeLosDemasNiElFondo() throws Exception {
        Ejemplo e = ejemplo();
        String antes = ok(como(e.ana(), get(situacionUrl(e.proyecto()))));
        assertEquals(0, saldoEnSituacion(antes, e.dani()), DELTA);

        assertEquals(204, quitar(e.ana(), e.proyecto(), e.dani()));

        String despues = ok(como(e.ana(), get(situacionUrl(e.proyecto()))));
        assertEquals(20_000, numero(despues, "$.fund"), DELTA);
        assertEquals(numero(antes, "$.fund"), numero(despues, "$.fund"), DELTA);
        assertEquals(numero(antes, "$.totalBalances"), numero(despues, "$.totalBalances"), DELTA);
        assertEquals(numero(antes, "$.unassigned"), numero(despues, "$.unassigned"), DELTA);
        for (Cuenta cuenta : List.of(e.ana(), e.beto(), e.caro())) {
            assertEquals(saldoEnSituacion(antes, cuenta), saldoEnSituacion(despues, cuenta), DELTA);
            assertEquals(parteEnSituacion(antes, cuenta), parteEnSituacion(despues, cuenta), DELTA);
        }
        assertEquals(52_500, saldoEnSituacion(despues, e.ana()), DELTA);
        assertEquals(-7_500, saldoEnSituacion(despues, e.beto()), DELTA);
        assertEquals(-25_000, saldoEnSituacion(despues, e.caro()), DELTA);

        // Ya no está en la situación ni en la lista de integrantes del proyecto.
        assertEquals(3, (int) JsonPath.read(despues, "$.members.length()"));
        assertFalse(memberIds(e.ana(), e.proyecto()).contains(e.dani().id()));
        assertEquals(20_000, fondo(e.ana(), e.proyecto()), DELTA);
    }

    @Test
    void elHistorialDelEliminadoSigueVisible() throws Exception {
        Ejemplo e = ejemplo();
        String antes = movimientos(e.ana(), e.proyecto(), "SHARED");

        assertEquals(204, quitar(e.ana(), e.proyecto(), e.dani()));

        String despues = movimientos(e.ana(), e.proyecto(), "SHARED");
        assertEquals(antes, despues);
        List<Object> aporteDeDani = JsonPath.read(despues,
                "$[?(@.type == 'INGRESO' && @.amount == 25000.0)].involvedIdsList[0]");
        assertEquals(List.of((int) e.dani().id()), aporteDeDani.stream().map(id -> ((Number) id).intValue()).toList());
        List<List<Object>> gastoCompartido = JsonPath.read(despues,
                "$[?(@.type == 'GASTO' && @.amount == 100000.0)].involvedIdsList");
        assertEquals(1, gastoCompartido.size());
        assertTrue(gastoCompartido.get(0).stream().anyMatch(id -> ((Number) id).longValue() == e.dani().id()));
    }

    @Test
    void elEliminadoYaNoPuedeVerElProyectoNiRegistrarMovimientos() throws Exception {
        Ejemplo e = ejemplo();
        assertEquals(204, quitar(e.ana(), e.proyecto(), e.dani()));

        String noPertenece = "No perteneces a este proyecto compartido.";
        assertRespuesta(como(e.dani(), get("/api/projects/" + e.proyecto())), 403, noPertenece);
        assertRespuesta(como(e.dani(), get(situacionUrl(e.proyecto()))), 403, noPertenece);
        assertRespuesta(como(e.dani(), get("/api/transactions/wallet/" + e.proyecto() + "?walletType=SHARED")),
                403, noPertenece);
        assertRespuesta(aporte(e.dani(), e.proyecto(), 5_000), 403, noPertenece);
        assertRespuesta(gasto(e.dani(), e.proyecto(), 5_000, e.dani()), 403, noPertenece);
        assertFalse(ok(como(e.dani(), get("/api/projects/user/" + e.dani().id())))
                .contains("\"projectId\":" + e.proyecto()));

        // Tampoco se le puede incluir en un gasto nuevo.
        assertRespuesta(gasto(e.ana(), e.proyecto(), 4_000, e.ana(), e.dani()), 403,
                "Solo puedes repartir un gasto entre integrantes del proyecto.");
        assertEquals(20_000, fondo(e.ana(), e.proyecto()), DELTA);
    }

    @Test
    void elEliminadoPuedeVolverASerAgregado() throws Exception {
        Ejemplo e = ejemplo();
        String antes = ok(como(e.ana(), get(situacionUrl(e.proyecto()))));
        assertEquals(204, quitar(e.ana(), e.proyecto(), e.dani()));

        agregarIntegrante(e.ana(), e.proyecto(), e.dani());

        // Vuelve con el mismo saldo (0) y la situación queda igual que antes de eliminarlo.
        String despues = ok(como(e.dani(), get(situacionUrl(e.proyecto()))));
        assertEquals(0, saldoEnSituacion(despues, e.dani()), DELTA);
        assertEquals(25_000, numero(despues, "$.members[?(@.userId == " + e.dani().id() + ")].contributed"), DELTA);
        assertEquals(numero(antes, "$.totalBalances"), numero(despues, "$.totalBalances"), DELTA);
        assertTrue(memberIds(e.ana(), e.proyecto()).contains(e.dani().id()));
        assertEquals(200, status(aporte(e.dani(), e.proyecto(), 5_000)));
        assertEquals(5_000, saldoNeto(e.dani(), e.proyecto()), DELTA);
    }

    // ---- Salir por cuenta propia ----

    @Test
    void integranteAlDiaSalePorSuCuenta() throws Exception {
        Ejemplo e = ejemplo();
        String antes = ok(como(e.ana(), get(situacionUrl(e.proyecto()))));

        assertEquals(204, quitar(e.dani(), e.proyecto(), e.dani()));

        String despues = ok(como(e.ana(), get(situacionUrl(e.proyecto()))));
        assertEquals(numero(antes, "$.totalBalances"), numero(despues, "$.totalBalances"), DELTA);
        assertFalse(memberIds(e.ana(), e.proyecto()).contains(e.dani().id()));
        assertEquals(403, status(como(e.dani(), get("/api/projects/" + e.proyecto()))));
    }

    // ---- Rechazos: nada cambia ----

    @Test
    void adminNoPuedeEliminarAQuienDebe() throws Exception {
        Ejemplo e = ejemplo();

        assertRechazado(e, e.ana(), e.beto(), 422,
                "No se puede eliminar a Beto porque tiene un saldo pendiente (debe $7.500). "
                        + "Primero deben saldar las deudas.");
    }

    @Test
    void adminNoPuedeEliminarAQuienTieneSaldoAFavor() throws Exception {
        // Ana es la única con saldo a favor; Beto se vuelve admin de un proyecto con Ana como integrante.
        Ejemplo e = ejemplo();
        long otro = crearProyecto(e.beto(), "Finca");
        agregarIntegrante(e.beto(), otro, e.ana());
        assertEquals(200, status(aporte(e.ana(), otro, 10_000)));
        String antes = ok(como(e.beto(), get(situacionUrl(otro))));

        MvcResult result = mockMvc.perform(como(e.beto(), delete(quitarUrl(otro, e.ana())))).andReturn();

        assertEquals(422, result.getResponse().getStatus());
        assertEquals("No se puede eliminar a Ana porque tiene un saldo pendiente (le deben $10.000). "
                + "Primero deben saldar las deudas.", mensaje(result));
        assertEquals(antes, ok(como(e.beto(), get(situacionUrl(otro)))));
    }

    @Test
    void integranteConDeudaNoPuedeSalir() throws Exception {
        Ejemplo e = ejemplo();

        assertRechazado(e, e.caro(), e.caro(), 422,
                "No puedes salir del proyecto porque tienes un saldo pendiente (debes $25.000). "
                        + "Primero deben saldar las deudas.");
    }

    @Test
    void adminNoPuedeSalirDelProyecto() throws Exception {
        Ejemplo e = ejemplo();

        assertRechazado(e, e.ana(), e.ana(), 422, "El administrador no puede salir ni ser eliminado del proyecto.");
    }

    @Test
    void integranteNoPuedeEliminarAOtro() throws Exception {
        Ejemplo e = ejemplo();

        assertRechazado(e, e.beto(), e.dani(), 403, "Solo el administrador puede eliminar a otros integrantes.");
    }

    @Test
    void integranteNoPuedeEliminarAlAdmin() throws Exception {
        Ejemplo e = ejemplo();

        assertRechazado(e, e.dani(), e.ana(), 403, "Solo el administrador puede eliminar a otros integrantes.");
    }

    @Test
    void quienNoEsMiembroRecibe403() throws Exception {
        Ejemplo e = ejemplo();
        Cuenta intrusa = registrar("Intrusa");

        assertRechazado(e, intrusa, e.dani(), 403, "No perteneces a este proyecto compartido.");
    }

    @Test
    void eliminarAQuienNoEsIntegranteResponde404() throws Exception {
        Ejemplo e = ejemplo();
        Cuenta ajena = registrar("Ajena");

        assertRechazado(e, e.ana(), ajena, 404, "Esa persona no es integrante del proyecto.");
    }

    @Test
    void sinSesionResponde401() throws Exception {
        Ejemplo e = ejemplo();

        assertEquals(401, status(delete(quitarUrl(e.proyecto(), e.dani()))));
        assertTrue(memberIds(e.ana(), e.proyecto()).contains(e.dani().id()));
    }

    @Test
    void proyectoInexistenteResponde404() throws Exception {
        Ejemplo e = ejemplo();

        assertEquals(404, quitar(e.ana(), Long.MAX_VALUE, e.dani()));
    }

    // ---- Ejemplo base ----

    private record Ejemplo(Cuenta ana, Cuenta beto, Cuenta caro, Cuenta dani, long proyecto) {
    }

    private Ejemplo ejemplo() throws Exception {
        Cuenta ana = registrar("Ana");
        Cuenta beto = registrar("Beto");
        Cuenta caro = registrar("Caro");
        Cuenta dani = registrar("Dani");
        for (Cuenta cuenta : List.of(ana, beto, caro, dani)) {
            depositar(cuenta, 100_000);
        }
        long proyecto = crearProyecto(ana, "Viaje");
        agregarIntegrante(ana, proyecto, beto);
        agregarIntegrante(ana, proyecto, caro);
        agregarIntegrante(ana, proyecto, dani);
        assertEquals(200, status(aporte(ana, proyecto, 90_000)));
        assertEquals(200, status(aporte(beto, proyecto, 30_000)));
        assertEquals(200, status(aporte(dani, proyecto, 25_000)));
        assertEquals(201, status(gasto(ana, proyecto, 100_000, ana, beto, caro, dani)));
        assertEquals(201, status(gasto(ana, proyecto, 25_000, ana, beto)));
        return new Ejemplo(ana, beto, caro, dani, proyecto);
    }

    // ---- Utilidades HTTP ----

    private record Cuenta(long id, String email, String token) {
    }

    private static String situacionUrl(long proyecto) {
        return "/api/projects/" + proyecto + "/balances";
    }

    private static String quitarUrl(long proyecto, Cuenta integrante) {
        return "/api/projects/" + proyecto + "/members/" + integrante.id();
    }

    private int quitar(Cuenta quien, long proyecto, Cuenta integrante) throws Exception {
        return status(como(quien, delete(quitarUrl(proyecto, integrante))));
    }

    /** Comprueba el código y el formato {status, message}, y que integrantes, situación e historial quedan iguales. */
    private void assertRechazado(Ejemplo e, Cuenta quien, Cuenta integrante, int esperado, String mensajeEsperado)
            throws Exception {
        String antes = foto(e);

        MvcResult result = mockMvc.perform(como(quien, delete(quitarUrl(e.proyecto(), integrante)))).andReturn();

        String body = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertEquals(esperado, result.getResponse().getStatus(), body);
        assertEquals(esperado, (int) JsonPath.read(body, "$.status"));
        assertEquals(mensajeEsperado, mensaje(result));
        assertEquals(antes, foto(e), "Un rechazo no debe cambiar nada");
    }

    private String foto(Ejemplo e) throws Exception {
        return memberIds(e.ana(), e.proyecto())
                + "|" + ok(como(e.ana(), get(situacionUrl(e.proyecto()))))
                + "|" + movimientos(e.ana(), e.proyecto(), "SHARED");
    }

    private void assertRespuesta(MockHttpServletRequestBuilder request, int esperado, String mensajeEsperado)
            throws Exception {
        MvcResult result = mockMvc.perform(request).andReturn();
        assertEquals(esperado, result.getResponse().getStatus(), result.getResponse().getContentAsString(StandardCharsets.UTF_8));
        assertEquals(mensajeEsperado, mensaje(result));
    }

    private List<Long> memberIds(Cuenta cuenta, long proyecto) throws Exception {
        List<Object> ids = JsonPath.read(ok(como(cuenta, get("/api/projects/" + proyecto))), "$.memberIds");
        return ids.stream().map(id -> ((Number) id).longValue()).toList();
    }

    private double saldoEnSituacion(String body, Cuenta cuenta) {
        List<Object> saldos = JsonPath.read(body, "$.members[?(@.userId == " + cuenta.id() + ")].netBalance");
        assertEquals(1, saldos.size(), body);
        return ((Number) saldos.get(0)).doubleValue();
    }

    private double parteEnSituacion(String body, Cuenta cuenta) {
        List<Object> partes = JsonPath.read(body, "$.members[?(@.userId == " + cuenta.id() + ")].shareOfExpenses");
        assertEquals(1, partes.size(), body);
        return ((Number) partes.get(0)).doubleValue();
    }

    private Cuenta registrar(String nombre) throws Exception {
        String email = "it-" + UUID.randomUUID() + "@syncfund.test";
        String body = mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + nombre + "\",\"email\":\"" + email + "\",\"password\":\"clave-123\"}"))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        return new Cuenta(((Number) JsonPath.read(body, "$.user.id")).longValue(), email, JsonPath.read(body, "$.token"));
    }

    private void depositar(Cuenta cuenta, double monto) throws Exception {
        long billetera = ((Number) JsonPath.read(ok(como(cuenta, get("/api/wallets/personal/user/" + cuenta.id()))),
                "$.walletId")).longValue();
        String json = "{\"amount\":" + monto + ",\"description\":\"Salario\",\"type\":\"INGRESO\",\"originWalletId\":"
                + billetera + ",\"originWalletType\":\"PERSONAL\"}";
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

    private MockHttpServletRequestBuilder aporte(Cuenta cuenta, long proyecto, double monto) {
        return como(cuenta, post("/api/projects/" + proyecto + "/contributions"))
                .content("{\"amount\":" + monto + ",\"contributorId\":" + cuenta.id() + ",\"description\":\"Aporte al fondo\"}");
    }

    private MockHttpServletRequestBuilder gasto(Cuenta pagador, long proyecto, double monto, Cuenta... involucrados) {
        String ids = Arrays.stream(involucrados).map(c -> String.valueOf(c.id())).collect(Collectors.joining(","));
        return como(pagador, post("/api/projects/" + proyecto + "/expenses"))
                .content("{\"amount\":" + monto + ",\"payerId\":" + pagador.id() + ",\"involvedIdsList\":[" + ids
                        + "],\"description\":\"Mercado\"}");
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
        Object value = JsonPath.read(body, path);
        if (value instanceof List<?> list) {
            assertEquals(1, list.size(), body);
            value = list.get(0);
        }
        return ((Number) value).doubleValue();
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
