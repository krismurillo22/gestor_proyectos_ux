import { useEffect, useState } from 'react';
import { X, Inbox } from 'lucide-react';
import { getClients } from '../../services/clientsService';

/**
 * Modal para registrar una nueva solicitud de cliente (punto de entrada
 * del flujo, antes de cotizar con ningún taller). Los clientes se piden al
 * backend al abrir el modal (antes venían de un mock estático) porque el
 * backend necesita el id numérico real del cliente para crear la
 * solicitud, no el id de texto que tenían los datos de prueba.
 * onSave recibe { clientId, client, description }.
 */
export default function RequestFormModal({ onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    getClients().then((data) => {
      setClients(data);
      setLoadingClients(false);
    });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const client = clients.find((c) => String(c.id) === String(clientId));
    if (!client || !description) return;
    onSave({ clientId: client.id, client: client.name, description });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">
              <Inbox size={18} />
            </span>
            <h2 className="page-title">Nueva Solicitud</h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="req-client">
                Cliente
              </label>
              <select
                id="req-client"
                className="form-select"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={loadingClients}
                required
              >
                <option value="">{loadingClients ? 'Cargando clientes…' : 'Selecciona un cliente…'}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="req-description">
                Descripción del trabajo
              </label>
              <textarea
                id="req-description"
                className="form-textarea"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Qué pieza/trabajo necesita el cliente, medidas, especificaciones generales…"
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Crear Solicitud
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
