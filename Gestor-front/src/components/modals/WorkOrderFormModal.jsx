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
 *
 * initialQuoteId precarga la cotización cuando se llega desde el botón
 * "Ir a Órdenes de Trabajo" de Solicitudes (ver WorkOrders.jsx).
 */
// La orden se crea con fecha_inicio = hoy, y el backend exige que
// fecha_vencimiento sea POSTERIOR a fecha_inicio (no solo "no anterior") —
// ver createProyecto en proyectosController.js. Por eso la fecha mínima
// seleccionable es mañana, no hoy.
const tomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

export default function WorkOrderFormModal({ usedQuoteIds = [], initialQuoteId = '', onClose, onSave }) {
  const [approvedQuotes, setApprovedQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quoteId, setQuoteId] = useState(initialQuoteId);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    getQuotes({ estado: 'aprobada' }).then((data) => {
      const usedIds = usedQuoteIds.map(String);
      setApprovedQuotes(data.filter((q) => !usedIds.includes(String(q.id))));
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // q.id viene del backend como número; quoteId puede llegar como string
  // (lo que pone el <select> en su onChange) o como número si llega
  // precargado desde location.state (ver WorkOrders.jsx) — se compara como
  // texto para que ambos casos calcen.
  const selectedQuote = approvedQuotes.find((q) => String(q.id) === String(quoteId));
  const minDate = tomorrowStr();

  function handleDueDateChange(value) {
    setDueDate(value);
    setDateError(value && value < minDate ? 'La fecha límite debe ser posterior a hoy.' : '');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!quoteId || !dueDate) return;
    if (dueDate < minDate) {
      setDateError('La fecha límite debe ser posterior a hoy.');
      return;
    }
    onSave({ quoteId, description, dueDate });
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

            <div className="form-group">
              <label className="form-label" htmlFor="wo-due-date">
                Fecha límite
              </label>
              <input
                id="wo-due-date"
                type="date"
                className="form-input"
                min={minDate}
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                aria-invalid={Boolean(dateError)}
                required
              />
              {dateError && <p className="form-error-text">{dateError}</p>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={!quoteId || Boolean(dateError)}>
              Crear Orden
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
