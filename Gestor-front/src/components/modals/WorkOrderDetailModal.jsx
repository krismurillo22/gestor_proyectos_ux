import { useEffect, useState } from 'react';
import { X, ClipboardList, Clock, Star, ClipboardCheck, Mail, Phone, MapPin, FileText } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import { clientsData } from '../../mocks/clients';
import { suppliersData } from '../../mocks/suppliers';
import { getQuoteById } from '../../services/quotesService';
import './WorkOrderDetailModal.css';

/**
 * Modal de detalle de una orden de trabajo. "Información general" muestra
 * lo básico de la orden y, debajo, la información de contacto tanto del
 * cliente como del proveedor/taller asignado, además de la cotización
 * aprobada de la que nació la orden (líneas y desglose financiero).
 *
 * El proveedor se busca por supplierId (la orden sí lo guarda). El cliente
 * se busca por nombre, porque la orden todavía no guarda un clientId propio
 * (mismo criterio que clientsService.getClientProjectHistory).
 *
 * La cotización se obtiene por quoteId vía el service (no directo del mock)
 * porque es la única de las tres búsquedas que pasa por una llamada async
 * "real" (getQuoteById) — el modal se remonta por cada orden seleccionada
 * (ver WorkOrders.jsx: `{selectedOrder && <WorkOrderDetailModal .../>}`),
 * así que no hace falta resetear el estado al cambiar de orden.
 */
export default function WorkOrderDetailModal({ order, onClose, onEvaluate }) {
  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(true);

  useEffect(() => {
    if (!order) return;
    getQuoteById(order.quoteId).then((data) => {
      setQuote(data);
      setLoadingQuote(false);
    });
  }, [order]);

  if (!order) return null;

  const clientInfo = clientsData.find((c) => c.name === order.client);
  const supplierInfo = suppliersData.find((s) => s.id === order.supplierId);

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
                <p className="cell-muted">Fecha límite</p>
                <p className="cell-strong">{order.dueDate}</p>
              </div>
              <div>
                <p className="cell-muted">Estado</p>
                <StatusBadge status={order.status} type="order" />
              </div>
            </div>
            <p className="cell-muted" style={{ marginTop: '0.75rem' }}>
              Descripción
            </p>
            <p>{order.description}</p>
          </section>

          <section className="wo-section">
            <h3 className="section-title">Cliente y proveedor</h3>
            <div className="wo-parties-grid">
              <div className="panel panel-padded">
                <p className="cell-muted">Cliente</p>
                <p className="cell-strong">{order.client}</p>
                {clientInfo ? (
                  <>
                    <p className="cell-muted">{clientInfo.contact}</p>
                    <p className="cell-muted">
                      <Mail size={14} /> {clientInfo.email}
                    </p>
                    <p className="cell-muted">
                      <Phone size={14} /> {clientInfo.phone}
                    </p>
                    <p className="cell-muted">
                      <MapPin size={14} /> {clientInfo.address}
                    </p>
                  </>
                ) : (
                  <p className="muted">Sin información de contacto registrada.</p>
                )}
              </div>
              <div className="panel panel-padded">
                <p className="cell-muted">Taller asignado</p>
                <p className="cell-strong">{order.supplier}</p>
                {supplierInfo ? (
                  <>
                    <p className="cell-muted">{supplierInfo.contact}</p>
                    <p className="cell-muted">
                      <Mail size={14} /> {supplierInfo.email}
                    </p>
                    <p className="cell-muted">
                      <Phone size={14} /> {supplierInfo.phone}
                    </p>
                    <p className="cell-muted">
                      <MapPin size={14} /> {supplierInfo.address}
                    </p>
                  </>
                ) : (
                  <p className="muted">Sin información de contacto registrada.</p>
                )}
              </div>
            </div>
          </section>

          <section className="wo-section">
            <h3 className="section-title">
              <FileText size={16} className="icon-primary" /> Cotización utilizada
            </h3>
            {loadingQuote ? (
              <p className="muted">Cargando cotización…</p>
            ) : quote ? (
              <>
                <p className="cell-muted">
                  {quote.id} · {quote.date}
                </p>
                <ul className="wo-quote-items">
                  {quote.items.map((it, i) => (
                    <li key={i}>
                      {it.quantity}× {it.title || it.description} — ${(it.quantity * it.unitPrice).toFixed(2)}
                    </li>
                  ))}
                </ul>
                {quote.notes && <p className="cell-muted wo-quote-notes">{quote.notes}</p>}

                <div className="wo-financial-breakdown">
                  <div className="wo-financial-line">
                    <span className="muted">Subtotal</span>
                    <span>${(quote.subtotal ?? quote.total).toFixed(2)}</span>
                  </div>
                  {quote.intermediationFee?.value > 0 && (
                    <div className="wo-financial-line">
                      <span className="muted">
                        Tarifa de intermediación{quote.intermediationFee.percent ? ` (${quote.intermediationFee.percent}%)` : ''}
                      </span>
                      <span>${quote.intermediationFee.value.toFixed(2)}</span>
                    </div>
                  )}
                  {quote.tax != null && (
                    <div className="wo-financial-line">
                      <span className="muted">ISV (15%)</span>
                      <span>${quote.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="quote-total-row">
                    <span className="muted">Total</span>
                    <span className="quote-total-value">${quote.total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="muted">No se encontró la cotización asociada.</p>
            )}
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

          <section className="wo-section">
            <h3 className="section-title">
              <ClipboardCheck size={16} className="icon-primary" /> Evaluación final
            </h3>
            {order.evaluation ? (
              <div>
                <div className="rating-stars" aria-label={`${order.evaluation.rating} de 5 estrellas`}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      size={20}
                      className={value <= order.evaluation.rating ? 'rating-star-filled' : 'rating-star-empty'}
                      fill={value <= order.evaluation.rating ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <p className="cell-muted" style={{ marginTop: '0.5rem' }}>
                  {order.evaluation.date}
                </p>
                <p style={{ marginTop: '0.25rem' }}>{order.evaluation.notes}</p>
              </div>
            ) : (
              <div>
                <p className="muted">Todavía no se registra evaluación (se hace al entregar al cliente).</p>
                {onEvaluate && (
                  <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => onEvaluate(order)}>
                    Registrar evaluación
                  </button>
                )}
              </div>
            )}
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
