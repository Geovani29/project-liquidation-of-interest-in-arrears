import { memo } from 'react'
import { DatePicker } from './DatePicker'

export const CalculatorForm = memo(({
  form,
  errors,
  updateField,
  handleMoneyChange,
  clearForm,
  fillExample,
  loading
}) => {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fecha Inicial */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Fecha Inicial *
          </label>
          <DatePicker
            valueDisplay={form.fechaInicial}
            onChange={(value) => updateField('fechaInicial', value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
            disabled={loading}
          />
          {errors.fechaInicial && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fechaInicial}</p>
          )}
        </div>

        {/* Fecha de Corte */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Fecha de Corte *
          </label>
          <DatePicker
            valueDisplay={form.fechaCorte}
            onChange={(value) => updateField('fechaCorte', value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
            disabled={loading}
          />
          {errors.fechaCorte && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fechaCorte}</p>
          )}
        </div>

        {/* Capital Base */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Capital Base *
          </label>
          <input
            type="text"
            value={form.capitalBase}
            onChange={(e) => handleMoneyChange('capitalBase', e.target.value)}
            placeholder="Ej: 1,000,000"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
            disabled={loading}
          />
          {errors.capitalBase && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.capitalBase}</p>
          )}
        </div>

        {/* Tasa Mensual */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Tasa Mensual (%) *
          </label>
          <input
            type="number"
            step="0.01"
            value={form.tasaMensual}
            onChange={(e) => updateField('tasaMensual', e.target.value)}
            placeholder="Ej: 2.5"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
            disabled={loading}
          />
          {errors.tasaMensual && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tasaMensual}</p>
          )}
        </div>

        {/* Fecha de Vencimiento */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Fecha de Vencimiento *
          </label>
          <DatePicker
            valueDisplay={form.fechaVencimiento}
            onChange={(value) => updateField('fechaVencimiento', value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
            disabled={loading}
          />
          {errors.fechaVencimiento && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fechaVencimiento}</p>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-3 mt-6">
        <button
          onClick={clearForm}
          disabled={loading}
          className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors disabled:opacity-50"
        >
          Limpiar
        </button>
        <button
          onClick={fillExample}
          disabled={loading}
          className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors disabled:opacity-50"
        >
          Rellenar ejemplo
        </button>
      </div>
    </div>
  )
})
