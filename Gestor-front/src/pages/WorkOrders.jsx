import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Clock, Factory, Search, X, Archive } from 'lucide-react';
import { WORK_ORDER_COLUMNS } from '../mocks/workOrders';
import WorkOrderDetailModal from '../components/modals/WorkOrderDetailModal';
import WorkOrderFormModal from '../components/modals/WorkOrderFormModal';
import WorkOrderEvaluationModal from '../components/modals/WorkOrderEvaluationModal';
import WorkOrderArchiveModal from '../components/modals/WorkOrderArchiveModal';
import { getWorkOrders, createWorkOrder, updateWorkOrderStatus, submitWorkOrderEvaluation, archiveWorkOrder } from '../services/workOrdersService';
import './WorkOrders.css';

export default function WorkOrders() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [presetQuoteId, setPresetQuoteId] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [evaluatingOrder, setEvaluatingOrder] = useState(null);
  const [usedQuoteIds, setUsedQuoteIds] = useState([]);

  useEffect(() => {
    refresh();
  }, []);

  // Permite llegar acá ya con la ventana de "Nueva Orden" abierta y la
  // cotización aprobada preseleccionada (botón "Ir a Órdenes de Trabajo" en
  // Solicitudes, justo cuando el cliente acepta una cotización).
  useEffect(() => {
    if (location.state?.openQuoteId) {
      setPresetQuoteId(location.state.openQuoteId);
      setShowAddModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.openQuoteId]);

  function refresh() {
    setLoading(true);
    // El kanban solo debe mostrar órdenes no archivadas, pero usedQuoteIds
    // (qué cotizaciones ya tienen una orden y por lo tanto no deben volver a
    // aparecer al crear una orden nueva) tiene que incluir TAMBIÉN las
    // archivadas — si no, una orden ya completada y archivada "libera" su
    // cotización y se puede crear una orden duplicada para el mismo trabajo
    // (a pedido de Jorge, 2026-06-24).
    Promise.all([getWorkOrders(), getWorkOrders({ includeArchived: true })]).then(([data, allData]) => {
      setOrders(data);
      setUsedQuoteIds(allData.map((o) => o.quoteId));
      setLoading(false);
    });
  }

  async function handleCreate(payload) {
    await createWorkOrder(payload);
    setShowAddModal(false);
    refresh();
  }

  async function handleDrop(status) {
    if (!draggedId) return;
    const order = orders.find((o) => o.id === draggedId);
    setDraggedId(null);
    if (!order) return;

    // Completar una orden implica registrar la evaluación final del taller
    // (control de calidad/desempeño), así que en vez de cambiar el estado
    // de una, se abre el formulario de evaluación; el estado se actualiza
    // al guardar esa evaluación.
    if (status === 'Completada' && !order.evaluation) {
      setEvaluatingOrder(order);
      return;
    }

    await updateWorkOrderStatus(draggedId, status);
    refresh();
  }

  async function handleSubmitEvaluation({ rating, notes }) {
    await submitWorkOrderEvaluation(evaluatingOrder.id, { rating, notes });
    setEvaluatingOrder(null);
    refresh();
  }

  const filteredOrders = orders.filter((o) => {
    if (search) {
      const q = search.toLowerCase();
      const matches =
        o.client?.toLowerCase().includes(q) ||
        o.supplier?.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q) ||
        String(o.id).includes(q);
      if (!matches) return false;
    }
    if (filterDateFrom && o.dueDate && o.dueDate < filterDateFrom) return false;
    if (filterDateTo && o.dueDate && o.dueDate > filterDateTo) return false;
    return true;
  });

  const hasFilters = search || filterDateFrom || filterDateTo;

  async function handleArchive(id) {
    await archiveWorkOrder(id);
    refresh();
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Órdenes de Trabajo</h1>
          <p className="page-subtitle">Da seguimiento al trabajo asignado a los talleres</p>
        </div>
        <div className="row-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setShowArchive(true)}>
            <Archive size={16} /> Archivero de órdenes
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Nueva Orden
          </button>
        </div>
      </div>

      <div className="kanban-filters">
        <div className="kanban-filter-search">
          <Search size={14} className="kanban-filter-icon" />
          <input
            type="text"
            className="kanban-filter-input"
            placeholder="Buscar por cliente, taller, descripción u OT…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" className="kanban-filter-clear-x" onClick={() => setSearch('')}>
              <X size={13} />
            </button>
          )}
        </div>
        <div className="kanban-filter-dates">
          <span className="kanban-filter-date-label">Vence desde</span>
          <input
            type="date"
            className="kanban-filter-date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
          />
          <span className="kanban-filter-date-label">hasta</span>
          <input
            type="date"
            className="kanban-filter-date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
          />
        </div>
        {hasFilters && (
          <button
            type="button"
            className="btn btn-secondary kanban-filter-clear"
            onClick={() => { setSearch(''); setFilterDateFrom(''); setFilterDateTo(''); }}
          >
            <X size={14} /> Limpiar filtros
          </button>
        )}
        {hasFilters && (
          <span className="kanban-filter-count">
            {filteredOrders.length} orden{filteredOrders.length !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <p className="muted">Cargando órdenes…</p>
      ) : (
        <div className="kanban-board">
          {WORK_ORDER_COLUMNS.map((column) => {
            const columnOrders = filteredOrders.filter((o) => o.status === column.status);
            return (
              <div
                key={column.status}
                className="kanban-column"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(column.status)}
              >
                <div className="kanban-column-header">
                  <span className="kanban-dot" style={{ background: column.color }} />
                  <span>{column.status}</span>
                  <span className="tab-count">{columnOrders.length}</span>
                </div>

                <div className="kanban-column-body">
                  {columnOrders.map((order) => (
                    <div
                      key={order.id}
                      className="panel panel-padded panel-hoverable kanban-card"
                      draggable
                      onDragStart={() => setDraggedId(order.id)}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="kanban-card-top">
                        <span className="cell-strong">OT-{order.id}</span>
                        {order.quoteTotal != null && <span className="kanban-card-total">${order.quoteTotal.toFixed(2)}</span>}
                      </div>
                      <p className="cell-muted">{order.client}</p>
                      <p className="kanban-card-desc">{order.description}</p>

                      <div className="kanban-card-footer">
                        <span className="cell-muted">
                          <Factory size={13} /> {order.supplier}
                        </span>
                        <span className="cell-muted">
                          <Clock size={13} /> {order.dueDate}
                        </span>
                      </div>
                      {order.status === 'Completada' && (
                        <button
                          type="button"
                          className="btn btn-primary kanban-archive-btn"
                          onClick={(e) => { e.stopPropagation(); handleArchive(order.id); }}
                        >
                          <Archive size={13} /> Archivar
                        </button>
                      )}
                    </div>
                  ))}
                  {columnOrders.length === 0 && <p className="empty-state">Sin órdenes</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        <WorkOrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onEvaluate={(order) => {
            setSelectedOrder(null);
            setEvaluatingOrder(order);
          }}
        />
      )}
      {showAddModal && (
        <WorkOrderFormModal
          usedQuoteIds={usedQuoteIds}
          initialQuoteId={presetQuoteId}
          onClose={() => {
            setShowAddModal(false);
            setPresetQuoteId(null);
          }}
          onSave={handleCreate}
        />
      )}
      {evaluatingOrder && (
        <WorkOrderEvaluationModal order={evaluatingOrder} onClose={() => setEvaluatingOrder(null)} onSave={handleSubmitEvaluation} />
      )}
      {showArchive && (
        <WorkOrderArchiveModal
          onClose={() => {
            setShowArchive(false);
            // Si se restauró alguna orden al kanban desde el archivero, que
            // se vea reflejada de una vez en el tablero sin recargar la página.
            refresh();
          }}
        />
      )}
    </div>
  );
}
