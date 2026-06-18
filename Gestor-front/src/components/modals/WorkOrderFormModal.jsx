import { useState } from 'react';
import { X, ClipboardList } from 'lucide-react';
import { quotesData } from '../../mocks/quotes';
import { OPERATORS } from '../../mocks/workOrders';
import './WorkOrderFormModal.css';

const ACCEPTED_QUOTES = quotesData.filter((q) => q.status === 'Aceptada');

/**
 * Modal para crear una orden de trabajo a partir de una cotización
 * aceptada. El cliente se autocompleta (solo lectura) según la
 * cotización elegida.
 */
export default function WorkOrderFormModal({ onClose, onSave }) {
  const [quoteId, setQuoteId] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Media');
  const [operator, setOperator] = useState('');

  const selectedQuote = ACCEPTED_QUOTES.find((q) => q.id === quoteId);

  function handleSubmit(e) {
    e.preventDefault();
    if (!quoteId || !description || !dueDate || !operator) return;
    onSave({
      quoteId,
      client: selectedQuote?.client,
      description,
      dueDate,
      priority,
      operator,
    });
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
                Cotización aceptada
              </label>
              <select
                id="wo-quote"
                className="form-select"
                value={quoteId}
                onChange={(e) => setQuoteId(e.target.value)}
                required
              >
                <option value="">Selecciona una cotización…</option>
                {ACCEPTED_QUOTES.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.id} — {q.client}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cliente</label>
              <input className="form-input" value={selectedQuote?.client || ''} readOnly />
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
                required
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

            <div className="form-group">
              <label className="form-label" htmlFor="wo-operator">
                Operador asignado
              </label>
              <select
                id="wo-operator"
                className="form-select"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                required
              >
                <option value="">Selecciona un operador…</option>
                {OPERATORS.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Crear Orden
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
