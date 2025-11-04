// frontend/src/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ClientesClassificationPage } from './features/casos/clientes_classification/pages/ClientesClassificationPage'
import { MainLayout } from './components/layout/MainLayout'
import { HorariosPage } from './features/casos/horarios'
import { CaducidadPage } from './features/casos/caducidad/pages/CaducidadPage'
import { PreciosPage } from './features/casos/precios' 
import { ClientesPage } from './features/casos/clientes'
import { InventarioPage } from './features/casos/inventario/pages/InventarioPage'
import { PagosPage } from './features/casos/pagos'
import { DevolucionesPage } from './features/casos/devoluciones'
import { DescuentosPage } from './features/casos/descuentos/pages/DescuentosPage'
import { EmpleadosPage } from './features/casos/empleados'
import { VariantesPage } from './features/casos/variantes/pages/VariantesPage'
import { RecomendacionesPage } from './features/casos/recomendaciones'
import { DashboardHomePage } from './features/dashboard/pages/DashboardHomePage'

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
            path: 'clientes/classification',
            element: <ClientesClassificationPage />
          },
          {
            path: 'inventario',
            element: <InventarioPage />
          },
          {
            path: 'pagos',
            element: <PagosPage />
          },
          {
            path: 'devoluciones',
            element: <DevolucionesPage />
          },
          {
            path: 'descuentos',
            element: <DescuentosPage />
          },
          {
            path: 'empleados',
            element: <EmpleadosPage />
          },
          {
            path: 'variantes',
            element: <VariantesPage />
          }
          ,
          {
            path: 'recomendaciones',
            element: <RecomendacionesPage />
          }
        ],
      },
      {
        path: 'patrones',
        element: <Navigate to="/casos/horarios" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
])
