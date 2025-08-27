import { useState, useCallback } from 'react'
import { api } from '../../../api/client'
import { calculationsService } from '../../../services/calculations'
import { validateBusinessRules } from '../utils'
import { toast } from 'sonner'

export const useCalculatorResults = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Cargar resultados guardados
  const loadResults = useCallback(async () => {
    try {
      const resultData = await calculationsService.loadResults()
      if (resultData) {
        setData(resultData)
      }
    } catch (error) {
      console.error('Error loading results:', error)
    }
  }, [])

  // Calcular intereses
  const calculate = useCallback(async (form) => {
    setLoading(true)
    setError('')

    try {
      // Validar reglas de negocio
      const validationError = validateBusinessRules(form)
      if (validationError) {
        setError(validationError)
        return null
      }

      // Realizar cálculo
      const { data: result } = await api.post('/api/calculate', {
        fecha_inicial: form.fechaInicial,
        fecha_corte: form.fechaCorte,
        capital_base: form.capitalBase,
        tasa_mensual: form.tasaMensual,
        fecha_vencimiento: form.fechaVencimiento,
      })

      setData(result)
      
      // Guardar resultados
      await calculationsService.saveResults(result)
      
      toast.success('Cálculo realizado exitosamente')
      return result

    } catch (error) {
      console.error('Error calculating:', error)
      const errorMessage = error.response?.data?.error || 'Error al realizar el cálculo'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Exportar a Excel
  const exportToExcel = useCallback(async (form) => {
    if (!data) {
      toast.error('No hay datos para exportar')
      return
    }

    try {
      const res = await api.post('/api/export', {
        fecha_inicial: form.fechaInicial,
        fecha_corte: form.fechaCorte,
        capital_base: form.capitalBase,
        tasa_mensual: form.tasaMensual,
        fecha_vencimiento: form.fechaVencimiento,
      }, { responseType: 'blob' })

      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      const disp = res.headers['content-disposition']
      const match = /filename="?([^";]+)"?/i.exec(disp)
      const filename = match ? match[1] : 'liquidacion_intereses.xlsx'
      
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Archivo exportado exitosamente')
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('Error al exportar el archivo')
    }
  }, [data])

  // Limpiar resultados
  const clearResults = useCallback(() => {
    setData(null)
    setError('')
  }, [])

  return {
    data,
    loading,
    error,
    setError,
    loadResults,
    calculate,
    exportToExcel,
    clearResults
  }
}
