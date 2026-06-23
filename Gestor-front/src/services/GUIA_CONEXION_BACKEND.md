# Guía: cómo conectar un endpoint real (paso a paso)

Esta guía es para quien va a conectar el front a un endpoint del backend
por primera vez. No asume que ya sabes cómo está armado esto — te lo
explica desde cero, con un ejemplo completo.

Si solo necesitas la lista de qué endpoints hace falta construir, esa
está en `ENDPOINTS_CHECKLIST.md` (misma carpeta). Esta guía es el "cómo",
ese archivo es el "qué".

## 1. Cómo está armado el front hoy (sin backend)

El front nunca llama directo a `fetch`. Hay tres capas:

```
Componente (.jsx)  →  Service (services/*.js)  →  apiClient.js  →  fetch(...)
```

- **Componente**: la pantalla (ej. `Clientes.jsx`). Llama funciones como
  `getClients()`, sin saber si los datos vienen de un mock o de un servidor real.
- **Service** (ej. `clientsService.js`): tiene una función por cada
  acción ("listar clientes", "crear cliente", etc). Hoy, cada función
  devuelve datos de prueba (mock) usando `simulateNetwork(...)`, que
  simplemente espera 400ms y regresa una copia de datos inventados —
  simula que "tardó" como si fuera una llamada de red real.
- **apiClient.js**: el único archivo que sabe armar una petición HTTP de
  verdad (con `fetch`). Ahora mismo nadie lo usa todavía, pero cada
  función de cada service ya tiene la línea real escrita, **comentada**,
  lista para activarse.

Por eso conectar un endpoint NO significa escribir código nuevo desde
cero: significa borrar dos líneas y descomentar una, dentro de UNA
función. Vamos a verlo con un ejemplo real.

## 2. Ejemplo completo: conectar `getClients`

Abre `src/services/clientsService.js`. Vas a encontrar esto:

```js
export async function getClients(search = '') {
  const filtered = search
    ? mockClients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : mockClients;
  return simulateNetwork(filtered);
  // return apiClient.get('/clientes', { params: { search } }); // TODO: backend
}
```

Leyendo el bloque de comentario justo arriba de la función (no lo
copiamos aquí, pero ya está en el archivo), sabemos: método `GET`, ruta
`/api/clientes`, query opcional `?search=`, y qué forma debe tener la
respuesta.

**Antes de tocar nada**, asegúrate de que el endpoint ya existe en el
backend y devuelve algo parecido a la forma esperada (pídele a quien
hizo el backend que te confirme la ruta exacta, o pruébala con Postman/Insomnia/Thunder Client antes de tocar el front).

**Paso 1 — borra/comenta la línea del mock:**

```js
  // return simulateNetwork(filtered);
```

**Paso 2 — descomenta la línea real, quitando el `// TODO: backend`:**

```js
  return apiClient.get('/clientes', { params: { search } });
```

El resultado final de la función:

```js
export async function getClients(search = '') {
  const filtered = search
    ? mockClients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : mockClients;
  return apiClient.get('/clientes', { params: { search } });
}
```

(La línea `const filtered = ...` ya no se usa — puedes borrarla también,
junto con `mockClients` si ya ninguna función del archivo la necesita.
No es obligatorio borrarla de inmediato, pero ESLint probablemente se
queje de una variable sin usar.)

**Importante:** `apiClient.get` no soporta un segundo argumento
`{ params: {...} }` mágicamente — eso depende de cómo termines
implementando `request()` en `apiClient.js`. Si tu versión de
`apiClient.js` no maneja `params` todavía, conviertes tú mismo el query
string, por ejemplo:

```js
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiClient.get(`/clientes${query}`);
```

Esto es normal: la firma exacta de `apiClient.get/post/put/patch/delete`
es la que está en `apiClient.js` ahora mismo (revísala ahí), así que
ajusta la llamada a como en verdad está implementada, no a lo que
"debería" ser.

