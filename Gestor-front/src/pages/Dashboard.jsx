import { useEffect, useState } from 'react';
import { ClipboardList, FileText, Users, TrendingUp, AlertCircle } from 'lucide-react';
import SimpleBarChart from '../components/common/SimpleBarChart';
import StatusBadge from '../components/StatusBadge';
import WorkOrderDetailModal from '../components/modals/WorkOrderDetailModal';
import WorkOrderEvaluationModal from '../components/modals/WorkOrderEvaluationModal';
import { getKpis, getChartData, getProjectsNearDeadline } from '../services/dashboardService';
import { getWorkOrderById, submitWorkOrderEvaluation } from '../services/workOrdersService';
import './Dashboard.css';

const KPI_ICONS = {
  'proyectos-activos': ClipboardList,
  'cotizaciones-pendientes': FileText,
  'nuevos-clientes': Users,
  'ingresos-mes': TrendingUp,
};

function deadlineBadgeClass(daysLeft) {
  if (daysLeft <= 3) return 'badge-red';
  if (daysLeft <= 7) return 'badge-amber';
  return 'badge-emerald';
}

export default function Dashboard() {
  const [kpis, setKpis] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [evaluatingOrder, setEvaluatingOrder] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    Promise.all([getKpis(), getChartData(), getProjectsNearDeadline()]).then(
      ([kpiRes, chartRes, deadlineRes]) => {
        setKpis(kpiRes);
        setChartData(chartRes);
        setDeadlines(deadlineRes);
        setLoading(false);
      }
    );
  }

  function openDeadlineDetail(deadline) {
    getWorkOrderById(deadline.id).then(setSelectedOrder);
  }

  async function handleSubmitEvaluation({ rating, notes }) {
    await submitWorkOrderEvaluation(evaluatingOrder.id, { rating, notes });
    setEvaluatingOrder(null);
    refresh();
  }

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Cargando dashboard…</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Resumen general de la operación</p>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map((kpi) => {
          const Icon = KPI_ICONS[kpi.id] || ClipboardList;
          return (
            <div key={kpi.id} className="panel panel-padded kpi-card">
              <div className="kpi-card-top">
                <span className="kpi-label">{kpi.label}</span>
                <span className={`kpi-icon kpi-icon-${kpi.color}`}>
                  <Icon size={18} />
                </span>
              </div>
              <p className="kpi-value">{kpi.value}</p>
              <p className="kpi-change">{kpi.change}</p>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <div className="panel panel-padded">
          <h2 className="section-title">Cotizaciones por mes</h2>
          <SimpleBarChart
            data={chartData}
            categoryKey="month"
            series={[
              { key: 'cotizadas', label: 'Cotizadas', color: 'var(--color-chart-1)' },
              { key: 'aceptadas', label: 'Aceptadas', color: 'var(--color-chart-2)' },
            ]}
          />
        </div>

        <div className="panel panel-padded">
          <h2 className="section-title">
            <AlertCircle size={18} className="icon-primary" /> Próximos a vencer
          </h2>
          <div className="deadline-list">
            {deadlines.map((d) => (
              <div
                key={d.id}
                className="deadline-item deadline-item-clickable"
                role="button"
                tabIndex={0}
                onClick={() => openDeadlineDetail(d)}
                onKeyDown={(e) => e.key === 'Enter' && openDeadlineDetail(d)}
              >
                <div>
                  <p className="cell-strong">{d.id}</p>
                  <p className="cell-muted">{d.client}</p>
                </div>
                <div className="deadline-right">
                  <StatusBadge status={d.status} type="order" />
                  <span className={`badge ${deadlineBadgeClass(d.daysLeft)}`}>
                    {d.daysLeft} día{d.daysLeft === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            ))}
            {deadlines.length === 0 && <p className="empty-state">Sin órdenes próximas a vencer.</p>}
          </div>
        </div>
      </div>

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
      {evaluatingOrder && (
        <WorkOrderEvaluationModal order={evaluatingOrder} onClose={() => setEvaluatingOrder(null)} onSave={handleSubmitEvaluation} />
      )}
    </div>
  );
}
