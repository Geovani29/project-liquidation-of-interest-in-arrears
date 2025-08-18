import { supabase } from '../api/supabase'

// Estrategia de almacenamiento: Supabase → localStorage → error
// localStorage siempre actúa como caché local y backup

// Claves para localStorage
const CALC_FORM_KEY = 'calc_form_v1'
const CALC_RESULT_KEY = 'calc_result_v1'
const CALC_SIDEBAR_KEY = 'calc_sidebar_collapsed'

/**
 * Servicio híbrido para manejar cálculos
 * Prioriza Supabase pero mantiene localStorage como fallback
 */
export class CalculationsService {
  constructor() {
    this.userId = null
    this.isOnline = navigator.onLine
    
    // Detectar cambios de conectividad
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncPendingChanges()
    })
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  // Configurar el usuario actual
  setUser(userId) {
    this.userId = userId
  }

  // ===============================
  // GESTIÓN DE DATOS DE FORMULARIO
  // ===============================

  // Guardar datos del formulario
  async saveFormData(formData) {
    try {
      // Siempre guardar en localStorage primero (respuesta inmediata)
      localStorage.setItem(CALC_FORM_KEY, JSON.stringify(formData))

      // Si tenemos usuario y conexión, también guardar en Supabase
      if (this.userId && this.isOnline) {
        await this.saveToSupabase('form_data', formData)
      }

      return true
    } catch (error) {
      console.error('Error saving form data:', error)
      return false
    }
  }

  // Cargar datos del formulario
  async loadFormData() {
    try {
      let formData = null

      // Si tenemos usuario y conexión, intentar cargar desde Supabase
      if (this.userId && this.isOnline) {
        try {
          formData = await this.loadFromSupabase('form_data')
        } catch (error) {
          console.warn('Error loading from Supabase, using localStorage:', error)
        }
      }

      // Si no tenemos datos de Supabase, usar localStorage
      if (!formData) {
        const stored = localStorage.getItem(CALC_FORM_KEY)
        formData = stored ? JSON.parse(stored) : null
      } else {
        // Si cargamos de Supabase, sincronizar con localStorage
        localStorage.setItem(CALC_FORM_KEY, JSON.stringify(formData))
      }

      return formData
    } catch (error) {
      console.error('Error loading form data:', error)
      return null
    }
  }

  // ===============================
  // GESTIÓN DE RESULTADOS
  // ===============================

  // Guardar resultados del cálculo
  async saveResults(resultData, formData = null) {
    try {
      // Siempre guardar en localStorage
      localStorage.setItem(CALC_RESULT_KEY, JSON.stringify(resultData))

      // Si tenemos usuario y conexión, también guardar en Supabase
      if (this.userId && this.isOnline) {
        const dataToSave = {
          result_data: resultData,
          ...(formData && { form_data: formData })
        }
        await this.saveToSupabase('calculation_result', dataToSave)
      }

      return true
    } catch (error) {
      console.error('Error saving results:', error)
      return false
    }
  }

  // Cargar resultados del cálculo
  async loadResults() {
    try {
      let resultData = null

      // Si tenemos usuario y conexión, intentar cargar desde Supabase
      if (this.userId && this.isOnline) {
        try {
          const data = await this.loadFromSupabase('calculation_result')
          resultData = data?.result_data
        } catch (error) {
          console.warn('Error loading results from Supabase, using localStorage:', error)
        }
      }

      // Si no tenemos datos de Supabase, usar localStorage
      if (!resultData) {
        const stored = localStorage.getItem(CALC_RESULT_KEY)
        resultData = stored ? JSON.parse(stored) : null
      } else {
        // Si cargamos de Supabase, sincronizar con localStorage
        localStorage.setItem(CALC_RESULT_KEY, JSON.stringify(resultData))
      }

      return resultData
    } catch (error) {
      console.error('Error loading results:', error)
      return null
    }
  }

  // ===============================
  // GESTIÓN DE ESTADO UI
  // ===============================

  // Guardar estado del sidebar
  saveSidebarState(collapsed) {
    localStorage.setItem(CALC_SIDEBAR_KEY, JSON.stringify(collapsed))
  }

  // Cargar estado del sidebar
  loadSidebarState() {
    const stored = localStorage.getItem(CALC_SIDEBAR_KEY)
    return stored ? JSON.parse(stored) : false
  }

  // ===============================
  // LIMPIEZA DE DATOS
  // ===============================

  // Limpiar todos los datos (logout)
  async clearAll() {
    try {
      // Limpiar localStorage
      localStorage.removeItem(CALC_FORM_KEY)
      localStorage.removeItem(CALC_RESULT_KEY)
      // No limpiar sidebar state en logout

      // Si tenemos usuario, limpiar datos temporales en Supabase
      if (this.userId && this.isOnline) {
        try {
          await this.clearTemporaryData()
        } catch (error) {
          console.warn('Error clearing Supabase data:', error)
        }
      }

      return true
    } catch (error) {
      console.error('Error clearing data:', error)
      return false
    }
  }

  // Limpiar solo formulario y resultados (botón limpiar)
  async clearCalculation() {
    try {
      // Limpiar localStorage
      localStorage.removeItem(CALC_FORM_KEY)
      localStorage.removeItem(CALC_RESULT_KEY)

      // Si tenemos usuario, limpiar datos temporales en Supabase
      if (this.userId && this.isOnline) {
        try {
          await this.clearTemporaryData()
        } catch (error) {
          console.warn('Error clearing Supabase calculation:', error)
        }
      }

      return true
    } catch (error) {
      console.error('Error clearing calculation:', error)
      return false
    }
  }

  // ===============================
  // MÉTODOS INTERNOS SUPABASE
  // ===============================

  // Guardar en Supabase (datos temporales del usuario actual)
  async saveToSupabase(type, data) {
    if (!this.userId) return

    const record = {
      user_id: this.userId,
      name: `temp_${type}_${Date.now()}`,
      form_data: type.includes('form') ? data : (data.form_data || {}),
      result_data: type.includes('result') ? (data.result_data || data) : null,
      is_template: false,
      is_public: false
    }

    // Primero, limpiar datos temporales anteriores del mismo tipo
    await this.clearTemporaryData(type)

    // Insertar nuevo registro
    const { error } = await supabase
      .from('calculations')
      .insert([record])

    if (error) throw error
  }

  // Cargar desde Supabase (datos temporales más recientes)
  async loadFromSupabase(type) {
    if (!this.userId) return null

    const { data, error } = await supabase
      .from('calculations')
      .select('*')
      .eq('user_id', this.userId)
      .like('name', `temp_${type}_%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data
  }

  // Limpiar datos temporales
  async clearTemporaryData(specificType = null) {
    if (!this.userId) return

    let query = supabase
      .from('calculations')
      .delete()
      .eq('user_id', this.userId)

    if (specificType) {
      query = query.like('name', `temp_${specificType}_%`)
    } else {
      query = query.like('name', 'temp_%')
    }

    const { error } = await query

    if (error) {
      console.warn('Error clearing temporary data:', error)
    }
  }

  // Sincronizar cambios pendientes cuando se recupera la conexión
  async syncPendingChanges() {
    if (!this.userId || !this.isOnline) return

    try {
      // Sincronizar datos del formulario si existen
      const formData = localStorage.getItem(CALC_FORM_KEY)
      if (formData) {
        await this.saveToSupabase('form_data', JSON.parse(formData))
      }

      // Sincronizar resultados si existen
      const resultData = localStorage.getItem(CALC_RESULT_KEY)
      if (resultData) {
        const formDataParsed = formData ? JSON.parse(formData) : {}
        await this.saveToSupabase('calculation_result', {
          result_data: JSON.parse(resultData),
          form_data: formDataParsed
        })
      }

      console.log('Datos sincronizados con Supabase')
    } catch (error) {
      console.error('Error syncing pending changes:', error)
    }
  }

  // ===============================
  // MIGRACIÓN AUTOMÁTICA
  // ===============================

  // Migrar datos existentes de localStorage a Supabase
  async migrateExistingData() {
    if (!this.userId || !this.isOnline) return

    try {
      const formData = localStorage.getItem(CALC_FORM_KEY)
      const resultData = localStorage.getItem(CALC_RESULT_KEY)

      if (formData || resultData) {
        console.log('Migrando datos existentes a Supabase...')

        if (formData && resultData) {
          // Si tenemos ambos, crear un cálculo completo
          await this.saveToSupabase('calculation_result', {
            form_data: JSON.parse(formData),
            result_data: JSON.parse(resultData)
          })
        } else if (formData) {
          // Solo datos del formulario
          await this.saveToSupabase('form_data', JSON.parse(formData))
        }

        console.log('Migración completada')
      }
    } catch (error) {
      console.error('Error during migration:', error)
    }
  }

  // ===============================
  // ESTADO DEL SERVICIO
  // ===============================

  // Obtener estado del servicio
  getStatus() {
    return {
      hasUser: !!this.userId,
      isOnline: this.isOnline,
      canSync: !!(this.userId && this.isOnline)
    }
  }
}

// Instancia singleton del servicio
export const calculationsService = new CalculationsService()
