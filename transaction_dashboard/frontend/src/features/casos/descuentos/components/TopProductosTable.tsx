import type { ProductoConDescuento } from '../types';

interface Props {
  data: ProductoConDescuento[];
}

export const TopProductosTable = ({ data }: Props) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Top Productos con Descuento</h3>
        <div className="text-gray-500 text-center py-8">No hay datos</div>
      </div>
    );
  }

  const formatNumber = (value: string) => parseInt(value).toLocaleString();
  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return `$${num.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Top {data.length} Productos con Más Descuentos</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Veces</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Promedio</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((producto, index) => (
              <tr key={producto.producto_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{producto.product_name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{producto.categories}</td>
                <td className="px-4 py-3 text-sm text-right text-blue-600 font-semibold">{formatNumber(producto.veces_con_descuento)}</td>
                <td className="px-4 py-3 text-sm text-right text-green-600">{formatCurrency(producto.descuento_promedio)}</td>
                <td className="px-4 py-3 text-sm text-right text-purple-600 font-semibold">{formatCurrency(producto.descuento_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};