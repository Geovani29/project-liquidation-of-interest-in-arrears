import { memo, useRef, useEffect, useState } from 'react'
import { formatCurrency } from '../utils'

export const CalculatorResults = memo(({ data, loading }) => {
  const tableWrapRef = useRef(null)
  const [tableScrolled, setTableScrolled] = useState(false)

  // Manejar scroll de la tabla
  useEffect(() => {
    const el = tableWrapRef.current
    if (!el) return

    const onScroll = () => setTableScrolled(el.scrollTop > 0)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data || !data.periodos) {
    return null
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
      {/* Header de la tabla */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Detalle por Períodos
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          {data.periodos.length} períodos calculados
        </p>
      </div>

      {/* Tabla de resultados */}
      <div 
        ref={tableWrapRef}
        className="overflow-x-auto max-h-96"
      >
        <table className="w-full">
          <thead className={`bg-zinc-50 dark:bg-zinc-700/50 sticky top-0 ${tableScrolled ? 'shadow-sm' : ''}`}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Período
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Fecha Inicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Fecha Fin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Días
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Capital
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Tasa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Intereses
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
            {data.periodos.map((periodo, index) => (
              <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                  {periodo.fecha_inicio}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                  {periodo.fecha_fin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                  {periodo.dias}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                  {formatCurrency(periodo.capital)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                  {periodo.tasa}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(periodo.intereses)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-700/50 border-t border-zinc-200 dark:border-zinc-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Capital Base</p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(data.capital_base)}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Intereses</p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(data.total_intereses)}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Total a Pagar</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {formatCurrency(data.total_a_pagar)}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Períodos</p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {data.periodos.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})
