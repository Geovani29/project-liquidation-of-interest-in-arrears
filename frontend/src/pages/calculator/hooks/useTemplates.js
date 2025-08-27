import { useState, useCallback } from 'react'
import { calculationsService } from '../../../services/calculations'
import { toast } from 'sonner'

export const useTemplates = () => {
  const [templates, setTemplates] = useState([])
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false)
  const [newTemplate, setNewTemplate] = useState({ 
    name: '', 
    description: '', 
    isPublic: false 
  })

  // Cargar plantillas
  const loadTemplates = useCallback(async () => {
    try {
      const templatesData = await calculationsService.getTemplates()
      setTemplates(templatesData)
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }, [])

  // Crear plantilla
  const createTemplate = useCallback(async () => {
    if (!newTemplate.name.trim()) {
      toast.error('El nombre de la plantilla es obligatorio')
      return
    }

    try {
      await calculationsService.createTemplate(newTemplate)
      
      // Recargar plantillas
      const templatesData = await calculationsService.getTemplates()
      setTemplates(templatesData)
      
      // Limpiar formulario
      setNewTemplate({ name: '', description: '', isPublic: false })
      setShowCreateTemplateModal(false)
      
      toast.success('Plantilla creada exitosamente')
    } catch (error) {
      console.error('Error creating template:', error)
      toast.error('Error al crear la plantilla')
    }
  }, [newTemplate])

  // Usar plantilla
  const useTemplate = useCallback(async (template) => {
    try {
      const templateData = await calculationsService.useTemplate(template.id)
      
      // Cerrar modal
      setShowTemplatesModal(false)
      
      toast.success(`Plantilla "${template.name}" cargada`)
      
      return templateData
    } catch (error) {
      console.error('Error using template:', error)
      toast.error('Error al cargar la plantilla')
      return null
    }
  }, [])

  // Eliminar plantilla
  const deleteTemplate = useCallback(async (templateId) => {
    try {
      await calculationsService.deleteTemplate(templateId)
      
      // Recargar plantillas
      const templatesData = await calculationsService.getTemplates()
      setTemplates(templatesData)
      
      toast.success('Plantilla eliminada')
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Error al eliminar la plantilla')
    }
  }, [])

  // Actualizar nuevo template
  const updateNewTemplate = useCallback((field, value) => {
    setNewTemplate(prev => ({ ...prev, [field]: value }))
  }, [])

  // Limpiar nuevo template
  const clearNewTemplate = useCallback(() => {
    setNewTemplate({ name: '', description: '', isPublic: false })
  }, [])

  return {
    templates,
    showTemplatesModal,
    showCreateTemplateModal,
    newTemplate,
    setShowTemplatesModal,
    setShowCreateTemplateModal,
    loadTemplates,
    createTemplate,
    useTemplate,
    deleteTemplate,
    updateNewTemplate,
    clearNewTemplate
  }
}
