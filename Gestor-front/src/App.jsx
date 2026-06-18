import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Quotes from './pages/Quotes';
import WorkOrders from './pages/WorkOrders';
import Clients from './pages/Clients';
import Settings from './pages/Settings';

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
          <Route path="cotizaciones" element={<Quotes />} />
          <Route path="ordenes" element={<WorkOrders />} />
          <Route path="clientes" element={<Clients />} />
          <Route path="configuracion" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
