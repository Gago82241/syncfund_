#!/usr/bin/env node
/**
 * Carga datos demo en SyncFund a través de la API (nunca directo a la base de datos).
 *
 * Variables de entorno:
 *   SEED_API_URL   URL base de la API, por ejemplo http://localhost:8080/api
 *   SEED_PASSWORD  contraseña de las tres cuentas demo (mínimo 8 caracteres, máximo 72 bytes)
 *
 * Crea 3 usuarios con su billetera (ingresos, gastos, categorías, colchón y meta) y un proyecto
 * compartido entre los tres, con aportes, gastos repartidos y un pago, de modo que la situación del
 * proyecto muestre "A tu favor" (Ana), "Al día" (Bruno) y "Debes" (Carla).
 *
 * Es idempotente: si la primera cuenta demo ya inicia sesión, no crea nada.
 * Se detiene en el primer error. Nunca imprime contraseñas ni tokens.
 */

// ─── Datos demo (pesos colombianos) ──────────────────────────────────────────────────────────────

const USERS = [
  {
    key: 'ana',
    name: 'Ana Restrepo',
    email: 'ana.demo@example.com',
    categories: [
      { name: 'Mercado', monthlyLimit: 800_000 },
      { name: 'Transporte', monthlyLimit: 250_000 },
      { name: 'Restaurantes', monthlyLimit: 300_000 },
    ],
    incomes: [
      { description: 'Salario de noviembre', amount: 4_800_000 },
      { description: 'Proyecto freelance de diseño', amount: 900_000 },
    ],
    expenses: [
      { description: 'Arriendo', amount: 1_500_000 },
      { description: 'Mercado del mes', amount: 520_000, category: 'Mercado' },
      { description: 'Recarga tarjeta Cívica', amount: 120_000, category: 'Transporte' },
      { description: 'Almuerzo con compañeros', amount: 85_000, category: 'Restaurantes' },
      { description: 'Servicios públicos', amount: 230_000 },
    ],
    cushion: 800_000,
    savingsGoal: 600_000,
  },
  {
    key: 'bruno',
    name: 'Bruno Cárdenas',
    email: 'bruno.demo@example.com',
    categories: [
      { name: 'Mercado', monthlyLimit: 600_000 },
      { name: 'Transporte', monthlyLimit: 200_000 },
      { name: 'Entretenimiento', monthlyLimit: 150_000 },
    ],
    incomes: [{ description: 'Salario de noviembre', amount: 3_200_000 }],
    expenses: [
      { description: 'Arriendo compartido', amount: 900_000 },
      { description: 'Mercado', amount: 430_000, category: 'Mercado' },
      { description: 'Gasolina de la moto', amount: 95_000, category: 'Transporte' },
      { description: 'Cine y comida', amount: 68_000, category: 'Entretenimiento' },
      { description: 'Suscripción de streaming', amount: 45_000, category: 'Entretenimiento' },
    ],
    cushion: 400_000,
    savingsGoal: 350_000,
  },
  {
    key: 'carla',
    name: 'Carla Mejía',
    email: 'carla.demo@example.com',
    categories: [
      { name: 'Mercado', monthlyLimit: 350_000 },
      { name: 'Transporte', monthlyLimit: 150_000 },
      { name: 'Restaurantes', monthlyLimit: 120_000 },
    ],
    incomes: [
      { description: 'Pago de monitoría', amount: 1_400_000 },
      { description: 'Venta de postres', amount: 380_000 },
    ],
    expenses: [
      { description: 'Habitación', amount: 650_000 },
      { description: 'Mercado', amount: 280_000, category: 'Mercado' },
      { description: 'Pasajes de bus', amount: 96_000, category: 'Transporte' },
      { description: 'Domicilios', amount: 135_000, category: 'Restaurantes' },
    ],
    cushion: 150_000,
    savingsGoal: 200_000,
  },
];

