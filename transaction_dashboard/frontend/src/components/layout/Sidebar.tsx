// frontend/src/components/layout/Sidebar.tsx

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function Sidebar() {
  // Estado local - más simple, no requiere Context
  const [isExpanded, setIsExpanded] = useState(true)
  const location = useLocation()

  const menuItems = [
    {
      id: 'home',
      name: 'Dashboard',
      color: 'bg-blue-500',
      enabled: true,
      path: '/'
    },
    {
      id: 'caso1',
      name: 'Patrones Horarios',
      color: 'bg-indigo-500',
      enabled: true,
      path: '/casos/horarios'
    },
    {
      id: 'caso2',
      name: 'Control de Caducidad',
      color: 'bg-green-500',
      enabled: true,
      path: '/casos/caducidad'
    },
    {
      id: 'caso3',
      name: 'Gestión de Precios',
      color: 'bg-orange-500',
      enabled: true,
      path: '/casos/precios'
    },
    {
      id: 'caso4',
      name: 'Identificación de Clientes',
      color: 'bg-purple-500',
      enabled: true,
      path: '/casos/clientes'
    },
    {
      id: 'caso5',
      name: 'Seguimiento de Inventario',
      color: 'bg-yellow-500',
      enabled: true,
      path: '/casos/inventario'
    },
    {
      id: 'caso6',
      name: 'Métodos de Pago',
      color: 'bg-pink-500',
      enabled: true,
      path: '/casos/pagos'
    },
    {
      id: 'caso7',
      name: 'Control de Devoluciones',
      color: 'bg-red-500',
      enabled: true,
      path: '/casos/devoluciones'
    },
    {
      id: 'caso8',
      name: 'Análisis de Descuentos',
      color: 'bg-teal-500',
      enabled: true,
      path: '/casos/descuentos'
    },
    {
      id: 'caso9',
      name: 'Identificación de Empleados',
      color: 'bg-cyan-500',
      enabled: true,
      path: '/casos/empleados'
    },
    {
      id: 'caso10',
      name: 'Análisis de Variantes',
      color: 'bg-lime-500',
      enabled: true,
      path: '/casos/variantes'
    },
    {
      id: 'caso11',
      name: 'Canasta de Mercado',
      color: 'bg-rose-500',
      enabled: true,
      path: '/casos/recomendaciones'
    },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside
      className={`
        bg-gradient-to-br from-blue-50 via-white to-blue-100 border-r border-gray-200 shadow-xl
        transition-all duration-300 ease-in-out
        flex-shrink-0 h-screen flex flex-col
        ${isExpanded ? 'w-72' : 'w-24'}
      `}
    >
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`
          flex items-center p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 relative
          ${isExpanded ? 'justify-between' : 'justify-center'}
        `}>
          {isExpanded && (
            <div className="flex items-center space-x-2">
              <span className="inline-block">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="bar1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#34D399" />
                      <stop offset="100%" stop-color="#3B82F6" />
                    </linearGradient>
                    <linearGradient id="bar2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#A78BFA" />
                      <stop offset="100%" stop-color="#34D399" />
                    </linearGradient>
                    <linearGradient id="bar3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#F472B6" />
                      <stop offset="100%" stop-color="#A78BFA" />
                    </linearGradient>
                  </defs>
                  <rect x="3" y="12" width="3" height="7" rx="1" fill="url(#bar1)" />
                  <rect x="8" y="8" width="3" height="11" rx="1" fill="url(#bar2)" />
                  <rect x="13" y="4" width="3" height="15" rx="1" fill="url(#bar3)" />
                </svg>
              </span>
              <h2 className="text-xl font-extrabold text-white whitespace-nowrap tracking-wide drop-shadow-lg">Analytics</h2>
            </div>
          )}
          {!isExpanded && (
            <span className="inline-block">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="bar1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#34D399" />
                    <stop offset="100%" stop-color="#3B82F6" />
                  </linearGradient>
                  <linearGradient id="bar2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#A78BFA" />
                    <stop offset="100%" stop-color="#34D399" />
                  </linearGradient>
                  <linearGradient id="bar3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#F472B6" />
                    <stop offset="100%" stop-color="#A78BFA" />
                  </linearGradient>
                </defs>
                <rect x="3" y="12" width="3" height="7" rx="1" fill="url(#bar1)" />
                <rect x="8" y="8" width="3" height="11" rx="1" fill="url(#bar2)" />
                <rect x="13" y="4" width="3" height="15" rx="1" fill="url(#bar3)" />
              </svg>
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-blue-400 transition-colors text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label={isExpanded ? "Contraer menú" : "Expandir menú"}
            title={isExpanded ? "Contraer menú" : "Expandir menú"}
          >
            <svg 
              className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item, idx) => {
              const active = isActive(item.path)
              // Separador visual después del Dashboard
              if (idx === 1 && isExpanded) {
                return [
                  <li key="divider" className="my-2">
                    <hr className="border-t border-gray-200" />
                  </li>,
                  <li key={item.id}>
                    {item.enabled ? (
                      <Link
                        to={item.path}
                        className={`
                          w-full flex items-center rounded-xl transition-all group
                          ${isExpanded ? 'justify-start p-3' : 'justify-center p-3'}
                          ${active
                            ? 'bg-blue-500 text-white shadow-lg border-2 border-blue-400'
                            : 'hover:bg-blue-100 text-gray-700'
                          }
                        `}
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: isExpanded ? '1rem' : '0.95rem', letterSpacing: '0.01em' }}
                        title={!isExpanded ? item.name : undefined}
                      >
                        <div className={`flex items-center ${isExpanded ? 'space-x-3' : ''}`}>
                          <span className={`inline-block w-3 h-3 rounded-full ${item.color} flex-shrink-0 shadow-md`}></span>
                          {isExpanded && (
                            <span className="font-semibold text-base whitespace-nowrap tracking-tight">{`${idx}. ${item.name}`}</span>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div
                        className={`
                          w-full flex items-center rounded-xl opacity-50 cursor-not-allowed text-gray-400
                          ${isExpanded ? 'justify-start p-3' : 'justify-center p-3'}
                        `}
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: isExpanded ? '1rem' : '0.95rem', letterSpacing: '0.01em' }}
                        title={!isExpanded ? `${item.name} (Próximamente)` : undefined}
                      >
                        <div className={`flex items-center ${isExpanded ? 'space-x-3' : ''}`}>
                          <span className={`inline-block w-3 h-3 rounded-full ${item.color} flex-shrink-0 shadow-md`}></span>
                          {isExpanded && (
                            <span className="font-semibold text-sm whitespace-nowrap tracking-tight">{`${idx}. ${item.name}`}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                ]
              }
              return (
                <li key={item.id}>
                  {item.enabled ? (
                    <Link
                      to={item.path}
                      className={`
                        w-full flex items-center rounded-xl transition-all group
                        ${isExpanded ? 'justify-start p-3' : 'justify-center p-3'}
                        ${active
                          ? 'bg-blue-500 text-white shadow-lg border-2 border-blue-400'
                          : 'hover:bg-blue-100 text-gray-700'
                        }
                      `}
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: isExpanded ? '1rem' : '0.95rem', letterSpacing: '0.01em' }}
                      title={!isExpanded ? item.name : undefined}
                    >
                      <div className={`flex items-center ${isExpanded ? 'space-x-3' : ''}`}>
                        <span className={`inline-block w-3 h-3 rounded-full ${item.color} flex-shrink-0 shadow-md`}></span>
                        {isExpanded && idx > 0 && (
                          <span className="font-semibold text-base whitespace-nowrap tracking-tight">{`${idx}. ${item.name}`}</span>
                        )}
                        {isExpanded && idx === 0 && (
                          <span className="font-semibold text-base whitespace-nowrap tracking-tight">{item.name}</span>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div
                      className={`
                        w-full flex items-center rounded-xl opacity-50 cursor-not-allowed text-gray-400
                        ${isExpanded ? 'justify-start p-3' : 'justify-center p-3'}
                      `}
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: isExpanded ? '1rem' : '0.95rem', letterSpacing: '0.01em' }}
                      title={!isExpanded ? `${item.name} (Próximamente)` : undefined}
                    >
                      <div className={`flex items-center ${isExpanded ? 'space-x-3' : ''}`}>
                        <span className={`inline-block w-3 h-3 rounded-full ${item.color} flex-shrink-0 shadow-md`}></span>
                        {isExpanded && idx > 0 && (
                          <span className="font-semibold text-base whitespace-nowrap tracking-tight">{`${idx}. ${item.name}`}</span>
                        )}
                        {isExpanded && idx === 0 && (
                          <span className="font-semibold text-sm whitespace-nowrap tracking-tight">{item.name}</span>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>       
      </div>
    </aside>
  )
}