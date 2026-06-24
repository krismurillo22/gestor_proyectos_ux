import { useState, useEffect, useMemo } from 'react';
import { BarChart2, FileText, Users, ClipboardList, Download, ChevronDown, ChevronUp } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { getWorkOrders } from '../services/workOrdersService';
import { getQuotes } from '../services/quotesService';
import { getClients } from '../services/clientsService';
import { getSuppliers } from '../services/suppliersService';
import './Reports.css';

const REPORTS = [
  { id: 'ordenes',      icon: ClipboardList, label: 'Órdenes de trabajo',    desc: 'Historial por estado, cliente o taller' },
  { id: 'cotizaciones', icon: FileText,       label: 'Cotizaciones',          desc: 'Cotizaciones recibidas, aprobadas y rechazadas' },
  { id: 'clientes',     icon: Users,          label: 'Clientes',              desc: 'Actividad y volumen facturado por cliente' },
  { id: 'proveedores',  icon: BarChart2,      label: 'Proveedores / Talleres', desc: 'Órdenes asignadas y total pagado por taller' },
];

const fmt = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── PDF export con jsPDF ──────────────────────────────────────────────────
async function exportPdf({ title, subtitle, headers, rows }) {
  const { jsPDF } = await import('jspdf');

  const isLandscape = headers.length > 5;
  const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: isLandscape ? 'landscape' : 'portrait' });

  const pageW = isLandscape ? 279.4 : 215.9;
  const margin = 14;
  const contentW = pageW - margin * 2;

  const NAVY  = [30, 41, 59];
  const LIGHT = [241, 245, 249];
  const GRAY  = [248, 250, 252];
  const MUTED = [100, 116, 139];
  const DARK  = [15, 23, 42];
  const WHITE = [255, 255, 255];

  let y = margin;

  // Header bar
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 18, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text('TECPRO SULA', margin, 11);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('es-HN'), pageW - margin, 11, { align: 'right' });
  y = 26;

  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text(title, margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text(subtitle, margin, y);
  y += 10;

  // Column widths — distribute proportionally
  const numCols = headers.length;
  const numericCols = headers.filter((h) => h.num).length;
  const textCols = numCols - numericCols;
  const numColW = 28;
  const textColW = (contentW - numericCols * numColW) / (textCols || 1);
  const colWidths = headers.map((h) => h.num ? numColW : textColW);
  const colX = colWidths.reduce((acc, w, i) => { acc.push(i === 0 ? margin : acc[i - 1] + colWidths[i - 1]); return acc; }, []);

  // Table header row
  const rowH = 8;
  doc.setFillColor(...NAVY);
  doc.rect(margin, y, contentW, rowH, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  headers.forEach((h, i) => {
    const x = h.num ? colX[i] + colWidths[i] - 3 : colX[i] + 3;
    doc.text(h.label, x, y + 5.5, { align: h.num ? 'right' : 'left' });
  });
  y += rowH;

  // Data rows
  doc.setFont('helvetica', 'normal');
  rows.forEach((row, ri) => {
    if (y + rowH > (isLandscape ? 190 : 260)) {
      doc.addPage();
      y = margin;
    }
    if (ri % 2 === 0) {
      doc.setFillColor(...GRAY);
      doc.rect(margin, y, contentW, rowH, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentW, rowH, 'S');

    headers.forEach((h, i) => {
      const val = String(row[h.key] ?? '—');
      const maxW = colWidths[i] - 6;
      const truncated = doc.getTextWidth(val) > maxW
        ? val.slice(0, Math.floor(val.length * maxW / doc.getTextWidth(val)) - 1) + '…'
        : val;
      doc.setTextColor(...DARK);
      doc.setFontSize(8);
      const x = h.num ? colX[i] + colWidths[i] - 3 : colX[i] + 3;
      doc.text(truncated, x, y + 5.5, { align: h.num ? 'right' : 'left' });
    });
    y += rowH;
  });

  // Footer
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`${rows.length} registro${rows.length !== 1 ? 's' : ''} · Generado por Tecpro Sula`, margin, y);

  // Open in new tab
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// ── Reporte 1: Órdenes ────────────────────────────────────────────────────
function ReportOrdenes() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { getWorkOrders().then((d) => { setOrders(d); setLoading(false); }); }, []);

  const filtered = useMemo(() => orders.filter((o) => {
    if (search) {
      const q = search.toLowerCase();
      if (!o.client?.toLowerCase().includes(q) && !o.supplier?.toLowerCase().includes(q) &&
          !o.description?.toLowerCase().includes(q) && !o.status?.toLowerCase().includes(q) &&
          !String(o.id).includes(q)) return false;
    }
    if (dateFrom && o.dueDate && o.dueDate < dateFrom) return false;
    if (dateTo && o.dueDate && o.dueDate > dateTo) return false;
    return true;
  }), [orders, search, dateFrom, dateTo]);

  const totalValue = filtered.reduce((s, o) => s + (o.quoteTotal || 0), 0);

  function handleExport() {
    exportPdf({
      title: 'Reporte de Órdenes de Trabajo',
      subtitle: search ? `Filtro: "${search}"` : 'Todas las órdenes',
      headers: [
        { label: 'OT', key: 'ot' },
        { label: 'Cliente', key: 'client' },
        { label: 'Taller', key: 'supplier' },
        { label: 'Descripción', key: 'description' },
        { label: 'Estado', key: 'status' },
        { label: 'Fecha límite', key: 'dueDate' },
        { label: 'Total', key: 'total', num: true },
      ],
      rows: filtered.map((o) => ({ ot: `OT-${o.id}`, client: o.client, supplier: o.supplier, description: o.description || '—', status: o.status, dueDate: o.dueDate, total: o.quoteTotal != null ? fmt(o.quoteTotal) : '—' })),
      filename: 'reporte-ordenes.pdf',
    });
  }

  if (loading) return <p className="cell-muted">Cargando…</p>;

  return (
    <div>
      <div className="report-filters">
        <input type="text" className="report-search" placeholder="Buscar por OT, cliente, taller, estado…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <span className="report-date-sep">Vence</span>
        <input type="date" className="report-date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <span className="report-date-sep">—</span>
        <input type="date" className="report-date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>
      <div className="report-summary">
        <div className="report-stat"><span className="report-stat-label">Órdenes</span><span className="report-stat-value">{filtered.length}</span></div>
        <div className="report-stat"><span className="report-stat-label">Valor total</span><span className="report-stat-value">{fmt(totalValue)}</span></div>
        <div className="report-stat"><span className="report-stat-label">Completadas</span><span className="report-stat-value">{filtered.filter((o) => o.status === 'Completada').length}</span></div>
        <div className="report-stat"><span className="report-stat-label">En progreso</span><span className="report-stat-value">{filtered.filter((o) => o.status === 'En Progreso').length}</span></div>
      </div>
      <div className="report-table-actions">
        <span className="cell-muted">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        <button type="button" className="btn btn-secondary" onClick={handleExport}><Download size={14} /> Exportar PDF</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>OT</th><th>Cliente</th><th>Taller</th><th>Descripción</th><th>Estado</th><th>Fecha límite</th><th>Total</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={7} className="empty-state">Sin resultados.</td></tr>
            : filtered.map((o) => (
              <tr key={o.id}>
                <td className="cell-strong">OT-{o.id}</td>
                <td>{o.client}</td>
                <td className="cell-muted">{o.supplier}</td>
                <td className="cell-muted">{o.description || '—'}</td>
                <td><StatusBadge status={o.status} type="order" /></td>
                <td className="cell-muted">{o.dueDate}</td>
                <td className="cell-strong">{o.quoteTotal != null ? fmt(o.quoteTotal) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Reporte 2: Cotizaciones ────────────────────────────────────────────────
function ReportCotizaciones() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { getQuotes().then((d) => { setQuotes(d); setLoading(false); }); }, []);

  const filtered = useMemo(() => quotes.filter((q) => {
    if (search) {
      const s = search.toLowerCase();
      if (!q.client?.toLowerCase().includes(s) && !q.supplier?.toLowerCase().includes(s) &&
          !q.estado?.toLowerCase().includes(s) && !String(q.id).includes(s)) return false;
    }
    if (dateFrom && q.date && q.date < dateFrom) return false;
    if (dateTo && q.date && q.date > dateTo) return false;
    return true;
  }), [quotes, search, dateFrom, dateTo]);

  const aprobadas = filtered.filter((q) => q.estado === 'aprobada');
  const tasa = filtered.length > 0 ? Math.round((aprobadas.length / filtered.length) * 100) : 0;

  function handleExport() {
    exportPdf({
      title: 'Reporte de Cotizaciones',
      subtitle: search ? `Filtro: "${search}"` : 'Todas las cotizaciones',
      headers: [
        { label: 'ID', key: 'id' },
        { label: 'Cliente', key: 'client' },
        { label: 'Taller', key: 'supplier' },
        { label: 'Fecha', key: 'date' },
        { label: 'Estado', key: 'estado' },
        { label: 'Total', key: 'total', num: true },
      ],
      rows: filtered.map((q) => ({ id: q.id, client: q.client, supplier: q.supplier, date: q.date, estado: q.estado, total: fmt(q.total) })),
    });
  }

  if (loading) return <p className="cell-muted">Cargando…</p>;

  return (
    <div>
      <div className="report-filters">
        <input type="text" className="report-search" placeholder="Buscar por cliente, taller, estado o ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <span className="report-date-sep">Fecha</span>
        <input type="date" className="report-date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <span className="report-date-sep">—</span>
        <input type="date" className="report-date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>
      <div className="report-summary">
        <div className="report-stat"><span className="report-stat-label">Cotizaciones</span><span className="report-stat-value">{filtered.length}</span></div>
        <div className="report-stat"><span className="report-stat-label">Valor total</span><span className="report-stat-value">{fmt(filtered.reduce((s, q) => s + (q.total || 0), 0))}</span></div>
        <div className="report-stat"><span className="report-stat-label">Aprobadas</span><span className="report-stat-value">{aprobadas.length}</span></div>
        <div className="report-stat"><span className="report-stat-label">Tasa aprobación</span><span className="report-stat-value">{tasa}%</span></div>
      </div>
      <div className="report-table-actions">
        <span className="cell-muted">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        <button type="button" className="btn btn-secondary" onClick={handleExport}><Download size={14} /> Exportar PDF</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>ID</th><th>Cliente</th><th>Taller</th><th>Fecha</th><th>Estado</th><th>Total</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={6} className="empty-state">Sin resultados.</td></tr>
            : filtered.map((q) => (
              <tr key={q.id}>
                <td className="cell-strong">{q.id}</td>
                <td>{q.client}</td>
                <td className="cell-muted">{q.supplier}</td>
                <td className="cell-muted">{q.date}</td>
                <td><StatusBadge status={q.estado === 'aprobada' ? 'Aprobada' : q.estado === 'rechazada' ? 'Rechazada' : 'Pendiente'} type="quote" /></td>
                <td className="cell-strong">{fmt(q.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Reporte 3: Clientes ────────────────────────────────────────────────────
function ReportClientes() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    Promise.all([getClients(), getWorkOrders()]).then(([clients, orders]) => {
      setRows(clients.map((c) => {
        const cos = orders.filter((o) => o.client === c.name);
        const completadas = cos.filter((o) => o.status === 'Completada');
        return { ...c, totalOrders: cos.length, completadas: completadas.length, facturado: completadas.reduce((s, o) => s + (o.quoteTotal || 0), 0) };
      }));
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let r = rows.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));
    return [...r].sort((a, b) => {
      const av = a[sortBy]; const bv = b[sortBy];
      return typeof av === 'string' ? (sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)) : (sortAsc ? av - bv : bv - av);
    });
  }, [rows, search, sortBy, sortAsc]);

  function toggleSort(col) { if (sortBy === col) setSortAsc((p) => !p); else { setSortBy(col); setSortAsc(true); } }
  function SortIcon({ col }) { if (sortBy !== col) return null; return sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />; }

  function handleExport() {
    exportPdf({
      title: 'Reporte de Clientes',
      subtitle: search ? `Filtro: "${search}"` : 'Todos los clientes',
      headers: [
        { label: 'Cliente', key: 'name' },
        { label: 'RTN', key: 'rtn' },
        { label: 'Órdenes', key: 'totalOrders', num: true },
        { label: 'Completadas', key: 'completadas', num: true },
        { label: 'Total facturado', key: 'facturado', num: true },
      ],
      rows: filtered.map((c) => ({ name: c.name, rtn: c.rtn || '—', totalOrders: c.totalOrders, completadas: c.completadas, facturado: fmt(c.facturado) })),
    });
  }

  if (loading) return <p className="cell-muted">Cargando…</p>;

  return (
    <div>
      <div className="report-filters">
        <input type="text" className="report-search" placeholder="Buscar cliente…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="report-summary">
        <div className="report-stat"><span className="report-stat-label">Clientes</span><span className="report-stat-value">{filtered.length}</span></div>
        <div className="report-stat"><span className="report-stat-label">Total facturado</span><span className="report-stat-value">{fmt(filtered.reduce((s, c) => s + c.facturado, 0))}</span></div>
        <div className="report-stat"><span className="report-stat-label">Órdenes totales</span><span className="report-stat-value">{filtered.reduce((s, c) => s + c.totalOrders, 0)}</span></div>
      </div>
      <div className="report-table-actions">
        <span className="cell-muted">{filtered.length} cliente{filtered.length !== 1 ? 's' : ''}</span>
        <button type="button" className="btn btn-secondary" onClick={handleExport}><Download size={14} /> Exportar PDF</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th className="report-th-sort" onClick={() => toggleSort('name')}>Cliente <SortIcon col="name" /></th>
            <th>RTN</th>
            <th className="report-th-sort" onClick={() => toggleSort('totalOrders')}>Órdenes <SortIcon col="totalOrders" /></th>
            <th className="report-th-sort" onClick={() => toggleSort('completadas')}>Completadas <SortIcon col="completadas" /></th>
            <th className="report-th-sort" onClick={() => toggleSort('facturado')}>Facturado <SortIcon col="facturado" /></th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={5} className="empty-state">Sin resultados.</td></tr>
            : filtered.map((c) => (
              <tr key={c.id}>
                <td className="cell-strong">{c.name}</td>
                <td className="cell-muted">{c.rtn || '—'}</td>
                <td>{c.totalOrders}</td>
                <td>{c.completadas}</td>
                <td className="cell-strong">{fmt(c.facturado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Reporte 4: Proveedores ─────────────────────────────────────────────────
function ReportProveedores() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    Promise.all([getSuppliers(), getWorkOrders()]).then(([suppliers, orders]) => {
      setRows(suppliers.map((s) => {
        const sos = orders.filter((o) => o.supplier === s.name);
        const completadas = sos.filter((o) => o.status === 'Completada');
        return { ...s, totalOrders: sos.length, completadas: completadas.length, pagado: completadas.reduce((sum, o) => sum + (o.quoteTotal || 0), 0) };
      }));
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let r = rows.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()));
    return [...r].sort((a, b) => {
      const av = a[sortBy]; const bv = b[sortBy];
      return typeof av === 'string' ? (sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)) : (sortAsc ? av - bv : bv - av);
    });
  }, [rows, search, sortBy, sortAsc]);

  function toggleSort(col) { if (sortBy === col) setSortAsc((p) => !p); else { setSortBy(col); setSortAsc(true); } }
  function SortIcon({ col }) { if (sortBy !== col) return null; return sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />; }

  function handleExport() {
    exportPdf({
      title: 'Reporte de Proveedores / Talleres',
      subtitle: search ? `Filtro: "${search}"` : 'Todos los talleres',
      headers: [
        { label: 'Taller', key: 'name' },
        { label: 'RTN', key: 'rtn' },
        { label: 'Órdenes', key: 'totalOrders', num: true },
        { label: 'Completadas', key: 'completadas', num: true },
        { label: 'Total pagado', key: 'pagado', num: true },
      ],
      rows: filtered.map((s) => ({ name: s.name, rtn: s.rtn || '—', totalOrders: s.totalOrders, completadas: s.completadas, pagado: fmt(s.pagado) })),
    });
  }

  if (loading) return <p className="cell-muted">Cargando…</p>;

  return (
    <div>
      <div className="report-filters">
        <input type="text" className="report-search" placeholder="Buscar taller…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="report-summary">
        <div className="report-stat"><span className="report-stat-label">Talleres</span><span className="report-stat-value">{filtered.length}</span></div>
        <div className="report-stat"><span className="report-stat-label">Total pagado</span><span className="report-stat-value">{fmt(filtered.reduce((s, p) => s + p.pagado, 0))}</span></div>
        <div className="report-stat"><span className="report-stat-label">Órdenes totales</span><span className="report-stat-value">{filtered.reduce((s, p) => s + p.totalOrders, 0)}</span></div>
      </div>
      <div className="report-table-actions">
        <span className="cell-muted">{filtered.length} taller{filtered.length !== 1 ? 'es' : ''}</span>
        <button type="button" className="btn btn-secondary" onClick={handleExport}><Download size={14} /> Exportar PDF</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th className="report-th-sort" onClick={() => toggleSort('name')}>Taller <SortIcon col="name" /></th>
            <th>RTN</th>
            <th className="report-th-sort" onClick={() => toggleSort('totalOrders')}>Órdenes <SortIcon col="totalOrders" /></th>
            <th className="report-th-sort" onClick={() => toggleSort('completadas')}>Completadas <SortIcon col="completadas" /></th>
            <th className="report-th-sort" onClick={() => toggleSort('pagado')}>Total pagado <SortIcon col="pagado" /></th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={5} className="empty-state">Sin resultados.</td></tr>
            : filtered.map((s) => (
              <tr key={s.id}>
                <td className="cell-strong">{s.name}</td>
                <td className="cell-muted">{s.rtn || '—'}</td>
                <td>{s.totalOrders}</td>
                <td>{s.completadas}</td>
                <td className="cell-strong">{fmt(s.pagado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const REPORT_COMPONENTS = { ordenes: ReportOrdenes, cotizaciones: ReportCotizaciones, clientes: ReportClientes, proveedores: ReportProveedores };

export default function Reports() {
  const [active, setActive] = useState(null);
  const ActiveReport = active ? REPORT_COMPONENTS[active] : null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reportes</h1>
          <p className="page-subtitle">Consulta y exporta información por módulo</p>
        </div>
      </div>

      {!active ? (
        <div className="reports-grid">
          {REPORTS.map(({ id, icon: Icon, label, desc }) => (
            <button key={id} type="button" className="report-card" onClick={() => setActive(id)}>
              <span className="report-card-icon"><Icon size={24} /></span>
              <div className="report-card-body">
                <p className="report-card-title">{label}</p>
                <p className="report-card-desc">{desc}</p>
              </div>
              <ChevronDown size={16} className="report-card-arrow" style={{ transform: 'rotate(-90deg)' }} />
            </button>
          ))}
        </div>
      ) : (
        <div>
          <div className="report-breadcrumb">
            <button type="button" className="btn btn-secondary" onClick={() => setActive(null)}>← Reportes</button>
            <span className="cell-muted">/</span>
            <span className="cell-strong">{REPORTS.find((r) => r.id === active)?.label}</span>
          </div>
          <div className="panel panel-padded" style={{ marginTop: '1rem' }}>
            <ActiveReport />
          </div>
        </div>
      )}
    </div>
  );
}