const PROJECT = {
  admin: 'ana',
  name: 'Viaje a Santa Marta',
  description: 'Tres noches en Santa Marta: alojamiento, transporte y paseos entre Ana, Bruno y Carla.',
  members: ['bruno', 'carla'],
  contributions: [
    { by: 'ana', amount: 1_200_000, description: 'Aporte para el viaje' },
    { by: 'bruno', amount: 600_000, description: 'Aporte para el viaje' },
    { by: 'carla', amount: 300_000, description: 'Aporte para el viaje' },
  ],
  // Los paga el fondo; cada uno lo registra quien aparece en "by" (el pagador debe ser el usuario del token).
  expenses: [
    { by: 'ana', amount: 1_200_000, description: 'Alojamiento 3 noches', involved: ['ana', 'bruno', 'carla'] },
    { by: 'ana', amount: 450_000, description: 'Tiquetes de bus ida y regreso', involved: ['ana', 'bruno', 'carla'] },
    { by: 'bruno', amount: 240_000, description: 'Tour en lancha a Playa Cristal', involved: ['ana', 'bruno'] },
    { by: 'carla', amount: 180_000, description: 'Cena de mariscos', involved: ['bruno', 'carla'] },
  ],
  // Bruno salda toda su deuda con Ana: queda al día.
  settlement: { payer: 'bruno', payee: 'ana', amount: 160_000 },
  // Lo que debe mostrar la situación del proyecto al terminar.
  expected: { fund: 30_000, net: { ana: 370_000, bruno: 0, carla: -340_000 } },
};

// ─── Configuración ───────────────────────────────────────────────────────────────────────────────

const PASSWORD_MIN_CHARS = 8; // RegisterUserRequest: @Size(min = 8)
const PASSWORD_MAX_BYTES = 72; // RegisterUserRequest: @MaxUtf8Bytes(72), límite de BCrypt
const HALF_CENT = 0.005;

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

function readConfig() {
  const major = Number(process.versions.node.split('.')[0]);
  if (major < 18 || typeof fetch !== 'function') {
    fail(`Se necesita Node 18 o superior (tienes ${process.versions.node}).`);
  }

  const rawUrl = process.env.SEED_API_URL?.trim();
  if (!rawUrl) {
    fail('Falta la variable de entorno SEED_API_URL (por ejemplo http://localhost:8080/api).');
  }
  let apiUrl;
  try {
    apiUrl = new URL(rawUrl).toString().replace(/\/+$/, '');
  } catch {
    fail(`SEED_API_URL no es una URL válida: ${rawUrl}`);
  }

  const password = process.env.SEED_PASSWORD;
  if (!password) {
    fail('Falta la variable de entorno SEED_PASSWORD con la contraseña de las cuentas demo.');
  }
  if (password.length < PASSWORD_MIN_CHARS) {
    fail(`SEED_PASSWORD debe tener al menos ${PASSWORD_MIN_CHARS} caracteres.`);
  }
  if (Buffer.byteLength(password, 'utf8') > PASSWORD_MAX_BYTES) {
    fail(`SEED_PASSWORD es demasiado larga: máximo ${PASSWORD_MAX_BYTES} bytes (las tildes, la ñ y los emojis ocupan más).`);
  }

  return { apiUrl, password };
}

// ─── Cliente de la API ───────────────────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(method, path, status, message, errors) {
    super(message);
    this.method = method;
    this.path = path;
    this.status = status;
    this.errors = errors;
  }
}

function createApi(apiUrl) {
  return async function api(method, path, { body, token } = {}) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;

    let response;
    try {
      response = await fetch(apiUrl + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (error) {
      throw new ApiError(method, path, null,
        `No se pudo conectar con ${apiUrl}. ¿Está corriendo el backend? (${error.cause?.code ?? error.message})`);
    }

    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const message = (data && typeof data === 'object' && data.message) || (typeof data === 'string' && data) || 'Sin mensaje';
      const errors = data && typeof data === 'object' ? data.errors : undefined;
      throw new ApiError(method, path, response.status, message, errors);
    }
    return data;
  };
}

