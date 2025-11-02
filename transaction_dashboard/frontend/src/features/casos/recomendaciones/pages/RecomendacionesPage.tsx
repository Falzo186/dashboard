import React, { useState } from 'react'
import useTopCombos from '../hooks/useRecomendaciones'
import useTopProducts from '../hooks/useTopProducts'
import apiClient from '../../../../services/api/client'

// Horizontal Bar Chart for associations
const HorizontalBarChart: React.FC<{ rows: { productName: string; confidence: number }[] }> = ({ rows }) => {
  const max = rows.reduce((m, r) => Math.max(m, Number(r.confidence || 0)), 0) || 1
  return (
    <div className="p-2">
      <div className="space-y-2">
        {rows.map((r, i) => {
          const w = Math.max(2, (Number(r.confidence || 0) / max) * 100)
          return (
            <div key={i} className="flex items-center">
              <div className="w-48 text-sm text-gray-700 pr-2">{r.productName}</div>
              <div className="flex-1 bg-gray-100 rounded overflow-hidden h-6">
                <div className="h-6 bg-blue-600" style={{ width: `${w}%` }}></div>
              </div>
              <div className="w-24 text-right text-sm pl-3">{Number(r.confidence).toFixed(2)}%</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const RecomendacionesPage: React.FC = () => {
  const { data: topProductsData } = useTopProducts(20)
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [associations, setAssociations] = useState<any[] | null>(null)
  const [loadingAssociations, setLoadingAssociations] = useState(false)
  const [assocError, setAssocError] = useState<string | null>(null)

  // top combos hook kept for quick access if needed (not auto-fetched)
  const topCombosQuery = useTopCombos(90, 50)
  const selectedProductName = topProductsData?.find((p: any) => Number(p.producto_id) === Number(selectedProduct))?.product_name || ''

  // keep existing loading state for initial page
  if (topCombosQuery.isLoading && !selectedProduct) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Generando recomendaciones...</p>
      </div>
    </div>
  )
  if (topCombosQuery.isError) {
    const err: any = topCombosQuery.error || {}
    const details = err?.response?.data || err?.message || err
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800">Error al obtener recomendaciones</h3>
          <p className="text-red-700">Revisa que el backend esté disponible y vuelve a intentarlo.</p>
          <div className="mt-4 text-sm text-gray-800">
            <strong>Detalles:</strong>
            <pre className="whitespace-pre-wrap mt-2 text-xs bg-white p-2 rounded border">{JSON.stringify(details, null, 2)}</pre>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            <span className="block text-blue-700">Caso 11:</span>
            <span className="block text-gray-900">Sistema de Recomendación — Canasta de Mercado</span>
          </h1>
          <p className="text-gray-600">Reglas de asociación (pares frecuentes) — descubre productos que se compran juntos.</p>
        </div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Actualizar</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left selector: Top products list */}
        <div className="col-span-1 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Productos Principales</h3>
          <div className="overflow-auto max-h-96">
            <ul>
              {topProductsData?.map((p: any) => (
                <li key={p.producto_id} className={`py-2 px-3 border-b border-gray-100 cursor-pointer ${Number(selectedProduct) === Number(p.producto_id) ? 'bg-indigo-50' : ''}`} onClick={async () => {
                  setAssocError(null)
                  setAssociations(null)
                  setSelectedProduct(Number(p.producto_id))
                  setLoadingAssociations(true)
                  try {
                    // fetch broader set of combos and filter client-side
                    const resp = await apiClient.get(`/casos/recomendaciones/canasta/top-combos?days=90&limit=2000`)
                    const rows = resp.data && resp.data.data ? resp.data.data : resp.data
                    // filter and aggregate associations for selected product
                    const assocMap = new Map<number, any>()
                    rows.forEach((r: any) => {
                      if (r.productAId === Number(p.producto_id) || r.productBId === Number(p.producto_id)) {
                        const otherId = r.productAId === Number(p.producto_id) ? r.productBId : r.productAId
                        const otherName = r.productAId === Number(p.producto_id) ? r.productBName : r.productAName
                        const confidence = r.productAId === Number(p.producto_id) ? r.confidenceAtoB : r.confidenceBtoA
                        if (!assocMap.has(otherId)) {
                          assocMap.set(otherId, { productId: otherId, productName: otherName, pairCount: 0, confidence: 0 })
                        }
                        const cur = assocMap.get(otherId)
                        cur.pairCount += Number(r.pairCount || 0)
                        cur.confidence = Math.max(cur.confidence, Number(confidence || 0))
                      }
                    })
                    const assocArr = Array.from(assocMap.values()).sort((a, b) => b.confidence - a.confidence)
                    setAssociations(assocArr)
                  } catch (err: any) {
                    setAssocError(err?.message || 'Error')
                  } finally {
                    setLoadingAssociations(false)
                  }
                }}>{p.product_name}</li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-gray-500 mt-3">Selecciona un producto para ver productos comprados frecuentemente con él.</p>
        </div>

        {/* Right panel: associations table + visual + insights */}
        <div className="col-span-2 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Productos Comprados Frecuentemente</h3>

          {!selectedProduct && (
            <div className="p-6 text-gray-600">Haz clic en un producto a la izquierda para explorar sus asociaciones.</div>
          )}

          {selectedProduct && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="overflow-auto max-h-96">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase">
                        <th className="py-2 px-3">Producto Asociado</th>
                        <th className="py-2 px-3">Compras Juntas</th>
                        <th className="py-2 px-3">Probabilidad de Compra (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingAssociations && <tr><td colSpan={3} className="p-4 text-gray-600">Cargando asociaciones...</td></tr>}
                      {assocError && <tr><td colSpan={3} className="p-4 text-red-600">{assocError}</td></tr>}
                      {associations && associations.map((a: any, idx: number) => (
                        <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => {/* could show row-level insight */}}>
                          <td className="py-2 px-3">{a.productName}</td>
                          <td className="py-2 px-3">{a.pairCount.toLocaleString()}</td>
                          <td className="py-2 px-3">{Number(a.confidence).toFixed(2)}%</td>
                        </tr>
                      ))}
                      {!loadingAssociations && associations && associations.length === 0 && <tr><td colSpan={3} className="p-4 text-gray-600">No se encontraron asociaciones para este producto en el rango seleccionado.</td></tr>}
                    </tbody>
                  </table>
                </div>

                <div>
                  <div className="bg-white p-2 rounded">
                    {associations && associations.length > 0 ? (
                      <HorizontalBarChart rows={associations.slice(0, 12).map((a:any) => ({ productName: a.productName, confidence: Number(a.confidence) }))} />
                    ) : (
                      <div className="p-6 text-gray-500">Selecciona un producto para ver las asociaciones en formato de barras.</div>
                    )}
                  </div>

                  {/* Insight box */}
                  <div className="mt-4 bg-gray-50 border border-gray-100 p-4 rounded">
                    <h4 className="font-semibold">Interpretación &amp; Acción</h4>
                    {!associations && <p className="text-sm text-gray-600">Selecciona un producto para ver recomendaciones accionables.</p>}
                    {associations && associations.length > 0 && (
                      <div className="text-sm text-gray-700">
                        <p>💡 Oportunidad de Combo:</p>
                        <p className="mt-2">El producto asociado con mayor probabilidad es <strong>{associations[0].productName}</strong> — <strong>{Number(associations[0].confidence).toFixed(2)}%</strong> de las veces que alguien compra el producto seleccionado también compra este.</p>
                        <p className="mt-2"><strong>Recomendación:</strong> Crear una promoción cruzada o ubicar <em>{associations[0].productName}</em> cerca del producto seleccionado.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3">Interpretación</h3>
        {!selectedProduct && (
          <p className="text-gray-700">Cada fila muestra un par de productos que se vendieron juntos en la ventana seleccionada. <strong>Probabilidad de Compra (%)</strong> indica, del total de transacciones que contienen el producto seleccionado, qué porcentaje también incluye el producto asociado — por ejemplo: "El 65% de los clientes que compran Yogurt Griego también compran Granola Natural".</p>
        )}
        {selectedProduct && (!associations || associations.length === 0) && (
          <p className="text-gray-700">Has seleccionado <strong>{selectedProductName || 'un producto'}</strong>. No hay asociaciones suficientes en la ventana seleccionada para mostrar recomendaciones accionables.</p>
        )}
        {selectedProduct && associations && associations.length > 0 && (
          <div>
            <p className="text-gray-700">Para <strong>{selectedProductName}</strong>, el producto con mayor probabilidad de compra conjunta es <strong>{associations[0].productName}</strong> — <strong>{Number(associations[0].confidence).toFixed(2)}%</strong> de las veces que alguien compra <strong>{selectedProductName}</strong> también compra <strong>{associations[0].productName}</strong> (veces juntas: <strong>{associations[0].pairCount.toLocaleString()}</strong>).</p>
            <p className="mt-3 text-gray-700"><strong>Acción sugerida:</strong> crear una promoción cruzada o ubicar <em>{associations[0].productName}</em> cerca de <em>{selectedProductName}</em>. Si quieres, selecciona otra fila para ver recomendaciones alternativas.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecomendacionesPage
