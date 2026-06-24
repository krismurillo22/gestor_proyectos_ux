import { useEffect, useState } from 'react';
import { Archive, RotateCcw, Eye, X } from 'lucide-react';
import WorkOrderDetailModal from './WorkOrderDetailModal';
import { getArchivedWorkOrders, unarchiveWorkOrder } from '../../services/workOrdersService';

/**
 * Ventana "Archivero de órdenes": lista las órdenes completadas y
 * archivadas, con búsqueda, ver detalle y restaurar al kanban.
 *
 * Componente compartido: se usa tanto desde Configuración (Settings.jsx)
 * como desde el botón homónimo en Órdenes de Trabajo (WorkOrders.jsx), para
 * no duplicar esta ventana en los dos lugares (a pedido de Jorge, 2026-06-24).
 */
export default function WorkOrderArchiveModal({ onClose }) {
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getArchivedWorkOrders().then((data) => {
      setArchived(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function handleUnarchive(id) {
    await unarchiveWorkOrder(id);
    setArchived((prev) => prev.filter((o) => o.id !== id));
  }

  const filtered = archived.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.client?.toLowerCase().includes(q) ||
      o.supplier?.toLowerCase().includes(q) ||
      o.description?.toLowerCase().includes(q) ||
      String(o.id).includes(q)
    );
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon"><Archive size={18} /></span>
            <h2 className="page-title">Archivero de órdenes</h2>
            {archived.length > 0 && <span className="tab-count">{archived.length}</span>}
          </div>
          <button type="button" className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <p className="cell-muted" style={{ marginBottom: '1rem' }}>
            Órdenes completadas y archivadas. Puedes consultarlas o restaurarlas al kanban.
          </p>

          {archived.length > 0 && (
            <input
              type="text"
              className="form-input"
              placeholder="Buscar por cliente, taller u OT…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginBottom: '1rem' }}
            />
          )}

          {loading ? (
            <p className="cell-muted">Cargando…</p>
          ) : filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
              <Archive size={28} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
              <p>{archived.length === 0 ? 'No hay órdenes archivadas todavía.' : 'Sin resultados.'}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>OT</th>
                    <th>Cliente</th>
                    <th>Taller</th>
                    <th>Descripción</th>
                    <th>Fecha límite</th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id}>
                      <td className="cell-strong">OT-{o.id}</td>
                      <td>{o.client}</td>
                      <td className="cell-muted">{o.supplier}</td>
                      <td className="cell-muted">{o.description || '—'}</td>
                      <td className="cell-muted">{o.dueDate}</td>
                      <td className="cell-strong">{o.quoteTotal != null ? `$${o.quoteTotal.toFixed(2)}` : '—'}</td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="btn-icon" title="Ver detalle" onClick={() => setViewing(o)}>
                            <Eye size={15} />
                          </button>
                          <button type="button" className="btn-icon" title="Restaurar al kanban" onClick={() => handleUnarchive(o.id)}>
                            <RotateCcw size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>

      {viewing && (
        <WorkOrderDetailModal order={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}