// ─── Formato ─────────────────────────────────────────────────────────────────────────────────────

const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const money = (value) => pesos.format(value);

function status(net) {
  if (Math.abs(net) < HALF_CENT) return 'Al día';
  return net > 0 ? `A favor ${money(net)}` : `Debe ${money(-net)}`;
}

function step(message) {
  console.log(`  · ${message}`);
}

// ─── Carga ───────────────────────────────────────────────────────────────────────────────────────

async function main() {
  const { apiUrl, password } = readConfig();
  const api = createApi(apiUrl);

  console.log(`SyncFund — datos demo\nAPI de destino: ${apiUrl}\n`);

  // Idempotencia: si la primera cuenta demo ya existe, no se crea nada.
  const first = USERS[0];
  try {
    await api('POST', '/auth/login', { body: { email: first.email, password } });
    console.log(`La cuenta ${first.email} ya existe: los datos demo ya están cargados. No se creó nada.`);
    return;
  } catch (error) {
    // 422 "Credenciales inválidas": la cuenta no existe (o tiene otra contraseña; en ese caso el
    // registro responde 422 "Ya existe…" y el script se detiene sin haber creado nada).
    if (!(error instanceof ApiError) || error.status !== 422) throw error;
  }

  const ctx = {}; // key → { id, token, walletId, categories: { nombre → id } }

  console.log('1. Usuarios');
  for (const user of USERS) {
    const auth = await api('POST', '/auth/register', {
      body: { name: user.name, email: user.email, password },
    });
    ctx[user.key] = { id: auth.user.id, token: auth.token, categories: {} };
    step(`${user.name} <${user.email}>`);
  }

  console.log('\n2. Billeteras personales');
  for (const user of USERS) {
    const me = ctx[user.key];
    const token = me.token;

    const wallet = await api('GET', `/wallets/personal/user/${me.id}`, { token });
    me.walletId = wallet.walletId;

    for (const category of user.categories) {
      const created = await api('POST', '/categories', { token, body: category });
      me.categories[category.name] = created.categoryId;
    }

    // Primero los ingresos, para que ningún gasto quede sin saldo.
    for (const income of user.incomes) {
      await api('POST', '/transactions', {
        token,
        body: {
          amount: income.amount,
          description: income.description,
          type: 'INGRESO',
          originWalletId: me.walletId,
          originWalletType: 'PERSONAL',
        },
      });
    }
    for (const expense of user.expenses) {
      await api('POST', '/transactions', {
        token,
        body: {
          amount: expense.amount,
          description: expense.description,
          type: 'GASTO',
          originWalletId: me.walletId,
          originWalletType: 'PERSONAL',
          categoryId: expense.category ? me.categories[expense.category] : null,
        },
      });
    }

    await api('POST', `/wallets/personal/${me.walletId}/cushion`, {
      token,
      body: { amount: user.cushion, type: 'APARTAR' },
    });
    await api('PUT', `/wallets/personal/${me.walletId}/goal`, {
      token,
      body: { monthlySavingsGoal: user.savingsGoal },
    });

    step(`${user.name}: ${user.categories.length} categorías, ${user.incomes.length} ingresos, `
      + `${user.expenses.length} gastos, colchón y meta`);
  }

  console.log('\n3. Proyecto compartido');
  const admin = ctx[PROJECT.admin];
  const project = await api('POST', '/projects', {
    token: admin.token,
    body: { name: PROJECT.name, description: PROJECT.description, adminId: admin.id },
  });
  const projectId = project.projectId;
  step(`${PROJECT.name} (administra ${USERS.find((u) => u.key === PROJECT.admin).name})`);

  for (const key of PROJECT.members) {
    const member = USERS.find((u) => u.key === key);
    await api('POST', `/projects/${projectId}/members`, { token: admin.token, body: { email: member.email } });
    step(`Integrante: ${member.name}`);
  }

  // Todos los aportes antes de los gastos: el fondo nunca puede quedar en negativo.
  for (const contribution of PROJECT.contributions) {
    const who = ctx[contribution.by];
    await api('POST', `/projects/${projectId}/contributions`, {
      token: who.token,
      body: { amount: contribution.amount, contributorId: who.id, description: contribution.description },
    });
    step(`Aporte de ${USERS.find((u) => u.key === contribution.by).name}: ${money(contribution.amount)}`);
  }

  for (const expense of PROJECT.expenses) {
    const who = ctx[expense.by];
    await api('POST', `/projects/${projectId}/expenses`, {
      token: who.token,
      body: {
        amount: expense.amount,
        payerId: who.id,
        involvedIdsList: expense.involved.map((key) => ctx[key].id),
        description: expense.description,
      },
    });
    step(`Gasto: ${expense.description} ${money(expense.amount)} entre ${expense.involved.length}`);
  }

  const { payer, payee, amount } = PROJECT.settlement;
  await api('POST', `/projects/${projectId}/settlements`, {
    token: ctx[payer].token,
    body: { payerId: ctx[payer].id, payeeId: ctx[payee].id, amount },
  });
  step(`Pago: ${USERS.find((u) => u.key === payer).name} → ${USERS.find((u) => u.key === payee).name} ${money(amount)}`);

  // ─── Resumen (solo lectura) ──────────────────────────────────────────────────────────────────
  console.log('\n✔ Datos demo creados.\n\nResumen');
  console.log('───────');

  for (const user of USERS) {
    const me = ctx[user.key];
    const wallet = await api('GET', `/wallets/personal/user/${me.id}`, { token: me.token });
    console.log(`${user.name} <${user.email}>`);
    console.log(`  Billetera: disponible ${money(wallet.currentBalance)} · colchón ${money(wallet.cushionBalance)}`
      + ` · meta mensual ${money(wallet.monthlySavingsGoal)}`);
    console.log(`  Categorías: ${user.categories.map((c) => `${c.name} (${money(c.monthlyLimit)})`).join(', ')}`);
  }

  const balances = await api('GET', `/projects/${projectId}/balances`, { token: admin.token });
  console.log(`\nProyecto «${PROJECT.name}» — fondo ${money(balances.fund)}`);

  const mismatches = [];
  for (const user of USERS) {
    const row = balances.members.find((m) => m.userId === ctx[user.key].id);
    console.log(`  ${user.name}: aportó ${money(row.contributed)}, su parte ${money(row.shareOfExpenses)} → ${status(row.netBalance)}`);
    const expected = PROJECT.expected.net[user.key];
    if (Math.abs(row.netBalance - expected) >= HALF_CENT) {
      mismatches.push(`${user.name}: saldo neto ${row.netBalance}, se esperaba ${expected}`);
    }
  }
  if (Math.abs(balances.fund - PROJECT.expected.fund) >= HALF_CENT) {
    mismatches.push(`Fondo: ${balances.fund}, se esperaba ${PROJECT.expected.fund}`);
  }

  if (mismatches.length > 0) {
    console.warn('\n⚠ La situación del proyecto no coincide con lo esperado:');
    mismatches.forEach((m) => console.warn(`  - ${m}`));
  }
}

main().catch((error) => {
  if (error instanceof ApiError) {
    console.error(`\n✖ Error en ${error.method} ${error.path}`);
    if (error.status !== null) console.error(`  Código HTTP: ${error.status}`);
    console.error(`  Mensaje: ${error.message}`);
    if (error.errors && typeof error.errors === 'object') {
      for (const [field, message] of Object.entries(error.errors)) {
        console.error(`    · ${field}: ${message}`);
      }
    }
    console.error('\nEl script se detuvo; lo creado hasta este punto se conserva.');
  } else {
    console.error('\n✖ Error inesperado:', error?.message ?? error);
  }
  process.exit(1);
});
