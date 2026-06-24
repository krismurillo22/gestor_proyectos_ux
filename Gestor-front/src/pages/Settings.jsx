import './Settings.css';
import { useState } from 'react';
import { Archive, ChevronRight } from 'lucide-react';
import WorkOrderArchiveModal from '../components/modals/WorkOrderArchiveModal';

export default function Settings() {
  const [showArchive, setShowArchive] = useState(false);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">Administración general del sistema</p>
        </div>
      </div>

      <div className="settings-grid">
        <button
          type="button"
          className="settings-card"
          onClick={() => setShowArchive(true)}
        >
          <span className="settings-card-icon">
            <Archive size={22} />
          </span>
          <div className="settings-card-body">
            <p className="settings-card-title">Archivero de órdenes</p>
            <p className="settings-card-desc">Consulta y restaura órdenes completadas archivadas</p>
          </div>
          <ChevronRight size={16} className="settings-card-arrow" />
        </button>
      </div>

      {showArchive && <WorkOrderArchiveModal onClose={() => setShowArchive(false)} />}
    </div>
  );
}
