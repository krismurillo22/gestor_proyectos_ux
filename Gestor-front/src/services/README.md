# Services

Esta carpeta es la única capa que debería saber cómo se obtienen los datos. Los componentes/páginas nunca importan de `src/mocks` directamente ni usan `fetch` — siempre llaman una función de aquí.

## Cómo está armado hoy

- `apiClient.js` — wrapper de `fetch` listo para usarse, pero **nadie lo llama todavía**. Lee la URL base de `import.meta.env.VITE_API_BASE_URL`.
- `mockUtils.js` — `simulateNetwork(data, ms)` agrega un delay artificial para que la UI ya maneje estados de carga.
- `quotesService.js`, `workOrdersService.js`, `clientsService.js`, `suppliersService.js`, `dashboardService.js` — un archivo por dominio. Cada función exportada:
  1. Tiene un comentario JSDoc con el endpoint real propuesto (método + ruta + query params + forma del body/respuesta).
  2. Por ahora hace `return simulateNetwork(mockData)`.
  3. Tiene, comentada justo abajo, la línea con la llamada real a `apiClient` ya escrita — solo hay que descomentarla cuando el endpoint exista.

## Cómo migrar un endpoint de mock a real

1. Confirmar con el equipo de backend (`Gestor`) que el endpoint existe y la forma del contrato coincide con lo documentado en el JSDoc (si no coincide, ajustar el JSDoc y el código que consume el service).
2. En la función correspondiente, comentar/borrar el `return simulateNetwork(...)`.
3. Descomentar el `return apiClient.<metodo>(...)`.
4. Si la forma de la respuesta del backend es distinta a la del mock, mapearla antes de devolverla (para no tener que tocar los componentes que ya consumen el service).
5. Tachar el endpoint en `ENDPOINTS_CHECKLIST.md`.

## Variables de entorno

Crear un `.env` en la raíz de `Gestor-front` (no se sube a git) con:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

Ver `ENDPOINTS_CHECKLIST.md` para la lista completa de endpoints que el front necesita y cuáles ya existen en el backend.
