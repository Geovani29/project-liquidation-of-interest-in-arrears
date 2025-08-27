import { useState } from 'react'
import { calculationsService } from '../../../services/calculations'
import { toast } from 'sonner'

export const useTags = (setTags, setCalculations, loadCalculations) => {
  // Estados para modales
  const [showCreateTag, setShowCreateTag] = useState(false)

  // Estados para nuevos elementos
  const [newTag, setNewTag] = useState({ name: '', color: '#3B82F6', isPublic: false })

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

    // Estados de nuevos elementos
    newTag,
    setNewTag,

    // Funciones
    handleCreateTag,
    handleRemoveTagFromCalculation
  }
}
