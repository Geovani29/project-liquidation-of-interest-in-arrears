export const FilterPanel = ({
  filters,
  setFilters,
  resetFilters,
  setShowFilters
}) => {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Filtro por fecha desde */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Desde
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
          />
        </div>

        {/* Filtro por fecha hasta */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Hasta
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
          />
        </div>

        {/* Filtro por capital mínimo */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Capital mínimo
          </label>
          <input
            type="number"
            value={filters.capitalMin}
            onChange={(e) => setFilters(prev => ({ ...prev, capitalMin: e.target.value }))}
            placeholder="Ej: 1000000"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
          />
        </div>

        {/* Filtro por capital máximo */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Capital máximo
          </label>
          <input
            type="number"
            value={filters.capitalMax}
            onChange={(e) => setFilters(prev => ({ ...prev, capitalMax: e.target.value }))}
            placeholder="Ej: 10000000"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
          />
        </div>

        {/* Ordenamiento */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Ordenar por
          </label>
          <div className="flex gap-2">
            <select
              value={filters.orderBy}
              onChange={(e) => setFilters(prev => ({ ...prev, orderBy: e.target.value }))}
              className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
            >
              <option value="created_at">Fecha</option>
              <option value="name">Nombre</option>
              <option value="capital_amount">Capital</option>
            </select>
            <select
              value={filters.orderDirection}
              onChange={(e) => setFilters(prev => ({ ...prev, orderDirection: e.target.value }))}
              className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={resetFilters}
          className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          Limpiar filtros
        </button>
        <button
          onClick={() => setShowFilters(false)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}
