/**
 * apiClient
 * ---------
 * Cliente HTTP centralizado para cuando se conecte el front a los
 * endpoints reales del backend (carpeta `Gestor`). Por ahora NINGÚN
 * service lo usa todavía: todos los `*Service.js` devuelven datos mock.
 * Queda listo aquí para que, service por service, se vaya descomentando
 * la llamada real correspondiente (ver la plantilla en cada función de
 * los services).
 *
 * Pasos para activar la conexión real:
 * 1. Crear un archivo `.env` en la raíz de Gestor-front (basado en
 *    `.env.example`) con la URL del backend, por ejemplo:
 *      VITE_API_BASE_URL=http://localhost:3000/api
 * 2. Si el backend usa JWT u otro esquema de autenticación, agregar el
 *    header Authorization en la función `request` de este archivo (es
 *    el único lugar que hay que tocar).
 * 3. En cada service, comentar el `return simulateNetwork(...)` y
 *    descomentar la línea `return apiClient.<metodo>(...)` que ya está
 *    escrita justo abajo.
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
