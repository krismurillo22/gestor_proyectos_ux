import { useEffect, useState } from 'react';
import { Plus, Search, ArrowLeft, Mail, Phone, MapPin, Star, Eye } from 'lucide-react';
import EntityFormModal from '../components/modals/EntityFormModal';
import WorkOrderDetailModal from '../components/modals/WorkOrderDetailModal';
import StatusBadge from '../components/StatusBadge';
import { getClients, createClient, getClientProjectHistory } from '../services/clientsService';
import { getSuppliers, createSupplier, getSupplierAverageRating, getSupplierProjectHistory } from '../services/suppliersService';
import './Clients.css';

const TABS = [
  { key: 'clientes', label: 'Clientes' },
  { key: 'proveedores', label: 'Proveedores' },
];

/** Estrellas + promedio numérico para un proveedor (ver getSupplierAverageRating). */
function SupplierRating({ rating, size = 16 }) {
  if (!rating || rating.average == null) {
    return <p className="cell-muted">Sin evaluaciones todavía</p>;
  }
  const rounded = Math.round(rating.average);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            size={size}
            className={value <= rounded ? 'rating-star-filled' : 'rating-star-empty'}
            fill={value <= rounded ? 'currentColor' : 'none'}
          />
        ))}
      </div>
      <span className="cell-muted">
        {rating.average.toFixed(1)} ({rating.count})
      </span>
    </div>
  );
}

