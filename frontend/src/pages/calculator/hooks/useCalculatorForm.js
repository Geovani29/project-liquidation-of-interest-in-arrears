import { useState, useCallback } from 'react'
import { calculationsService } from '../../../services/calculations'
import { formatCurrencyInput, parseCurrencyInput } from '../utils'

export const useCalculatorForm = () => {
  const [form, setForm] = useState({
    fechaInicial: '',
    fechaCorte: '',
    capitalBase: '',
    tasaMensual: '',
    fechaVencimiento: '',
  })

  const [errors, setErrors] = useState({})

  // Cargar datos del formulario
  const loadFormData = useCallback(async () => {
    try {
      const formData = await calculationsService.loadFormData()
      if (formData) {
        setForm(formData)
      }
    } catch (error) {
      console.error('Error loading form data:', error)
    }
  }, [])

  // Guardar datos del formulario
  const saveFormData = useCallback(async () => {
    try {
      await calculationsService.saveFormData(form)
    } catch (error) {
      console.error('Error saving form data:', error)
    }
  }, [form])

  // Actualizar campo del formulario
  const updateField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  // Manejar cambio de campo de moneda
  const handleMoneyChange = useCallback((field, value) => {
    const raw = value
    const digits = String(raw || '').replace(/[^0-9]/g, '')
    const formatted = digits ? new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Number(digits)) : ''
    updateField(field, formatted)
  }, [updateField])

  // Limpiar formulario
  const clearForm = useCallback(() => {
    setForm({
      fechaInicial: '',
      fechaCorte: '',
      capitalBase: '',
      tasaMensual: '',
      fechaVencimiento: '',
    })
    setErrors({})
  }, [])

  // Rellenar con ejemplo
  const fillExample = useCallback(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const exampleForm = {
      fechaInicial: '01/01/2024',
      fechaCorte: '31/01/2024',
      capitalBase: '1,000,000',
      tasaMensual: '2.5',
      fechaVencimiento: '31/12/2024',
    }
    
    setForm(exampleForm)
    setErrors({})
  }, [])

  // Cargar desde historial
  const loadFromHistory = useCallback((calculation) => {
    if (calculation.form_data) {
      setForm(calculation.form_data)
      setErrors({})
    }
  }, [])

  return {
    form,
    errors,
    setErrors,
    loadFormData,
    saveFormData,
    updateField,
    handleMoneyChange,
    clearForm,
    fillExample,
    loadFromHistory
  }
}
