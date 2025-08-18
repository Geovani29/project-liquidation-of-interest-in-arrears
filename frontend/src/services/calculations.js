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
  async setUser(userId) {
    this.userId = userId
    console.log('🔧 CalculationsService user set:', userId)
    
    // Establecer contexto de usuario en Supabase para RLS
    if (userId) {
      try {
        console.log('🚀 Calling set_current_user_context with:', userId)
        const { data, error } = await supabase.rpc('set_current_user_context', {
          p_user_id: userId
        })
        
        if (error) {
          console.error('❌ Error setting user context for RLS:', error)
          console.error('Error details:', error.message, error.code, error.details)
        } else {
          console.log('✅ User context set for RLS:', userId)
          console.log('✅ RPC response data:', data)
        }
      } catch (error) {
        console.error('❌ Exception calling set_current_user_context:', error)
        console.error('Exception details:', error.message)
      }
    } else {
      console.log('⚠️ No userId provided to setUser')
    }
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
  // GESTIÓN DE CÁLCULOS GUARDADOS
  // ===============================

  // Guardar un cálculo permanentemente con nombre
  async saveCalculation(name, formData, resultData) {
    if (!this.userId) {
      throw new Error('Usuario no autenticado')
    }

    // Establecer contexto antes de cualquier operación DB
    try {
      console.log('🔄 Re-setting user context before save:', this.userId)
      const { error: contextError } = await supabase.rpc('set_current_user_context', {
        p_user_id: this.userId
      })
      if (contextError) {
        console.error('❌ Failed to set context before save:', contextError)
      }
    } catch (error) {
      console.error('❌ Exception setting context before save:', error)
    }

    try {
      // Extraer información del form_data para las nuevas columnas
      let capitalAmount = null
      let interestRate = null
      
      if (formData && typeof formData === 'object') {
        // Extraer capital
        if (formData.capitalBase) {
          const cleanCapital = String(formData.capitalBase).replace(/[.,]/g, '')
          capitalAmount = parseInt(cleanCapital) || null
        }
        
        // Extraer tasa de interés
        if (formData.tasaMensual) {
          interestRate = parseFloat(formData.tasaMensual) || null
        }
      }

      const record = {
        user_id: this.userId,
        name: name.trim() || `Cálculo ${new Date().toLocaleDateString()}`,
        form_data: formData,
        result_data: resultData,
        capital_amount: capitalAmount,
        interest_rate: interestRate,
        is_template: false,
        is_public: false
      }

      const { data, error } = await supabase
        .from('calculations')
        .insert([record])
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error saving calculation:', error)
      throw error
    }
  }

  // Obtener lista de cálculos guardados del usuario
  async getCalculations(limit = 50, offset = 0) {
    if (!this.userId) {
      return { data: [], count: 0 }
    }

    try {
      // Obtener cálculos no temporales
      const { data, error, count } = await supabase
        .from('calculations')
        .select('*', { count: 'exact' })
        .eq('user_id', this.userId)
        .not('name', 'like', 'temp_%')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return { data: data || [], count: count || 0 }
    } catch (error) {
      console.error('Error getting calculations:', error)
      return { data: [], count: 0 }
    }
  }

  // Obtener un cálculo específico por ID
  async getCalculation(id) {
    if (!this.userId) {
      throw new Error('Usuario no autenticado')
    }

    try {
      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('id', id)
        .eq('user_id', this.userId) // Seguridad: solo cálculos del usuario
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error getting calculation:', error)
      throw error
    }
  }

  // Actualizar nombre de un cálculo
  async updateCalculationName(id, newName) {
    if (!this.userId) {
      throw new Error('Usuario no autenticado')
    }

    try {
      const { data, error } = await supabase
        .from('calculations')
        .update({ name: newName.trim() })
        .eq('id', id)
        .eq('user_id', this.userId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error updating calculation name:', error)
      throw error
    }
  }

  // Duplicar un cálculo
  async duplicateCalculation(id, newName = null) {
    if (!this.userId) {
      throw new Error('Usuario no autenticado')
    }

    try {
      // Obtener el cálculo original
      const original = await this.getCalculation(id)
      
      // Crear copia con el nuevo nombre
      const duplicateName = newName || `${original.name} (copia)`
      
      // Usar saveCalculation que ya maneja las nuevas columnas
      return await this.saveCalculation(duplicateName, original.form_data, original.result_data)
    } catch (error) {
      console.error('Error duplicating calculation:', error)
      throw error
    }
  }

  // Eliminar un cálculo
  async deleteCalculation(id) {
    if (!this.userId) {
      throw new Error('Usuario no autenticado')
    }

    try {
      const { error } = await supabase
        .from('calculations')
        .delete()
        .eq('id', id)
        .eq('user_id', this.userId) // Seguridad: solo cálculos del usuario

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error deleting calculation:', error)
      throw error
    }
  }

  // Buscar cálculos por nombre
  async searchCalculations(query, limit = 20) {
    if (!this.userId || !query.trim()) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('user_id', this.userId)
        .not('name', 'like', 'temp_%')
        .ilike('name', `%${query.trim()}%`)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error searching calculations:', error)
      return []
    }
  }

  // ===============================
  // GESTIÓN DE ETIQUETAS (TAGS)
  // ===============================

  // Crear una nueva etiqueta
  async createTag(name, color = '#3B82F6', isPublic = false) {
    if (!this.userId) throw new Error('Usuario no autenticado')

    try {
      // Asegurar contexto RLS
      if (this.userId) {
        await supabase.rpc('set_current_user_context', {
          p_user_id: this.userId
        })
      }
      
      const { data, error } = await supabase
        .from('tags')
        .insert([{
          user_id: this.userId,
          name: name.trim(),
          color,
          is_public: isPublic
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating tag:', error)
      throw error
    }
  }

  // Obtener todas las etiquetas del usuario
  async getTags() {
    if (!this.userId) return []

    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', this.userId)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting tags:', error)
      return []
    }
  }

  // Actualizar una etiqueta
  async updateTag(id, updates) {
    if (!this.userId) throw new Error('Usuario no autenticado')

    try {
      const { data, error } = await supabase
        .from('tags')
        .update(updates)
        .eq('id', id)
        .eq('user_id', this.userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating tag:', error)
      throw error
    }
  }

  // Eliminar una etiqueta
  async deleteTag(id) {
    if (!this.userId) throw new Error('Usuario no autenticado')

    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)
        .eq('user_id', this.userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting tag:', error)
      throw error
    }
  }

  // Agregar etiqueta a un cálculo
  async addTagToCalculation(calculationId, tagId) {
    if (!this.userId) throw new Error('Usuario no autenticado')

    try {
      const { data, error } = await supabase
        .from('calculation_tags')
        .insert([{
          calculation_id: calculationId,
          tag_id: tagId
        }])
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding tag to calculation:', error)
      throw error
    }
  }

  // Remover etiqueta de un cálculo
  async removeTagFromCalculation(calculationId, tagId) {
    if (!this.userId) throw new Error('Usuario no autenticado')

    try {
      const { error } = await supabase
        .from('calculation_tags')
        .delete()
        .eq('calculation_id', calculationId)
        .eq('tag_id', tagId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing tag from calculation:', error)
      throw error
    }
  }

  // Obtener etiquetas de un cálculo
  async getCalculationTags(calculationId) {
    if (!this.userId) return []

    try {
      const { data, error } = await supabase
        .from('calculation_tags')
        .select(`
          tag_id,
          tags (
            id,
            name,
            color,
            description
          )
        `)
        .eq('calculation_id', calculationId)

      if (error) throw error
      return data?.map(item => item.tags) || []
    } catch (error) {
      console.error('Error getting calculation tags:', error)
      return []
    }
  }

  // ===============================
  // GESTIÓN DE CARPETAS
  // ===============================

  // Crear una nueva carpeta
  async createFolder(name, parentId = null) {
    if (!this.userId) throw new Error('Usuario no autenticado')

    try {
      // Asegurar contexto RLS
      if (this.userId) {
        await supabase.rpc('set_current_user_context', {
          p_user_id: this.userId
        })
      }
      
      const { data, error } = await supabase
        .from('folders')
        .insert([{
          user_id: this.userId,
          name: name.trim(),
          parent_id: parentId
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating folder:', error)
      throw error
    }
  }

  // Obtener todas las carpetas del usuario
  async getFolders() {
    if (!this.userId) return []

    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', this.userId)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting folders:', error)
      return []
    }
  }

  // Actualizar una carpeta
  async updateFolder(id, updates) {
    if (!this.userId) throw new Error('Usuario no autenticado')

    try {
      const { data, error } = await supabase
        .from('folders')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', this.userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating folder:', error)
      throw error
    }
  }

  // Eliminar una carpeta
  async deleteFolder(id) {
    if (!this.userId) throw new Error('Usuario no autenticado')

    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)
        .eq('user_id', this.userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting folder:', error)
      throw error
    }
  }

  // Mover cálculo a una carpeta
  async moveCalculationToFolder(calculationId, folderId) {
    if (!this.userId) throw new Error('Usuario no autenticado')

    try {
      const { data, error } = await supabase
        .from('calculations')
        .update({ folder_id: folderId })
        .eq('id', calculationId)
        .eq('user_id', this.userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error moving calculation to folder:', error)
      throw error
    }
  }

  // ===============================
  // GESTIÓN DE PLANTILLAS
  // ===============================

  // Crear una nueva plantilla
  async createTemplate(name, description, formData, isPublic = false) {
    if (!this.userId) throw new Error('Usuario no autenticado')

    try {
      const { data, error } = await supabase
        .from('templates')
        .insert([{
          user_id: this.userId,
          name: name.trim(),
          description: description.trim(),
          form_data: formData,
          is_public: isPublic
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating template:', error)
      throw error
    }
  }

  // Obtener plantillas del usuario y públicas
  async getTemplates() {
    if (!this.userId) return []

    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .or(`user_id.eq.${this.userId},is_public.eq.true`)
        .order('usage_count', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting templates:', error)
      return []
    }
  }

  // Usar una plantilla (incrementar contador)
  async useTemplate(id) {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      // Incrementar contador de uso
      await supabase
        .from('templates')
        .update({ usage_count: (data.usage_count || 0) + 1 })
        .eq('id', id)

      return data
    } catch (error) {
      console.error('Error using template:', error)
      throw error
    }
  }

  // Eliminar plantilla
  async deleteTemplate(id) {
    if (!this.userId) throw new Error('Usuario no autenticado')

    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id)
        .eq('user_id', this.userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting template:', error)
      throw error
    }
  }

  // ===============================
  // BÚSQUEDA Y FILTROS AVANZADOS
  // ===============================

  // Búsqueda avanzada de cálculos
  async searchCalculationsAdvanced(filters = {}) {
    if (!this.userId) return { data: [], count: 0 }

    try {
      let query = supabase
        .from('calculations')
        .select(`
          *,
          folder:folders(id, name),
          calculation_tags(
            tags(id, name, color)
          )
        `, { count: 'exact' })
        .eq('user_id', this.userId)
        .not('name', 'like', 'temp_%')

      // Filtro por texto
      if (filters.query) {
        query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)
      }

      // Filtro por carpeta
      if (filters.folderId) {
        if (filters.folderId === 'none') {
          query = query.is('folder_id', null)
        } else {
          query = query.eq('folder_id', filters.folderId)
        }
      }

      // Filtro por rango de fechas
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      // Filtro por rango de capital
      if (filters.capitalMin) {
        query = query.gte('capital_amount', filters.capitalMin)
      }
      if (filters.capitalMax) {
        query = query.lte('capital_amount', filters.capitalMax)
      }

      // Filtro por tasa de interés
      if (filters.rateMin) {
        query = query.gte('interest_rate', filters.rateMin)
      }
      if (filters.rateMax) {
        query = query.lte('interest_rate', filters.rateMax)
      }

      // Ordenamiento
      const orderBy = filters.orderBy || 'created_at'
      const ascending = filters.orderDirection === 'asc'
      query = query.order(orderBy, { ascending })

      // Paginación
      const limit = filters.limit || 50
      const offset = filters.offset || 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      return { data: data || [], count: count || 0 }
    } catch (error) {
      console.error('Error in advanced search:', error)
      return { data: [], count: 0 }
    }
  }

  // Filtrar por etiquetas
  async getCalculationsByTags(tagIds, limit = 50) {
    if (!this.userId || !tagIds.length) return []

    try {
      const { data, error } = await supabase
        .from('calculation_tags')
        .select(`
          calculation_id,
          calculations(
            *,
            folder:folders(id, name),
            calculation_tags(
              tags(id, name, color)
            )
          )
        `)
        .in('tag_id', tagIds)
        .limit(limit)

      if (error) throw error

      // Eliminar duplicados y extraer cálculos
      const uniqueCalculations = []
      const seen = new Set()

      data?.forEach(item => {
        if (item.calculations && !seen.has(item.calculations.id)) {
          seen.add(item.calculations.id)
          uniqueCalculations.push(item.calculations)
        }
      })

      return uniqueCalculations
    } catch (error) {
      console.error('Error getting calculations by tags:', error)
      return []
    }
  }

  // ===============================
  // ESTADÍSTICAS Y ANALYTICS
  // ===============================

  // Obtener estadísticas del usuario
  async getUserStatistics() {
    if (!this.userId) return null

    try {
      const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', this.userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting user statistics:', error)
      return null
    }
  }

  // Obtener estadísticas por período
  async getStatisticsByPeriod(period = 'month') {
    if (!this.userId) return []

    try {
      let dateFormat
      switch (period) {
        case 'day':
          dateFormat = 'YYYY-MM-DD'
          break
        case 'week':
          dateFormat = 'YYYY-"W"WW'
          break
        case 'month':
          dateFormat = 'YYYY-MM'
          break
        case 'year':
          dateFormat = 'YYYY'
          break
        default:
          dateFormat = 'YYYY-MM'
      }

      const { data, error } = await supabase
        .rpc('get_calculations_by_period', {
          p_user_id: this.userId,
          p_date_format: dateFormat
        })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting statistics by period:', error)
      return []
    }
  }

  // ===============================
  // ACCIONES EN LOTE
  // ===============================

  // Eliminar múltiples cálculos
  async deleteCalculationsInBatch(calculationIds) {
    if (!this.userId || !calculationIds.length) return false

    try {
      const { error } = await supabase
        .from('calculations')
        .delete()
        .in('id', calculationIds)
        .eq('user_id', this.userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting calculations in batch:', error)
      throw error
    }
  }

  // Mover múltiples cálculos a una carpeta
  async moveCalculationsToFolderInBatch(calculationIds, folderId) {
    if (!this.userId || !calculationIds.length) return false

    try {
      const { error } = await supabase
        .from('calculations')
        .update({ folder_id: folderId })
        .in('id', calculationIds)
        .eq('user_id', this.userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error moving calculations to folder in batch:', error)
      throw error
    }
  }

  // Agregar etiqueta a múltiples cálculos
  async addTagToCalculationsInBatch(calculationIds, tagId) {
    if (!this.userId || !calculationIds.length) return false

    try {
      const insertData = calculationIds.map(calcId => ({
        calculation_id: calcId,
        tag_id: tagId
      }))

      const { error } = await supabase
        .from('calculation_tags')
        .insert(insertData)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error adding tag to calculations in batch:', error)
      throw error
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
