import React, { useEffect, useState } from 'react'
import useTickets from '../hooks/useTickets'
import apiClient from '../../../../services/api/client'
import { Modal } from '../../../../components/ui/Modal'

const PieChartSimple: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  let angle = 0
  return (
    <svg width={200} height={200} viewBox="0 0 32 32">
      {data.map((d, i) => {
        const portion = d.value / total
        const a = portion * Math.PI * 2
  // center label position not used here
        const large = a > Math.PI ? 1 : 0
        const x2 = 16 + 16 * Math.cos(angle + a)
        const y2 = 16 + 16 * Math.sin(angle + a)
        const path = `M16 16 L ${16 + 16 * Math.cos(angle)} ${16 + 16 * Math.sin(angle)} A 16 16 0 ${large} 1 ${x2} ${y2} Z`
        angle += a
        const colors = ['#2563EB','#10B981','#F59E0B','#EF4444']
        return <path key={i} d={path} fill={colors[i % colors.length]} stroke="#fff"></path>
      })}
    </svg>
  )
}

export const ClientesClassificationPage: React.FC = () => {
  const { data: tickets, isLoading } = useTickets(200)
  const [selected, setSelected] = useState<number | null>(null)
  const [prediction, setPrediction] = useState<any | null>(null)
  const [loadingPred, setLoadingPred] = useState(false)
  const [predictionsMap, setPredictionsMap] = useState<Record<string, any>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [ticketDetails, setTicketDetails] = useState<any[] | null>(null)

  const fetchPrediction = async (transactionId: number) => {
    setLoadingPred(true)
    try {
      const resp = await apiClient.post(`/casos/clientes/predict/${transactionId}`)
      if (resp.data && resp.data.success) setPrediction(resp.data.data)
      // refresh predictions map
      await loadPredictionsMap()
    } catch (err) {
      setPrediction({ predicted_type: 'Desconocido', confidence: 0, explanation: 'Error al consultar predicción' })
    } finally {
      setLoadingPred(false)
    }
  }

  const loadPredictionsMap = async () => {
    try {
      const resp = await apiClient.get('/casos/clientes/predictions?limit=500')
      if (resp.data && resp.data.success) {
        const map: Record<string, any> = {}
        resp.data.data.forEach((r: any) => { map[String(r.transaction_id)] = r })
        setPredictionsMap(map)
      }
    } catch (e) {
      // ignore
    }
  }

  const fetchTicketDetails = async (transactionId: number) => {
    try {
      const resp = await apiClient.get(`/casos/clientes/tickets/${transactionId}/details`)
      if (resp.data && resp.data.success) setTicketDetails(resp.data.data)
      else setTicketDetails(null)
    } catch (e) {
      setTicketDetails(null)
    }
  }

  useEffect(() => {
    loadPredictionsMap()
  }, [])

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Caso 12: Clasificación de Cliente por Ticket</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Tickets recientes</h3>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase"><th></th><th>ID</th><th>Fecha</th><th>Total</th><th>Pred.</th></tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={5}>Cargando...</td></tr>}
                {tickets && tickets.map((t: any) => {
                  const pred = predictionsMap[String(t.id)]
                  const icon = pred ? (
                    pred.predicted_type === 'Niño' ? '🧒' : pred.predicted_type === 'Joven' ? '🧑' : pred.predicted_type === 'Adulto' ? '👨' : pred.predicted_type === 'Empresa' ? '🏢' : '🔎'
                  ) : '🔎'
                  return (
                    <tr key={t.id} className={`cursor-pointer hover:bg-gray-50 ${selected===t.id?'bg-indigo-50':''}`} onClick={() => { setSelected(t.id); fetchPrediction(t.id); fetchTicketDetails(t.id); setModalOpen(true) }}>
                      <td className="py-1 px-2 text-center">{icon}</td>
                      <td className="py-1 px-2">{t.id}</td>
                      <td className="py-1 px-2">{new Date(t.fecha_hora).toLocaleString()}</td>
                      <td className="py-1 px-2">{Number(t.total).toLocaleString()}</td>
                      <td className="py-1 px-2">{pred ? `${pred.predicted_type} (${Number(pred.confidence).toFixed(0)}%)` : '-'}</td>
                    </tr>
                  )
                })}
            </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-2 bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Detalle y Predicción</h3>
          {!selected && <div className="p-6 text-gray-600">Selecciona un ticket para ver la predicción del tipo de cliente.</div>}
          {selected && loadingPred && <div className="p-6">Calculando predicción...</div>}
          {selected && prediction && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="text-lg font-medium">Predicción:
                  <span className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceColor(Number(prediction.confidence))}`}>
                    {prediction.predicted_type} • {Number(prediction.confidence).toFixed(0)}%
                  </span>
                </h4>
                <p className="text-sm text-gray-600 mt-2">Confianza: {Number(prediction.confidence).toFixed(2)}%</p>
                {Number(prediction.confidence) < 60 && (
                  <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-800">Predicción incierta — la confianza es baja. Considera re-entrenar o revisar etiquetas.</div>
                )}
                {Number(prediction.confidence) >= 60 && Number(prediction.confidence) < 80 && (
                  <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-800">Confianza moderada — use esta predicción como indicación, no como regla.</div>
                )}
                {Number(prediction.confidence) >= 80 && (
                  <div className="mt-2 p-2 bg-green-50 border-l-4 border-green-400 text-sm text-green-800">Alta confianza — la clasificación es fiable.</div>
                )}
                <p className="mt-2 text-sm text-gray-700">Explicación: {prediction.explanation || 'N/A'}</p>

                <div className="mt-4">
                  <h5 className="font-semibold">Motivos posibles de baja exactitud</h5>
                  <ul className="mt-2 text-sm text-gray-700 space-y-1">
                    <li>• Etiquetas creadas por heurística pueden ser ruidosas.</li>
                    <li>• Tickets muy cortos o con pocos productos aportan poca información.</li>
                    <li>• Categorías de productos inconsistentes o faltantes.</li>
                    <li>• Necesidad de más ejemplos por clase para equilibrar datos.</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <button className="bg-blue-600 text-white rounded px-3 py-1 text-sm" onClick={() => { setModalOpen(true); fetchTicketDetails(selected!) }}>Ver más detalles</button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <CircularGauge value={Number(prediction.confidence)} size={140} />
                  <div className="mt-3">
                    <PieChartSimple data={prediction.probabilities ? Object.keys(prediction.probabilities).map((k:any)=>({name:k,value:prediction.probabilities[k]*100})) : [{name:prediction.predicted_type, value:prediction.confidence},{name:'Otros',value:100-prediction.confidence}]} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Details modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Detalles ticket ${selected ?? ''}`} size="lg">
        <div>
          <h4 className="font-semibold mb-2">Productos</h4>
          {ticketDetails && ticketDetails.length > 0 ? (
            <ul className="space-y-2">
              {ticketDetails.map((d:any, i:number) => (
                <li key={i} className="flex justify-between border-b pb-1">
                  <div>
                    <div className="font-medium">{d.product_name}</div>
                    <div className="text-xs text-gray-500">Categorias: {d.categories}</div>
                  </div>
                  <div className="text-sm">x{d.cantidad}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">No se encontraron detalles del ticket.</div>
          )}
          <div className="mt-4">
            <h5 className="font-semibold">Explicación del modelo</h5>
            <p className="text-sm text-gray-700 mt-2">{prediction?.explanation || 'No hay explicación disponible.'}</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ClientesClassificationPage

// Helper: color class by confidence
function getConfidenceColor(conf: number) {
  if (conf >= 80) return 'bg-green-100 text-green-800'
  if (conf >= 60) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

// Circular gauge component
const CircularGauge: React.FC<{ value: number; size?: number }> = ({ value, size = 120 }) => {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(100, value))
  const dash = (pct / 100) * circumference
  const color = pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <filter id="gBlur"><feGaussianBlur stdDeviation="0.2" /></filter>
      </defs>
      <g transform={`translate(${size/2},${size/2})`}>
        <circle r={radius} stroke="#e6e6e6" strokeWidth={12} fill="none" />
        <circle r={radius} stroke={color} strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray={`${dash} ${circumference - dash}`} transform={`rotate(-90)`} />
        <text x="0" y="6" textAnchor="middle" fontSize={size*0.18} fontWeight={700} fill="#111">{Math.round(pct)}%</text>
      </g>
    </svg>
  )
}
