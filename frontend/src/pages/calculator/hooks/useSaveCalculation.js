import { useState, useCallback } from 'react'
import { calculationsService } from '../../../services/calculations'
import { formatCurrency } from '../utils'
import { toast } from 'sonner'

export const useSaveCalculation = () => {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saved, setSaved] = useState('')

  // Generar nombre por defecto
  const generateDefaultName = useCallback((form) => {
    const capital = form.capitalBase ? formatCurrency(Number(String(form.capitalBase).replace(/[^0-9]/g, ''))) : ''
    return `Liquidación ${capital} - ${new Date().toLocaleDateString()}`
  }, [])

  // Abrir diálogo de guardado
  const openSaveDialog = useCallback((form) => {
    const defaultName = generateDefaultName(form)
    setSaveName(defaultName)
    setShowSaveDialog(true)
  }, [generateDefaultName])

  // Cerrar diálogo de guardado
  const closeSaveDialog = useCallback(() => {
    setShowSaveDialog(false)
    setSaveName('')
  }, [])

  // Guardar cálculo
  const saveCalculation = useCallback(async (form, data) => {
    if (!saveName.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }

    try {
      await calculationsService.saveCalculation({
        name: saveName,
        form_data: form,
        result_data: data
      })

      setSaved(saveName)
      closeSaveDialog()
      toast.success('Cálculo guardado exitosamente')
    } catch (error) {
      console.error('Error saving calculation:', error)
      toast.error('Error al guardar el cálculo')
    }
  }, [saveName, closeSaveDialog])

  // Cancelar guardado
  const cancelSave = useCallback(() => {
    closeSaveDialog()
  }, [closeSaveDialog])

  return {
    showSaveDialog,
    saveName,
    saved,
    setSaveName,
    openSaveDialog,
    closeSaveDialog,
    saveCalculation,
    cancelSave
  }
}
