/**
 * apiClient
 * ---------
 * Cliente HTTP centralizado para cuando se conecte el front a los
 * endpoints reales del backend (carpeta `Gestor`). Por ahora NINGÚN
 * service lo usa todavía: todos los `*Service.js` devuelven datos mock
 * (datos de prueba inventados, no vienen de ningún servidor).
 *
 * Si es tu primera vez conectando un front a un backend real: este
 * archivo es el ÚNICO lugar donde se arma la petición HTTP de verdad
 * (fetch). Los services (carpeta `services/`) NUNCA llaman a `fetch`
 * directo — siempre pasan por `apiClient.get/post/put/patch/delete`, que
 * está definido abajo. Así, si algo cambia en cómo se llama al backend
 * (la URL base, los headers, el manejo de errores), se cambia UNA vez
 * aquí y no en los 20+ lugares donde se usa.
 *
 * Para una guía paso a paso con un ejemplo completo (antes/después de
 * conectar una función real), ver GUIA_CONEXION_BACKEND.md en esta misma
 * carpeta. Resumen de los 3 pasos:
 *
 * 1. Crear un archivo `.env` en la raíz de Gestor-front (copiando
 *    `.env.example`, que ya existe ahí) con la URL del backend, por ejemplo:
 *      VITE_API_BASE_URL=http://localhost:3000/api
 *    Sin este archivo, BASE_URL (abajo) cae en '/api' por default.
 *
 * 2. Si el backend pide autenticación (JWT, token, etc.), agregar el
 *    header Authorization dentro de la función `request` de este mismo
 *    archivo (línea marcada con `// TODO(auth)` más abajo) — es el único
 *    lugar que hay que tocar, porque TODAS las llamadas pasan por ahí.
 *
 * 3. En cada función de cada service (ej. `getClients` en
 *    clientsService.js), hay dos líneas que importan:
 *      return simulateNetwork(...);                    <- la usa hoy (mock)
 *      // return apiClient.get('/clientes', ...);       <- la real, comentada
 *    Para conectar ESA función: borra o comenta la primera línea, y
 *    descomenta la segunda (quítale el `//` y el `// TODO: backend`).
 *    Repite función por función, a tu propio ritmo — no es necesario
 *    conectar todo el archivo de una sola vez.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, { method = 'GET', body, headers, ...rest } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      // TODO(auth): Authorization: `Bearer ${getToken()}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || `Error ${response.status} al llamar ${path}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
