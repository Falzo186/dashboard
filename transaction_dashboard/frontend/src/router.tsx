// frontend/src/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { DashboardHomePage } from './features/dashboard'
import { HorariosPage } from './features/casos/horarios'
import { CaducidadPage } from './features/casos/caducidad/pages/CaducidadPage'
import { PreciosPage } from './features/casos/precios' 
import { ClientesPage } from './features/casos/clientes'
import { InventarioPage } from './features/casos/inventario/pages/InventarioPage'
import { PagosPage } from './features/casos/pagos'
import { DevolucionesPage } from './features/casos/devoluciones'
import { DescuentosPage } from './features/casos/descuentos/pages/DescuentosPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardHomePage />,
      },
      {
        path: 'casos',
        children: [
          {
            path: 'horarios',
            element: <HorariosPage />,
          },
          // Future use cases will be added here
          {
             path: 'caducidad',
             element: <CaducidadPage />,
          },
          {
            path: 'precios',
            element: <PreciosPage />,
          },
          {
            path: 'clientes',
            element: <ClientesPage />
          },
          {
            path: 'inventario',
            element: <InventarioPage />
          },
          {
            path: 'Pagos',
            element: <PagosPage />
          },
          {
            path: 'Devoluciones',
            element: <DevolucionesPage />
          },
          {
            path: 'descuentos',
            element: <DescuentosPage />
          }
        ],
      },
      // Redirect old route for backwards compatibility
      {
        path: 'patrones',
        element: <Navigate to="/casos/horarios" replace />,
      },
      // Catch-all 404 route
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])
