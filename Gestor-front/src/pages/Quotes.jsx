import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2 } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import QuoteFormModal from '../components/modals/QuoteFormModal';
import { getQuotes, updateQuote, getQuoteDisplayStatus } from '../services/quotesService';
import './Quotes.css';

const TABS = [
  { key: 'all', label: 'Todas' },
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'aprobada', label: 'Aprobada' },
  { key: 'rechazada', label: 'Rechazada' },
];

/**
 * Vista global de cotizaciones (de todos los talleres, de todas las
 * solicitudes). Para comparar las cotizaciones de una solicitud específica
 * antes de elegir cuál mandar al cliente, ver la página Solicitudes — ahí
 * también se agregan cotizaciones nuevas y se registra la respuesta del
 * cliente. Esta vista es de solo consulta + edición de líneas.
 */
export default function Quotes() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [editingQuote, setEditingQuote] = useState(null);

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
      counts[tab.key] = quotes.filter((q) => q.estado === tab.key).length;
    }
    return counts;
  }, [quotes]);

  const filteredQuotes = activeTab === 'all' ? quotes : quotes.filter((q) => q.estado === activeTab);

  async function handleSaveEdit(payload) {
    await updateQuote(editingQuote.id, payload);
    setEditingQuote(null);
    refresh();
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cotizaciones</h1>
          <p className="page-subtitle">Todas las cotizaciones recibidas de los talleres, por solicitud</p>
        </div>
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
                  <th>Solicitud</th>
                  <th>Cliente</th>
                  <th>Taller</th>
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
                    <td className="cell-muted">{quote.requestId}</td>
                    <td>{quote.client}</td>
                    <td>{quote.supplier}</td>
                    <td className="cell-muted">{quote.date}</td>
                    <td className="cell-strong">${quote.total.toFixed(2)}</td>
                    <td>
                      <StatusBadge status={getQuoteDisplayStatus(quote)} type="quote" />
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn-icon"
                          title="Ver solicitud"
                          onClick={() => navigate('/solicitudes', { state: { openRequestId: quote.requestId } })}
                        >
                          <Eye size={16} />
                        </button>
                        {!quote.sentToClient && (
                          <button type="button" className="btn-icon" title="Editar" onClick={() => setEditingQuote(quote)}>
                            <Edit2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredQuotes.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      No hay cotizaciones en este estado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingQuote && (
        <QuoteFormModal quote={editingQuote} onClose={() => setEditingQuote(null)} onSave={handleSaveEdit} />
      )}
    </div>
  );
}