## 3. ¿Y si el backend devuelve los datos con otra forma?

Es muy común que el backend nombre los campos distinto al mock (por
ejemplo `nombre` en vez de `name`, o anide la respuesta dentro de
`{ data: [...] }`). **No cambies el componente (.jsx) para adaptarse al
backend.** El lugar correcto para adaptar la forma de los datos es el
service, justo donde está el `return`, así el resto del front no se
entera de cómo responde el backend exactamente:

```js
export async function getClients(search = '') {
  const response = await apiClient.get(`/clientes?search=${search}`);
  // si el backend regresa { data: [...] }, lo "desempacamos" aquí:
  return response.data.map((c) => ({
    id: c.id,
    name: c.nombre,        // el backend lo llama "nombre", el front "name"
    rtn: c.rtn,
    contact: c.contacto,
    email: c.email,
    phone: c.telefono,
    address: c.direccion,
    totalBilled: c.total_facturado,
    activeProjects: c.proyectos_activos,
    totalQuotes: c.total_cotizaciones,
    since: c.fecha_registro,
  }));
}
```

Así el componente sigue recibiendo `client.name`, `client.totalBilled`,
etc., exactamente como antes, sin que nadie tenga que tocar la pantalla.

## 4. Cómo probar que quedó bien conectado

1. Crea el archivo `.env` (copia `.env.example`, que está en la raíz de
   Gestor-front) y pon ahí la URL real del backend.
2. Corre el front (`npm run dev`) y abre la pantalla correspondiente.
3. Abre las herramientas de desarrollador del navegador → pestaña
   "Network" (Red) → recarga la pantalla → busca la petición a tu
   endpoint y revisa: ¿el status fue 200? ¿la respuesta (tab "Response")
   tiene la forma que esperabas?
4. Si la pantalla se queda en blanco o muestra un error en consola,
   revisa primero el mensaje exacto en la consola — casi siempre dice
   qué campo vino `undefined` (señal de que el nombre del campo no
   coincide entre backend y front, ver punto 3).

## 5. Errores comunes (y cómo se ven)

- **CORS**: en la consola del navegador aparece algo como "blocked by
  CORS policy". Esto se arregla en el backend (tiene que permitir
  peticiones desde `http://localhost:5173` o el puerto que use Vite),
  no en el front.
- **Olvidar el `await`**: si una función usa `apiClient.get(...)` dentro
  de otra función async, asegúrate de que quien LLAMA a esa función
  también use `await` o `.then()`. Si no, vas a recibir una Promise sin
  resolver en vez de los datos.
- **Dos `return` en la misma función**: si dejaste sin borrar el
  `return simulateNetwork(...)` Y descomentaste el `return apiClient...`
  debajo, JavaScript ejecuta el PRIMER `return` que encuentra y nunca
  llega al segundo. Si conectaste algo y "no pasó nada", revisa que de
  verdad borraste/comentaste la línea del mock.
- **La ruta no lleva `/api` al inicio o lo lleva de más**: `apiClient.js`
  ya le agrega el prefijo `BASE_URL` (que incluye `/api`) a cada ruta.
  Si en el comentario dice `Ruta: /api/clientes`, la llamada real debe
  ser `apiClient.get('/clientes')` (sin repetir `/api`), porque
  `BASE_URL` ya lo agrega.

## 6. Resumen rápido

Para conectar UNA función:
1. Lee su bloque "ENDPOINT REAL" (método, ruta, query/body, respuesta esperada).
2. Borra o comenta su `return simulateNetwork(...)`.
3. Descomenta su línea `// return apiClient...` y ajústala si la firma de
   `apiClient.js` lo requiere.
4. Si el backend nombra los campos distinto, adapta la respuesta ahí
   mismo (ver sección 3), nunca en el componente.
5. Prueba con la pestaña Network del navegador.

No hace falta conectar todos los services de un jalón — se puede ir
función por función, pantalla por pantalla.
