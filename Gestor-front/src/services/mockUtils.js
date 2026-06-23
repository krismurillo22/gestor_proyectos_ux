/**
 * Simula la latencia de una llamada de red, devolviendo una copia
 * profunda de `data` después de `ms` milisegundos. Esto permite que los
 * componentes ya manejen estados de carga (spinners, skeletons) como lo
 * harían con el backend real. Cuando un service se conecte al backend
 * de verdad, simplemente se deja de llamar a esta función.
 */
export function simulateNetwork(data, ms = 400) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const copy = typeof structuredClone === 'function' ? structuredClone(data) : JSON.parse(JSON.stringify(data));
      resolve(copy);
    }, ms);
  });
}
