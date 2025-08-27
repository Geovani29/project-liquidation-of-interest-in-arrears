import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalculationCard } from './CalculationCard'

const LoadingSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
        </div>
        <div className="mt-4 h-10 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
      </div>
    ))}
  </div>
))

const EmptyState = memo(({ searchQuery }) => {
  const navigate = useNavigate()
  
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📊</div>
      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {searchQuery ? 'No se encontraron cálculos' : 'No hay cálculos guardados'}
      </h3>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        {searchQuery 
          ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
          : 'Aún no has guardado ningún cálculo. Crea tu primer cálculo para empezar.'
        }
      </p>
      {!searchQuery && (
        <button
          onClick={() => navigate('/app/c')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ir a la calculadora
        </button>
      )}
    </div>
  )
})

export const CalculationsList = memo(({
  loading,
  calculations,
  searchQuery,
  selectedCalculations,
  editingId,
  editingName,
  setEditingName,
  handleSelectCalculation,
  setEditingId,
  handleEdit,
  handleDuplicate,
  handleDelete,
  handleLoadCalculation,
  handleRemoveTagFromCalculation,
  tags
}) => {
  if (loading) {
    return <LoadingSkeleton />
  }

  if (calculations.length === 0) {
    return <EmptyState searchQuery={searchQuery} />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {calculations.map((calculation, index) => (
        <CalculationCard
          key={calculation.id}
          calculation={calculation}
          index={index}
          isSelected={selectedCalculations.includes(calculation.id)}
          editingId={editingId}
          editingName={editingName}
          setEditingName={setEditingName}
          handleSelectCalculation={handleSelectCalculation}
          setEditingId={setEditingId}
          handleEdit={handleEdit}
          handleDuplicate={handleDuplicate}
          handleDelete={handleDelete}
          handleLoadCalculation={handleLoadCalculation}
          handleRemoveTagFromCalculation={handleRemoveTagFromCalculation}
          tags={tags}
        />
      ))}
    </div>
  )
})
