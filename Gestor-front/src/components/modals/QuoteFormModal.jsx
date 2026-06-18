import { useState } from 'react';
import { X, FileText, Trash2, Plus } from 'lucide-react';
import { clientsData } from '../../mocks/clients';
import './QuoteFormModal.css';

const emptyItem = () => ({ description: '', quantity: 1, unitPrice: 0 });

/**
 * Modal de creación/edición de cotización.
 * onSave recibe { client, items, notes, status } y status es
 * 'Borrador' o 'Enviada' según el botón que se use.
 */
export default function QuoteFormModal({ onClose, onSave }) {
  const [client, setClient] = useState('');
  const [items, setItems] = useState([emptyItem()]);
  const [notes, setNotes] = useState('');

  const total = items.reduce((sum, it) => sum + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0);

  function updateItem(index, field, value) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave(status) {
    if (!client) return;
    onSave({ client, items, notes, status });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">
              <FileText size={18} />
            </span>
            <h2 className="page-title">Nueva Cotización</h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" htmlFor="quote-client">
              Cliente
            </label>
            <select
              id="quote-client"
              className="form-select"
              value={client}
              onChange={(e) => setClient(e.target.value)}
            >
              <option value="">Selecciona un cliente…</option>
              {clientsData.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Precio unitario</th>
                  <th>Subtotal</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        className="form-input"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Descripción de la pieza/servicio"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-input"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                      />
                    </td>
                    <td className="cell-strong">
                      ${(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toFixed(2)}
                    </td>
                    <td>
                      <button type="button" className="btn-icon-danger" onClick={() => removeItem(index)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" className="btn btn-secondary" onClick={addItem}>
            <Plus size={16} /> Agregar línea
          </button>

          <div className="form-group">
            <label className="form-label" htmlFor="quote-notes">
              Notas
            </label>
            <textarea
              id="quote-notes"
              className="form-textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Condiciones, plazos de entrega, observaciones…"
            />
          </div>

          <div className="quote-total-row">
            <span className="muted">Total</span>
            <span className="quote-total-value">${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => handleSave('Borrador')}>
            Guardar Borrador
          </button>
          <button type="button" className="btn btn-primary" onClick={() => handleSave('Enviada')}>
            Enviar a Cliente
          </button>
        </div>
      </div>
    </div>
  );
}