export default function Clients() {
  const [activeTab, setActiveTab] = useState('clientes');
  const [clients, setClients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [supplierRatings, setSupplierRatings] = useState({});
  const [viewingOrder, setViewingOrder] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    Promise.all([getClients(), getSuppliers()]).then(([clientsRes, suppliersRes]) => {
      setClients(clientsRes);
      setSuppliers(suppliersRes);
      setLoading(false);
      Promise.all(suppliersRes.map((s) => getSupplierAverageRating(s.id))).then((ratings) => {
        const byId = {};
        suppliersRes.forEach((s, i) => {
          byId[s.id] = ratings[i];
        });
        setSupplierRatings(byId);
      });
    });
  }

  function openProfile(entity) {
    setSelectedEntity(entity);
    setHistory([]);
    setHistoryLoading(true);
    const isClientEntity = 'totalBilled' in entity;
    const fetchHistory = isClientEntity ? getClientProjectHistory(entity.id) : getSupplierProjectHistory(entity.id);
    fetchHistory.then((data) => {
      setHistory(data);
      setHistoryLoading(false);
    });
  }

  async function handleCreate(payload) {
    if (activeTab === 'clientes') {
      await createClient(payload);
    } else {
      await createSupplier(payload);
    }
    setShowModal(false);
    refresh();
  }

  const list = activeTab === 'clientes' ? clients : suppliers;
  const filteredList = list.filter((entity) => entity.name.toLowerCase().includes(search.toLowerCase()));

  if (selectedEntity) {
    const isClient = 'totalBilled' in selectedEntity;
    return (
      <div className="page">
        <button type="button" className="btn btn-secondary" onClick={() => setSelectedEntity(null)}>
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="page-header" style={{ marginTop: '1rem' }}>
          <div>
            <h1 className="page-title">{selectedEntity.name}</h1>
            <p className="page-subtitle">{isClient ? 'Cliente' : 'Proveedor'} desde {selectedEntity.since}</p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="panel panel-padded">
            <h2 className="section-title">Información de contacto</h2>
            <p className="cell-strong">{selectedEntity.contact}</p>
            <p className="cell-muted">
              <Mail size={14} /> {selectedEntity.email}
            </p>
            <p className="cell-muted">
              <Phone size={14} /> {selectedEntity.phone}
            </p>
            <p className="cell-muted">
              <MapPin size={14} /> {selectedEntity.address}
            </p>
          </div>

          <div className="panel panel-padded">
            <h2 className="section-title">Resumen</h2>
            {isClient ? (
              <>
                <p className="cell-muted">Total facturado</p>
                <p className="kpi-value">${selectedEntity.totalBilled.toFixed(2)}</p>
                <p className="cell-muted" style={{ marginTop: '0.75rem' }}>
                  Proyectos activos: <span className="cell-strong">{selectedEntity.activeProjects}</span>
                </p>
                <p className="cell-muted">
                  Total de cotizaciones: <span className="cell-strong">{selectedEntity.totalQuotes}</span>
                </p>
              </>
            ) : (
              <>
                <p className="cell-muted">Total comprado</p>
                <p className="kpi-value">${selectedEntity.totalPurchased.toFixed(2)}</p>
                <p className="cell-muted" style={{ marginTop: '0.75rem' }}>
                  Órdenes activas: <span className="cell-strong">{selectedEntity.activeOrders}</span>
                </p>
                <p className="cell-muted" style={{ marginTop: '0.75rem' }}>
                  Calificación promedio
                </p>
                <SupplierRating rating={supplierRatings[selectedEntity.id]} />
              </>
            )}
          </div>
        </div>

        <div className="panel panel-padded" style={{ marginTop: '1rem' }}>
          <h2 className="section-title">Historial de proyectos</h2>
          {historyLoading ? (
            <p className="muted">Cargando historial…</p>
          ) : (
            <div className="table-wrap">
              {isClient ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Orden</th>
                      <th>Taller</th>
                      <th>Descripción</th>
                      <th>Fecha límite</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((order) => (
                      <tr key={order.id}>
                        <td className="cell-strong">{order.id}</td>
                        <td>{order.supplier}</td>
                        <td>{order.description}</td>
                        <td className="cell-muted">{order.dueDate}</td>
                        <td className="cell-strong">{order.total != null ? `$${order.total.toFixed(2)}` : '—'}</td>
                        <td>
                          <StatusBadge status={order.status} type="order" />
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              className="btn-icon"
                              title="Ver detalle"
                              onClick={() => setViewingOrder(order)}
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <tr>
                        <td colSpan={7} className="empty-state">
                          Sin proyectos registrados todavía.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Orden</th>
                      <th>Cliente</th>
                      <th>Descripción</th>
                      <th>Fecha límite</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((order) => (
                      <tr key={order.id}>
                        <td className="cell-strong">{order.id}</td>
                        <td>{order.client}</td>
                        <td>{order.description}</td>
                        <td className="cell-muted">{order.dueDate}</td>
                        <td>
                          <StatusBadge status={order.status} type="order" />
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              className="btn-icon"
                              title="Ver detalle"
                              onClick={() => setViewingOrder(order)}
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <tr>
                        <td colSpan={6} className="empty-state">
                          Sin órdenes de trabajo registradas todavía.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {viewingOrder && <WorkOrderDetailModal order={viewingOrder} onClose={() => setViewingOrder(null)} />}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes y Proveedores</h1>
          <p className="page-subtitle">Empresas que solicitan trabajo y talleres que lo ejecutan</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Agregar {activeTab === 'clientes' ? 'Cliente' : 'Proveedor'}
        </button>
      </div>

      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="search-bar">
        <Search size={16} />
        <input
          className="form-input"
          placeholder={`Buscar ${activeTab}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="muted">Cargando…</p>
      ) : (
        <div className="entity-grid">
          {filteredList.map((entity) => (
            <div
              key={entity.id}
              className="panel panel-padded panel-hoverable"
              onClick={() => openProfile(entity)}
            >
              <h3 className="cell-strong">{entity.name}</h3>
              <p className="cell-muted">{entity.contact}</p>
              <div className="entity-card-footer">
                {'totalBilled' in entity ? (
                  <>
                    <span className="cell-muted">{entity.activeProjects} proyectos activos</span>
                    <span className="cell-strong">${entity.totalBilled.toFixed(0)}</span>
                  </>
                ) : (
                  <>
                    <span className="cell-muted">{entity.activeOrders} órdenes activas</span>
                    <span className="cell-strong">${entity.totalPurchased.toFixed(0)}</span>
                  </>
                )}
              </div>
              {!('totalBilled' in entity) && (
                <div style={{ marginTop: '0.5rem' }}>
                  <SupplierRating rating={supplierRatings[entity.id]} size={13} />
                </div>
              )}
            </div>
          ))}
          {filteredList.length === 0 && <p className="empty-state">Sin resultados.</p>}
        </div>
      )}

      {showModal && (
        <EntityFormModal
          kind={activeTab === 'clientes' ? 'cliente' : 'proveedor'}
          onClose={() => setShowModal(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}
