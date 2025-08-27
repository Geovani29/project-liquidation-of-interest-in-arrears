import { useState } from 'react'
import { calculationsService } from '../../../services/calculations'
import { toast } from 'sonner'

export const useDragAndDrop = (folders, setCalculations, refreshAllData, viewingFolder, loadFolderCalculations) => {
  const [draggedCalculation, setDraggedCalculation] = useState(null)
  const [dragOverFolder, setDragOverFolder] = useState(null)

  const handleDragStart = (e, calculation) => {
    setDraggedCalculation(calculation)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
  }

  const handleDragEnd = () => {
    setDraggedCalculation(null)
    setDragOverFolder(null)
  }

  const handleDragOver = (e, folderId = null) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverFolder(folderId)
  }

  const handleDragLeave = () => {
    setDragOverFolder(null)
  }

  const handleDrop = async (e, folderId = null) => {
    e.preventDefault()
    
    if (!draggedCalculation) return
    
    // No hacer nada si se suelta en la misma carpeta
    const targetFolderId = folderId === '' ? null : folderId
    if (draggedCalculation.folder_id === targetFolderId) {
      setDraggedCalculation(null)
      setDragOverFolder(null)
      return
    }

    try {
      await calculationsService.moveCalculationToFolder(draggedCalculation.id, targetFolderId)
      
      // Actualizar estado local
      setCalculations(prev => 
        prev.map(calc => 
          calc.id === draggedCalculation.id 
            ? { 
                ...calc, 
                folder_id: targetFolderId,
                folder: targetFolderId ? folders.find(f => f.id === targetFolderId) : null
              } 
            : calc
        )
      )

      const targetName = targetFolderId ? folders.find(f => f.id === targetFolderId)?.name : 'Rama principal'
      toast.success('Cálculo movido', {
        description: `"${draggedCalculation.name}" se movió a "${targetName}".`
      })

      // Refrescar datos para asegurar sincronización
      if (viewingFolder) {
        await loadFolderCalculations(viewingFolder)
      } else {
        await refreshAllData()
      }
      
    } catch (error) {
      console.error('Error moving calculation:', error)
      toast.error('Error al mover cálculo')
    } finally {
      setDraggedCalculation(null)
      setDragOverFolder(null)
    }
  }

  return {
    draggedCalculation,
    dragOverFolder,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop
  }
}
