import { useState } from 'react';
import { X, Star, ClipboardCheck } from 'lucide-react';

/**
 * Evaluación final de calidad/desempeño del taller, registrada cuando la
 * pieza se entrega al cliente (equivale a la entidad Evaluacion del
 * backend: 1-1 con Proyecto, rating 1-5 + observaciones). No depende de
 * haber pasado por la columna "Control de Calidad" del kanban — se puede
 * saltar directo si el trabajo no lo requirió.
 *
 * onSave recibe { rating, notes }.
 */
export default function WorkOrderEvaluationModal({ order, onClose, onSave }) {
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [hovered, setHovered] = useState(0);

  function handleSubmit(e) {
    e.preventDefault();
    if (!rating) return;
    onSave({ rating, notes });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">
              <ClipboardCheck size={18} />
            </span>
            <h2 className="page-title">Evaluación final — {order?.id}</h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="cell-muted">
              Pieza entregada a {order?.client}, fabricada por {order?.supplier}. Califica el desempeño del
              taller en este trabajo.
            </p>

            <div className="form-group">
              <label className="form-label">Calificación</label>
              <div className="rating-stars" onMouseLeave={() => setHovered(0)}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="btn-icon rating-star-btn"
                    onMouseEnter={() => setHovered(value)}
                    onClick={() => setRating(value)}
                    aria-label={`${value} estrellas`}
                  >
                    <Star
                      size={26}
                      className={value <= (hovered || rating) ? 'rating-star-filled' : 'rating-star-empty'}
                      fill={value <= (hovered || rating) ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="eval-notes">
                Observaciones
              </label>
              <textarea
                id="eval-notes"
                className="form-textarea"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Calidad del acabado, cumplimiento de plazos, comunicación con el taller…"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={!rating}>
              Guardar evaluación y completar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
