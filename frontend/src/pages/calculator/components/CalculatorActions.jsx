import { memo } from 'react'
import { formatCurrency } from '../utils'

export const CalculatorActions = memo(({
  form,
  data,
  loading,
  error,
  calculate,
  exportToExcel,
  openSaveDialog,
  setShowTemplatesModal,
  syncStatus
}) => {
  const handleCalculate = () => {
    calculate(form)
  }

  const handleExport = () => {
    exportToExcel(form)
  }

  const handleSave = () => {
    openSaveDialog(form)
  }

  const handleTemplates = () => {
    setShowTemplatesModal(true)
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* Botón principal de cálculo */}
        <button
          onClick={handleCalculate}
          disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Calculando...' : 'Calcular Intereses'}
        </button>

        {/* Botones secundarios */}
        <div className="flex flex-wrap gap-3">
          {data && (
            <>
              <button
                onClick={handleExport}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Exportar Excel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Guardar
              </button>
            </>
          )}
          
          <button
            onClick={handleTemplates}
            disabled={loading}
            className="px-4 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            Plantillas
          </button>
        </div>

        {/* Indicador de sincronización */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            syncStatus === 'synced' ? 'bg-green-500' :
            syncStatus === 'syncing' ? 'bg-yellow-500' :
            syncStatus === 'error' ? 'bg-red-500' :
            syncStatus === 'offline' ? 'bg-gray-500' :
            'bg-gray-300'
          }`} />
          <span className="text-zinc-600 dark:text-zinc-400">
            {syncStatus === 'synced' ? 'Sincronizado' :
             syncStatus === 'syncing' ? 'Sincronizando...' :
             syncStatus === 'error' ? 'Error de sincronización' :
             syncStatus === 'offline' ? 'Sin conexión' :
             'Sin sincronizar'}
          </span>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Resumen de datos si hay resultados */}
      {data && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Resumen del cálculo:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700 dark:text-blue-300">Capital:</span>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                {formatCurrency(data.capital_base)}
              </p>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Intereses:</span>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                {formatCurrency(data.total_intereses)}
              </p>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Total:</span>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                {formatCurrency(data.total_a_pagar)}
              </p>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Períodos:</span>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                {data.periodos?.length || 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
