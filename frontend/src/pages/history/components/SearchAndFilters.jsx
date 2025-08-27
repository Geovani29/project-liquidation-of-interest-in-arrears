export const SearchAndFilters = ({
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  setShowCreateTag,
  calculations,
  selectedCalculations,
  handleSelectAll
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar cálculos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
              showFilters 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
          >
            🔍 Filtros
          </button>
          <button
            onClick={() => setShowCreateTag(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
          >
            + Etiqueta
          </button>
        </div>
      </div>

      {calculations.length > 0 && (
        <div className="mt-4 flex items-center gap-4">
          <input
            type="checkbox"
            checked={selectedCalculations.length === calculations.length}
            onChange={(e) => handleSelectAll(e.target.checked, calculations)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Seleccionar todos
          </span>
        </div>
      )}
    </div>
  )
}
