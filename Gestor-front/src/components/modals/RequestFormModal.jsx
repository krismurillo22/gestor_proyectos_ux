import { useState } from 'react';
import { X, Inbox } from 'lucide-react';
import { clientsData } from '../../mocks/clients';

/**
 * Modal para registrar una nueva solicitud de cliente (punto de entrada
 * del flujo, antes de cotizar con ningún taller).
 * onSave recibe { clientId, client, description }.
 */
export default function RequestFormModal({ onClose, onSave }) {
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const client = clientsData.find((c) => c.id === clientId);
    if (!client || !description) return;
    onSave({ clientId, client: client.name, description });
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
                required
              >
                <option value="">Selecciona un cliente…</option>
                {clientsData.map((c) => (
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
