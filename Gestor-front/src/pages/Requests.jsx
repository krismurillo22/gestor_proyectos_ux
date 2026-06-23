import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, ArrowLeft, Send, Check, X as XIcon, RotateCcw, Trash2, FileDown } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import RequestFormModal from '../components/modals/RequestFormModal';
import AddQuoteModal from '../components/modals/AddQuoteModal';
import { downloadQuoteDocx } from '../utils/quoteDocx';
import { getRequests, getRequestById, createRequest } from '../services/requestsService';
import {
  getQuotesByRequest,
  createQuote,
  sendQuoteToClient,
  approveQuote,
  rejectQuote,
  discardQuote,
  restoreQuote,
  getQuoteDisplayStatus,
} from '../services/quotesService';
import './Requests.css';

const TABS = [
  { key: 'all', label: 'Todas' },
  { key: 'Cotizando', label: 'Cotizando' },
  { key: 'Enviada al cliente', label: 'Enviada al cliente' },
  { key: 'Aprobada', label: 'Aprobada' },
  { key: 'Rechazada', label: 'Rechazada' },
];

export default function Requests() {
  const navigate = useNavigate();
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const [selected, setSelected] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [showAddQuote, setShowAddQuote] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  // Permite llegar acá ya con una solicitud abierta (p. ej. desde el botón
  // "Ver solicitud" en la página global de Cotizaciones).
  useEffect(() => {
    if (location.state?.openRequestId) {
      openDetail({ id: location.state.openRequestId });
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.openRequestId]);

  function refresh() {
    setLoading(true);
    getRequests().then((data) => {
      setRequests(data);
      setLoading(false);
    });
  }

  async function openDetail(request) {
    const [full, requestQuotes] = await Promise.all([getRequestById(request.id), getQuotesByRequest(request.id)]);
    setSelected(full);
    setQuotes(requestQuotes);
  }

  async function refreshDetail(id) {
    const [full, requestQuotes] = await Promise.all([getRequestById(id), getQuotesByRequest(id)]);
    setSelected(full);
    setQuotes(requestQuotes);
    refresh();
  }

  async function handleCreate(payload) {
    await createRequest(payload);
    setShowModal(false);
    refresh();
  }

  async function handleAddQuote(payload) {
    await createQuote({ ...payload, requestId: selected.id });
    setShowAddQuote(false);
    refreshDetail(selected.id);
  }

  async function handleSend(quoteId) {
    await sendQuoteToClient(quoteId);
    refreshDetail(selected.id);
  }

  async function handleApprove(quoteId) {
    await approveQuote(quoteId);
    refreshDetail(selected.id);
  }

  async function handleReject(quoteId) {
    await rejectQuote(quoteId);
    refreshDetail(selected.id);
  }

  async function handleDiscard(quoteId) {
    await discardQuote(quoteId);
    refreshDetail(selected.id);
  }

  async function handleRestore(quoteId) {
    await restoreQuote(quoteId);
    refreshDetail(selected.id);
  }

  async function handleDownloadDocx(quote) {
    await downloadQuoteDocx(quote, selected);
  }

  const tabCounts = useMemo(() => {
    const counts = { all: requests.length };
    for (const tab of TABS.slice(1)) {
      counts[tab.key] = requests.filter((r) => r.status === tab.key).length;
    }
    return counts;
  }, [requests]);

  const filteredRequests = activeTab === 'all' ? requests : requests.filter((r) => r.status === activeTab);

  if (selected) {
    const activeQuote = quotes.find((q) => q.sentToClient);

    return (
      <div className="page">
        <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="page-header" style={{ marginTop: '1rem' }}>
          <div>
            <h1 className="page-title">{selected.id}</h1>
            <p className="page-subtitle">
              {selected.client} — {selected.description}
            </p>
          </div>
          <div className="request-header-actions">
            <StatusBadge status={selected.status} type="request" />
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddQuote(true)}>
              <Plus size={16} /> Agregar cotización de proveedor
            </button>
          </div>
        </div>

        {selected.status === 'Aprobada' && activeQuote && (
          <div className="panel panel-padded request-approved-banner">
            <p className="cell-strong">
              El cliente aceptó la cotización {activeQuote.id} de {activeQuote.supplier}.
            </p>
            <p className="cell-muted">Ya se puede generar la orden de trabajo correspondiente.</p>
            <button
              type="button"
              className="btn btn-primary request-approved-cta"
              onClick={() => navigate('/ordenes', { state: { openQuoteId: activeQuote.id } })}
            >
              Ir a Órdenes de Trabajo
            </button>
          </div>
        )}

        <h2 className="section-title" style={{ marginBottom: '1rem' }}>
          Cotizaciones por proveedor
        </h2>

        <div className="quote-compare-grid">
          {quotes.map((q) => {
            const isActive = q.sentToClient;
            const canSend = !isActive && !q.discarded && selected.status !== 'Aprobada';
            const awaitingReply = isActive && q.estado === 'pendiente';

            return (
              <div
                key={q.id}
                className={`panel panel-padded quote-compare-card ${isActive ? 'quote-compare-card-active' : ''} ${q.discarded ? 'quote-compare-card-discarded' : ''}`}
              >
                <div className="quote-compare-header">
                  <h3 className="cell-strong">{q.supplier}</h3>
                  <StatusBadge status={getQuoteDisplayStatus(q)} type="quote" />
                </div>
                <p className="cell-muted">
                  {q.id} · {q.date}
                </p>
                <p className="quote-compare-total">${q.total.toFixed(2)}</p>

                <ul className="quote-compare-items">
                  {q.items.map((it, i) => (
                    <li key={i}>
                      {it.quantity}× {it.title || it.description}
                    </li>
                  ))}
                </ul>

                {q.notes && <p className="cell-muted quote-compare-notes">{q.notes}</p>}

                {q.intermediationFee?.value > 0 && (
                  <p className="cell-muted" style={{ marginBottom: '0.5rem' }}>
                    Tarifa de intermediación: ${q.intermediationFee.value.toFixed(2)} ({q.intermediationFee.percent}%)
                  </p>
                )}

                <div className="quote-compare-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => handleDownloadDocx(q)}>
                    <FileDown size={14} /> Descargar Word
                  </button>
                  {canSend && (
                    <button type="button" className="btn btn-secondary" onClick={() => handleSend(q.id)}>
                      <Send size={14} /> Enviar al cliente
                    </button>
                  )}
                  {awaitingReply && (
                    <>
                      <button type="button" className="btn btn-success" onClick={() => handleApprove(q.id)}>
                        <Check size={14} /> Cliente aceptó
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => handleReject(q.id)}>
                        <XIcon size={14} /> Cliente rechazó
                      </button>
                    </>
                  )}
                  {!isActive && !q.discarded && selected.status !== 'Aprobada' && (
                    <button type="button" className="btn-icon" title="Descartar esta cotización" onClick={() => handleDiscard(q.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                  {q.discarded && (
                    <button type="button" className="btn btn-secondary" onClick={() => handleRestore(q.id)}>
                      <RotateCcw size={14} /> Restaurar
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {quotes.length === 0 && (
            <p className="empty-state">Aún no hay cotizaciones de ningún taller para esta solicitud.</p>
          )}
        </div>

        {showAddQuote && <AddQuoteModal onClose={() => setShowAddQuote(false)} onSave={handleAddQuote} />}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Solicitudes</h1>
          <p className="page-subtitle">Trabajos pedidos por clientes, antes de cotizar con los talleres</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nueva Solicitud
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
            <span className={`tab-count ${activeTab === tab.key ? 'active' : ''}`}>{tabCounts[tab.key] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="panel">
        {loading ? (
          <p className="muted panel-padded">Cargando solicitudes…</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th>Talleres cotizando</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="cell-strong">{request.id}</td>
                    <td>{request.client}</td>
                    <td className="cell-muted">{request.description}</td>
                    <td className="cell-muted">{request.date}</td>
                    <td>{request.quoteCount}</td>
                    <td>
                      <StatusBadge status={request.status} type="request" />
                    </td>
                    <td>
                      <button type="button" className="btn btn-secondary" onClick={() => openDetail(request)}>
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      No hay solicitudes en este estado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <RequestFormModal onClose={() => setShowModal(false)} onSave={handleCreate} />}
    </div>
  );
}
