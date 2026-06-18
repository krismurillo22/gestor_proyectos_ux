import { Settings as SettingsIcon } from 'lucide-react';

/**
 * Placeholder de Configuración. El Figma original tiene este ítem en el
 * sidebar pero no define una pantalla para él. Dejar aquí hasta que el
 * equipo decida qué configuraciones necesita (usuarios, roles, datos
 * de la empresa, notificaciones, etc.).
 */
export default function Settings() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">Próximamente</p>
        </div>
      </div>

      <div className="panel panel-padded empty-state">
        <SettingsIcon size={32} className="icon-primary" style={{ marginBottom: '0.75rem' }} />
        <p>Esta sección no estaba definida en el diseño de Figma original.</p>
        <p className="cell-muted">
          Aquí podría ir gestión de usuarios y roles, datos de la empresa, o preferencias de
          notificaciones.
        </p>
      </div>
    </div>
  );
}
