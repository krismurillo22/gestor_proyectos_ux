import { useEffect, useState } from 'react';
import { X, ClipboardList } from 'lucide-react';
import { getQuotes } from '../../services/quotesService';
import './WorkOrderFormModal.css';

/**
 * Modal para crear una orden de trabajo a partir de una cotización ya
 * APROBADA por el cliente. El taller y el cliente quedan fijos según esa
 * cotización (no se eligen a mano) — ya se decidieron cuando se aceptó.
 *
 * Solo se listan cotizaciones aprobadas que todavía no tienen una orden
 * (usedQuoteIds), para no duplicar trabajo.
 */
export default function WorkOrderFormModal({ usedQuoteIds = [], onClose, onSave }) {
  const [approvedQuotes, setApprovedQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quoteId, setQuoteId] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Media');

  useEffect(() => {
    getQuotes({ estado: 'aprobada' }).then((data) => {
      setApprovedQuotes(data.filter((q) => !usedQuoteIds.includes(q.id)));
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedQuote = approvedQuotes.find((q) => q.id === quoteId);

  function handleSubmit(e) {
    e.preventDefault();
    if (!quoteId || !dueDate) return;
    onSave({ quoteId, description, dueDate, priority });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">
              <ClipboardList size={18} />
            </span>
            <h2 className="page-title">Nueva Orden de Trabajo</h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="wo-quote">
                Cotización aprobada por el cliente
              </label>
              <select
                id="wo-quote"
                className="form-select"
                value={quoteId}
                onChange={(e) => setQuoteId(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">{loading ? 'Cargando…' : 'Selecciona una cotización…'}</option>
                {approvedQuotes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.id} — {q.client} ({q.supplier})
                  </option>
                ))}
              </select>
              {!loading && approvedQuotes.length === 0 && (
                <p className="cell-muted" style={{ marginTop: '0.4rem' }}>
                  No hay cotizaciones aprobadas pendientes de orden. Revisa Solicitudes.
                </p>
              )}
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Cliente</label>
                <input className="form-input" value={selectedQuote?.client || ''} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Taller asignado</label>
                <input className="form-input" value={selectedQuote?.supplier || ''} readOnly />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="wo-description">
                Descripción del trabajo
              </label>
              <textarea
                id="wo-description"
                className="form-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={selectedQuote?.notes || ''}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="wo-due-date">
                  Fecha límite
                </label>
                <input
                  id="wo-due-date"
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="wo-priority">
                  Prioridad
                </label>
                <select
                  id="wo-priority"
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={!quoteId}>
              Crear Orden
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
