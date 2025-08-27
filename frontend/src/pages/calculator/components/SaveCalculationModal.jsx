import { memo } from 'react'

export const SaveCalculationModal = memo(({
  showSaveDialog,
  saveName,
  setSaveName,
  saveCalculation,
  cancelSave,
  form,
  data
}) => {
  if (!showSaveDialog) return null

  const handleSave = () => {
    saveCalculation(form, data)
  }

  return (
    <div className="fixed inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md mx-4 animate-scaleIn shadow-2xl">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Guardar Cálculo
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Nombre del cálculo
            </label>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Ej: Liquidación Crédito Hipotecario"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
              autoFocus
            />
          </div>
          
          <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <strong>Resumen:</strong> Capital de {form.capitalBase}, {form.periodos?.length || 0} períodos calculados
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={cancelSave}
            className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
})
