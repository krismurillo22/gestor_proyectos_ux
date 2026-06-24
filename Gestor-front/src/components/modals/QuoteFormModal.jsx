import { useState } from 'react';
import { X, FileText, Trash2, Plus } from 'lucide-react';
import './QuoteFormModal.css';

const emptyItem = () => ({ description: '', quantity: 1, unitPrice: '' });

/**
 * Modal para editar las líneas/notas de una cotización ya registrada
 * (mientras siga sin mandarse al cliente — el taller y la solicitud no
 * cambian una vez creada, así que aquí no se editan).
 *
 * onSave recibe { items, notes }.
 */
export default function QuoteFormModal({ quote, onClose, onSave }) {
  const [items, setItems] = useState(quote?.items?.length ? quote.items : [emptyItem()]);
  const [notes, setNotes] = useState(quote?.notes ?? '');

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

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ items, notes, total });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">
              <FileText size={18} />
            </span>
            <h2 className="page-title">Editar Cotización {quote?.id}</h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="cell-muted">
              {quote?.supplier} · Solicitud {quote?.requestId}
            </p>

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
                          min="1"
                          step="1"
                          className="form-input"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value === '' ? '' : Math.round(Number(e.target.value) || 0))}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-input"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value === '' ? '' : e.target.value)}
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

            <div className="form-group" style={{ marginTop: '1.25rem' }}>
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
            <button type="submit" className="btn btn-primary">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
