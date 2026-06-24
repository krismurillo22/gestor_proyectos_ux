import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import Quotes from './pages/Quotes';
import WorkOrders from './pages/WorkOrders';
import Clients from './pages/Clients';
import Settings from './pages/Settings';
import Reports from './pages/Reports';

/**
 * Árbol de rutas de la app. Coincide con la navegación del sidebar
 * (MainLayout). Si agregan una pantalla nueva, regístrenla aquí y en
 * src/layouts/MainLayout.jsx (NAV_ITEMS).
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="solicitudes" element={<Requests />} />
          <Route path="cotizaciones" element={<Quotes />} />
          <Route path="ordenes" element={<WorkOrders />} />
          <Route path="clientes" element={<Clients />} />
          <Route path="reportes" element={<Reports />} />
          <Route path="configuracion" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
