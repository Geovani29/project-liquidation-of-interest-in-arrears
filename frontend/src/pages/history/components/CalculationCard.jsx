import { memo } from 'react'
import { formatCurrency, formatDate, getCapitalFromFormData } from '../utils/formatters'
import editarIcon from '../../../assets/editar.svg'
import copiarIcon from '../../../assets/copiar.svg'
import eliminarIcon from '../../../assets/eliminar.svg'

export const CalculationCard = memo(({ 
  calculation, 
  index,
  isSelected,
  editingId,
  editingName,
  setEditingName,
  draggedCalculation,
  handleSelectCalculation,
  setEditingId,
  handleEdit,
  handleDuplicate,
  setMovingCalculationId,
  setShowMoveModal,
  handleDelete,
  handleLoadCalculation,
  handleDragStart,
  handleDragEnd,
  handleRemoveTagFromCalculation,
  tags
}) => {
  const capital = getCapitalFromFormData(calculation.form_data)

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, calculation)}
      onDragEnd={handleDragEnd}
      className={`group bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 min-h-[280px] transition-all duration-300 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 animate-fadeInUp cursor-move ${
        isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
      } ${draggedCalculation?.id === calculation.id ? 'opacity-50 scale-95' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => handleSelectCalculation(calculation.id, e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-1 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            {editingId === calculation.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleEdit(calculation.id, editingName)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEdit(calculation.id, editingName)
                  if (e.key === 'Escape') {
                    setEditingId(null)
                    setEditingName('')
                  }
                }}
                className="w-full text-lg font-semibold text-zinc-900 dark:text-zinc-100 bg-transparent border-b-2 border-blue-500 focus:outline-none"
                autoFocus
              />
            ) : (
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 break-words">
                {calculation.name}
              </h3>
            )}
          </div>
        </div>

        <div className={`flex items-center gap-1 ml-3 flex-shrink-0 transition-opacity duration-200 ${
          editingId === calculation.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <button
            onClick={() => {
              if (editingId === calculation.id) {
                handleEdit(calculation.id, editingName)
              } else {
                setEditingId(calculation.id)
                setEditingName(calculation.name)
              }
            }}
            className={`p-2 rounded-full transition-colors cursor-pointer shadow-sm border ${
              editingId === calculation.id
                ? 'bg-blue-100 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500'
                : 'bg-white dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
            title={editingId === calculation.id ? "Confirmar edición" : "Editar nombre"}
          >
            {editingId === calculation.id ? (
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <img src={editarIcon} alt="Editar" className="w-4 h-4" />
            )}
          </button>
          
          {editingId === calculation.id && (
            <button
              onClick={() => {
                setEditingId(null)
                setEditingName('')
              }}
              className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer bg-white dark:bg-zinc-700 shadow-sm border border-red-200 dark:border-red-600"
              title="Cancelar edición"
            >
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          
          <button
            onClick={() => handleDuplicate(calculation.id)}
            className={`p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer bg-white dark:bg-zinc-700 shadow-sm border border-zinc-200 dark:border-zinc-600 ${
              editingId === calculation.id ? 'opacity-50 pointer-events-none' : ''
            }`}
            title="Duplicar"
            disabled={editingId === calculation.id}
          >
            <img src={copiarIcon} alt="Duplicar" className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setMovingCalculationId(calculation.id)
              setShowMoveModal(true)
            }}
            className={`p-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer bg-white dark:bg-zinc-700 shadow-sm border border-zinc-200 dark:border-zinc-600 ${
              editingId === calculation.id ? 'opacity-50 pointer-events-none' : ''
            }`}
            title="Mover a carpeta"
            disabled={editingId === calculation.id}
          >
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
            </svg>
          </button>
          <button
            onClick={() => handleDelete(calculation.id)}
            className={`p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer bg-white dark:bg-zinc-700 shadow-sm border border-zinc-200 dark:border-zinc-600 ${
              editingId === calculation.id ? 'opacity-50 pointer-events-none' : ''
            }`}
            title="Eliminar"
            disabled={editingId === calculation.id}
          >
            <img src={eliminarIcon} alt="Eliminar" className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        <div className="flex justify-between">
          <span>Capital:</span>
          <span className="font-medium">{formatCurrency(capital)}</span>
        </div>
        <div className="flex justify-between">
          <span>Creado:</span>
          <span>{formatDate(calculation.created_at)}</span>
        </div>
        {calculation.folder && (
          <div className="flex justify-between">
            <span>Carpeta:</span>
            <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded text-xs flex items-center gap-1">
              📁 {calculation.folder.name}
            </span>
          </div>
        )}
        {calculation.calculation_tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {calculation.calculation_tags.map((tagRelation) => (
              <span
                key={tagRelation.tags.id}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded group/tag hover:bg-opacity-30 transition-all cursor-pointer"
                style={{
                  backgroundColor: tagRelation.tags.color + '20',
                  color: tagRelation.tags.color
                }}
              >
                {tagRelation.tags.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveTagFromCalculation(calculation.id, tagRelation.tags.id, tags)
                  }}
                  className="opacity-0 group-hover/tag:opacity-100 text-xs hover:bg-red-500 hover:text-white w-4 h-4 rounded-full flex items-center justify-center transition-all ml-1"
                  title="Eliminar etiqueta"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => handleLoadCalculation(calculation)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors cursor-pointer"
      >
        Cargar en calculadora
      </button>
    </div>
  )
})
