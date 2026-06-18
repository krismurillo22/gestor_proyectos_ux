import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import './MainLayout.css';

/**
 * Define el sidebar. Para agregar una pantalla nueva: crear la página en
 * src/pages, registrar la <Route> en src/App.jsx, y agregar la entrada aquí.
 */
const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/cotizaciones', icon: FileText, label: 'Cotizaciones' },
  { path: '/ordenes', icon: ClipboardList, label: 'Órdenes de Trabajo' },
  { path: '/clientes', icon: Users, label: 'Clientes y Proveedores' },
  { path: '/configuracion', icon: Settings, label: 'Configuración' },
];

// TODO(auth): cuando exista login, esta info debería venir de un
// AuthContext / authService.getCurrentUser() en vez de estar hardcodeada.
const CURRENT_USER = { initials: 'JD', name: 'Juan Díaz', role: 'Administrador' };

export default function MainLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        <div className="sidebar-header">
          {sidebarOpen && <h1 className="sidebar-logo">MachiShop ERP</h1>}
          <button
            type="button"
            className="btn-icon"
            onClick={() => setSidebarOpen((open) => !open)}
            title={sidebarOpen ? 'Colapsar menú' : 'Expandir menú'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const isActive =
              location.pathname === path ||
              (path !== '/' && location.pathname.startsWith(path));

            return (
              <Link
                key={path}
                to={path}
                className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              >
                <Icon size={20} className="sidebar-link-icon" />
                {sidebarOpen && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{CURRENT_USER.initials}</div>
            {sidebarOpen && (
              <div className="sidebar-user-info">
                <p className="sidebar-user-name">{CURRENT_USER.name}</p>
                <p className="sidebar-user-role">{CURRENT_USER.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
