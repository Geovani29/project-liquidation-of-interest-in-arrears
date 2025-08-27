import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { calculationsService } from '../../../services/calculations'
import { toast } from 'sonner'

export const useCalculationActions = (loadCalculations, setCalculations) => {
  const navigate = useNavigate()
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [selectedCalculations, setSelectedCalculations] = useState([])

  // Editar nombre de cálculo
  const handleEdit = async (id, newName) => {
    try {
      await calculationsService.updateCalculationName(id, newName)
      setCalculations(prev => 
        prev.map(calc => 
          calc.id === id ? { ...calc, name: newName } : calc
        )
      )
      setEditingId(null)
      setEditingName('')
      toast.success('Nombre actualizado', {
        description: 'El nombre del cálculo se actualizó correctamente.'
      })
    } catch (error) {
      console.error('Error updating name:', error)
      toast.error('Error al actualizar nombre')
    }
  }

  // Duplicar cálculo
  const handleDuplicate = async (id) => {
    try {
      await calculationsService.duplicateCalculation(id)
      loadCalculations()
      toast.success('Cálculo duplicado', {
        description: 'El cálculo se duplicó correctamente.'
      })
    } catch (error) {
      console.error('Error duplicating:', error)
      toast.error('Error al duplicar cálculo')
    }
  }

  // Eliminar cálculo
  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este cálculo?')) return

    try {
      await calculationsService.deleteCalculation(id)
      setCalculations(prev => prev.filter(calc => calc.id !== id))
      toast.success('Cálculo eliminado', {
        description: 'El cálculo se eliminó correctamente.'
      })
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Error al eliminar cálculo')
    }
  }

  // Cargar cálculo en la calculadora
  const handleLoadCalculation = (calculation) => {
    localStorage.setItem('load_calculation', JSON.stringify(calculation))
    navigate('/app/c')
    toast.success('Cálculo cargado', {
      description: 'Los datos se cargaron en la calculadora.',
      action: {
        label: 'Ir a calculadora',
        onClick: () => navigate('/app/c')
      }
    })
  }

  // Manejar selección múltiple
  const handleSelectCalculation = (id, checked) => {
    if (checked) {
      setSelectedCalculations(prev => [...prev, id])
    } else {
      setSelectedCalculations(prev => prev.filter(calcId => calcId !== id))
    }
  }

  const handleSelectAll = (checked, calculations) => {
    if (checked) {
      setSelectedCalculations(calculations.map(calc => calc.id))
    } else {
      setSelectedCalculations([])
    }
  }

  // Acciones en lote
  const handleBatchDelete = async () => {
    if (!selectedCalculations.length) return

    if (!confirm(`¿Eliminar ${selectedCalculations.length} cálculos seleccionados?`)) return

    try {
      await calculationsService.deleteCalculationsInBatch(selectedCalculations)
      setSelectedCalculations([])
      loadCalculations()
      toast.success('Cálculos eliminados', {
        description: `Se eliminaron ${selectedCalculations.length} cálculos correctamente.`
      })
    } catch (error) {
      console.error('Error deleting calculations:', error)
      toast.error('Error al eliminar cálculos')
    }
  }

  const handleBatchAddTag = async (tagId) => {
    if (!selectedCalculations.length) return

    try {
      await calculationsService.addTagToCalculationsInBatch(selectedCalculations, tagId)
      setSelectedCalculations([])
      loadCalculations()
      toast.success('Etiqueta agregada', {
        description: `Se agregó la etiqueta a ${selectedCalculations.length} cálculos.`
      })
    } catch (error) {
      console.error('Error adding tag:', error)
      toast.error('Error al agregar etiqueta')
    }
  }

  return {
    editingId,
    setEditingId,
    editingName,
    setEditingName,
    selectedCalculations,
    setSelectedCalculations,
    handleEdit,
    handleDuplicate,
    handleDelete,
    handleLoadCalculation,
    handleSelectCalculation,
    handleSelectAll,
    handleBatchDelete,
    handleBatchAddTag
  }
}
