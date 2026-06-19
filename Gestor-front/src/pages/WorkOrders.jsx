import { useEffect, useState } from 'react';
import { Plus, Clock, Factory } from 'lucide-react';
import { WORK_ORDER_COLUMNS } from '../mocks/workOrders';
import WorkOrderDetailModal from '../components/modals/WorkOrderDetailModal';
import WorkOrderFormModal from '../components/modals/WorkOrderFormModal';
import WorkOrderEvaluationModal from '../components/modals/WorkOrderEvaluationModal';
import { getWorkOrders, createWorkOrder, updateWorkOrderStatus, submitWorkOrderEvaluation } from '../services/workOrdersService';
import './WorkOrders.css';

export default function WorkOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [evaluatingOrder, setEvaluatingOrder] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    getWorkOrders().then((data) => {
      setOrders(data);
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

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Órdenes de Trabajo</h1>
          <p className="page-subtitle">Da seguimiento al trabajo asignado a los talleres</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Nueva Orden
        </button>
      </div>

      {loading ? (
        <p className="muted">Cargando órdenes…</p>
      ) : (
        <div className="kanban-board">
          {WORK_ORDER_COLUMNS.map((column) => {
            const columnOrders = orders.filter((o) => o.status === column.status);
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
                        <span className="cell-strong">{order.id}</span>
                        <span className={`badge badge-${order.priority === 'Alta' ? 'red' : order.priority === 'Media' ? 'amber' : 'slate'}`}>
                          {order.priority}
                        </span>
                      </div>
                      <p className="cell-muted">{order.client}</p>
                      <p className="kanban-card-desc">{order.description}</p>

                      <div className="kanban-progress">
                        <div className="kanban-progress-bar" style={{ width: `${order.progress}%` }} />
                      </div>

                      <div className="kanban-card-footer">
                        <span className="cell-muted">
                          <Factory size={13} /> {order.supplier}
                        </span>
                        <span className="cell-muted">
                          <Clock size={13} /> {order.dueDate}
                        </span>
                      </div>
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
          usedQuoteIds={orders.map((o) => o.quoteId)}
          onClose={() => setShowAddModal(false)}
          onSave={handleCreate}
        />
      )}
      {evaluatingOrder && (
        <WorkOrderEvaluationModal order={evaluatingOrder} onClose={() => setEvaluatingOrder(null)} onSave={handleSubmitEvaluation} />
      )}
    </div>
  );
}
