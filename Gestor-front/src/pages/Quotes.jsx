import { useEffect, useMemo, useState } from 'react';
import { Plus, Eye, Edit2, Archive } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import QuoteFormModal from '../components/modals/QuoteFormModal';
import { getQuotes, createQuote, archiveQuote } from '../services/quotesService';
import './Quotes.css';

const TABS = [
  { key: 'all', label: 'Todas' },
  { key: 'Borrador', label: 'Borrador' },
  { key: 'Enviada', label: 'Enviada' },
  { key: 'Aceptada', label: 'Aceptada' },
  { key: 'Rechazada', label: 'Rechazada' },
  { key: 'Archivada', label: 'Archivada' },
];

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    getQuotes().then((data) => {
      setQuotes(data);
      setLoading(false);
    });
  }

  const tabCounts = useMemo(() => {
    const counts = { all: quotes.length };
    for (const tab of TABS.slice(1)) {
      counts[tab.key] = quotes.filter((q) => q.status === tab.key).length;
    }
    return counts;
  }, [quotes]);

  const filteredQuotes = activeTab === 'all' ? quotes : quotes.filter((q) => q.status === activeTab);

  async function handleCreate(payload) {
    await createQuote(payload);
    setShowModal(false);
    refresh();
  }

  async function handleArchive(id) {
    await archiveQuote(id);
    refresh();
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cotizaciones</h1>
          <p className="page-subtitle">Gestiona las cotizaciones entregadas a tus clientes</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nueva Cotización
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
          <p className="muted panel-padded">Cargando cotizaciones…</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id}>
                    <td className="cell-strong">{quote.id}</td>
                    <td>{quote.client}</td>
                    <td className="cell-muted">{quote.date}</td>
                    <td className="cell-strong">${quote.total.toFixed(2)}</td>
                    <td>
                      <StatusBadge status={quote.status} type="quote" />
                    </td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="btn-icon" title="Ver detalle">
                          <Eye size={16} />
                        </button>
                        <button type="button" className="btn-icon" title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Archivar"
                          onClick={() => handleArchive(quote.id)}
                        >
                          <Archive size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredQuotes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      No hay cotizaciones en este estado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <QuoteFormModal onClose={() => setShowModal(false)} onSave={handleCreate} />}
    </div>
  );
}
