import { useState } from 'react'
import { calculationsService } from '../../../services/calculations'
import { toast } from 'sonner'

export const useFoldersAndTags = (setFolders, setTags, setCalculations, loadCalculations) => {
  // Estados para modales
  const [showCreateTag, setShowCreateTag] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [movingCalculationId, setMovingCalculationId] = useState(null)

  // Estados para edición
  const [editingFolderId, setEditingFolderId] = useState(null)
  const [editingFolderName, setEditingFolderName] = useState('')

  // Estados para nuevos elementos
  const [newTag, setNewTag] = useState({ name: '', color: '#3B82F6', isPublic: false })
  const [newFolder, setNewFolder] = useState({ name: '', parentId: null })

  // Crear etiqueta
  const handleCreateTag = async (e) => {
    e.preventDefault()
    if (!newTag.name.trim()) return

    try {
      const tag = await calculationsService.createTag(
        newTag.name,
        newTag.color,
        newTag.isPublic
      )
      setTags(prev => [...prev, tag])
      setNewTag({ name: '', color: '#3B82F6', isPublic: false })
      setShowCreateTag(false)
      toast.success('Etiqueta creada', {
        description: `La etiqueta "${tag.name}" se creó correctamente.`
      })
    } catch (error) {
      console.error('Error creating tag:', error)
      toast.error('Error al crear etiqueta', {
        description: 'No se pudo crear la etiqueta. Inténtalo de nuevo.'
      })
    }
  }

  // Crear carpeta
  const handleCreateFolder = async (e) => {
    e.preventDefault()
    if (!newFolder.name.trim()) return

    try {
      const folder = await calculationsService.createFolder(
        newFolder.name,
        newFolder.parentId || null
      )
      setFolders(prev => [...prev, folder])
      setNewFolder({ name: '', parentId: null })
      setShowCreateFolder(false)
      toast.success('Carpeta creada', {
        description: `La carpeta "${folder.name}" se creó correctamente.`
      })
    } catch (error) {
      console.error('Error creating folder:', error)
      toast.error('Error al crear carpeta', {
        description: 'No se pudo crear la carpeta. Inténtalo de nuevo.'
      })
    }
  }

  // Editar nombre de carpeta
  const handleEditFolder = async (folderId, newName) => {
    if (!newName.trim()) return

    try {
      await calculationsService.updateFolder(folderId, { name: newName.trim() })
      setFolders(prev => 
        prev.map(folder => 
          folder.id === folderId ? { ...folder, name: newName.trim() } : folder
        )
      )
      setEditingFolderId(null)
      setEditingFolderName('')
      toast.success('Carpeta actualizada', {
        description: 'El nombre de la carpeta se actualizó correctamente.'
      })
    } catch (error) {
      console.error('Error updating folder:', error)
      toast.error('Error al actualizar carpeta')
    }
  }

  // Eliminar carpeta
  const handleDeleteFolder = async (folderId, folders, calculations) => {
    const folder = folders.find(f => f.id === folderId)
    if (!folder) return

    // Contar cálculos en esta carpeta
    const calculationsInFolder = calculations.filter(calc => calc.folder_id === folderId).length

    let confirmMessage
    if (calculationsInFolder === 0) {
      confirmMessage = `¿Eliminar la carpeta "${folder.name}"?\n\nLa carpeta está vacía y se eliminará permanentemente.`
    } else {
      confirmMessage = `¿Eliminar la carpeta "${folder.name}"?\n\nEsta carpeta contiene ${calculationsInFolder} cálculo(s) guardado(s).\nAl eliminar la carpeta, los cálculos se moverán a "Sin carpeta".`
    }

    if (!confirm(confirmMessage)) return

    try {
      await calculationsService.deleteFolder(folderId)
      
      // Actualizar la lista de carpetas
      setFolders(prev => prev.filter(f => f.id !== folderId))
      
      // Actualizar los cálculos localmente - mover a "Sin carpeta"
      setCalculations(prev => 
        prev.map(calc => 
          calc.folder_id === folderId 
            ? { ...calc, folder_id: null, folder: null }
            : calc
        )
      )
      
      // Recargar completamente los datos para asegurar sincronización
      await loadCalculations()
      
      if (calculationsInFolder === 0) {
        toast.success('Carpeta eliminada', {
          description: `La carpeta "${folder.name}" se eliminó correctamente.`
        })
      } else {
        toast.success('Carpeta eliminada', {
          description: `La carpeta "${folder.name}" se eliminó y sus ${calculationsInFolder} cálculo(s) se movieron a "Sin carpeta".`
        })
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
      toast.error('Error al eliminar carpeta')
    }
  }

  // Mover cálculo a carpeta
  const handleMoveCalculation = async (calculationId, targetFolderId, folders) => {
    try {
      await calculationsService.moveCalculationToFolder(
        calculationId, 
        targetFolderId === 'none' ? null : targetFolderId
      )
      
      // Actualizar el cálculo localmente
      setCalculations(prev => 
        prev.map(calc => 
          calc.id === calculationId 
            ? { 
                ...calc, 
                folder_id: targetFolderId === 'none' ? null : targetFolderId,
                folder: targetFolderId === 'none' ? null : folders.find(f => f.id === targetFolderId)
              } 
            : calc
        )
      )
      
      setShowMoveModal(false)
      setMovingCalculationId(null)
      
      const targetName = targetFolderId === 'none' ? 'Sin carpeta' : folders.find(f => f.id === targetFolderId)?.name
      
      // Recargar datos para asegurar sincronización
      await loadCalculations()
      
      toast.success('Cálculo movido', {
        description: `El cálculo se movió a "${targetName}".`
      })
    } catch (error) {
      console.error('Error moving calculation:', error)
      toast.error('Error al mover cálculo')
      
      // En caso de error, recargar para restaurar estado correcto
      await loadCalculations()
    }
  }

  // Eliminar etiqueta de cálculo
  const handleRemoveTagFromCalculation = async (calculationId, tagId, tags) => {
    try {
      await calculationsService.removeTagFromCalculation(calculationId, tagId)
      
      // Actualizar estado local
      setCalculations(prev => 
        prev.map(calc => 
          calc.id === calculationId 
            ? {
                ...calc,
                calculation_tags: calc.calculation_tags.filter(ct => ct.tag_id !== tagId)
              }
            : calc
        )
      )

      const tag = tags.find(t => t.id === tagId)
      toast.success('Etiqueta eliminada', {
        description: `La etiqueta "${tag?.name}" se eliminó del cálculo.`
      })
      
    } catch (error) {
      console.error('Error removing tag from calculation:', error)
      toast.error('Error al eliminar etiqueta')
    }
  }

  return {
    // Estados de modales
    showCreateTag,
    setShowCreateTag,
    showCreateFolder,
    setShowCreateFolder,
    showMoveModal,
    setShowMoveModal,
    movingCalculationId,
    setMovingCalculationId,

    // Estados de edición
    editingFolderId,
    setEditingFolderId,
    editingFolderName,
    setEditingFolderName,

    // Estados de nuevos elementos
    newTag,
    setNewTag,
    newFolder,
    setNewFolder,

    // Funciones
    handleCreateTag,
    handleCreateFolder,
    handleEditFolder,
    handleDeleteFolder,
    handleMoveCalculation,
    handleRemoveTagFromCalculation
  }
}
