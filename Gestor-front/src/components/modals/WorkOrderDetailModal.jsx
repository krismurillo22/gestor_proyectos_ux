import { X, ClipboardList, Paperclip, Clock } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import './WorkOrderDetailModal.css';

export default function WorkOrderDetailModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">
              <ClipboardList size={18} />
            </span>
            <h2 className="page-title">{order.id}</h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <section className="wo-section">
            <h3 className="section-title">Información general</h3>
            <div className="wo-info-grid">
              <div>
                <p className="cell-muted">Cliente</p>
                <p className="cell-strong">{order.client}</p>
              </div>
              <div>
                <p className="cell-muted">Operador</p>
                <p className="cell-strong">{order.operator}</p>
              </div>
              <div>
                <p className="cell-muted">Fecha límite</p>
                <p className="cell-strong">{order.dueDate}</p>
              </div>
              <div>
                <p className="cell-muted">Prioridad</p>
                <p className="cell-strong">{order.priority}</p>
              </div>
              <div>
                <p className="cell-muted">Estado</p>
                <StatusBadge status={order.status} type="order" />
              </div>
              <div>
                <p className="cell-muted">Avance</p>
                <p className="cell-strong">{order.progress}%</p>
              </div>
            </div>
            <p className="cell-muted" style={{ marginTop: '0.75rem' }}>
              Descripción
            </p>
            <p>{order.description}</p>
          </section>

          <section className="wo-section">
            <h3 className="section-title">Especificaciones técnicas</h3>
            <ul className="wo-list">
              {order.technicalSpecs?.length ? (
                order.technicalSpecs.map((spec, i) => <li key={i}>{spec}</li>)
              ) : (
                <li className="muted">Sin especificaciones registradas.</li>
              )}
            </ul>
          </section>

          <section className="wo-section">
            <h3 className="section-title">
              <Paperclip size={16} className="icon-primary" /> Archivos adjuntos
            </h3>
            <ul className="wo-list">
              {order.attachedFiles?.length ? (
                order.attachedFiles.map((file, i) => <li key={i}>{file}</li>)
              ) : (
                <li className="muted">Sin archivos adjuntos.</li>
              )}
            </ul>
          </section>

          <section className="wo-section">
            <h3 className="section-title">
              <Clock size={16} className="icon-primary" /> Historial de estado
            </h3>
            <div className="wo-timeline">
              {order.statusHistory?.map((entry, i) => (
                <div key={i} className="wo-timeline-item">
                  <span className="wo-timeline-dot" />
                  <div>
                    <p className="cell-strong">{entry.status}</p>
                    <p className="cell-muted">
                      {entry.date} — {entry.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
