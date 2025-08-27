import { useEffect, useRef, useState } from 'react'
import { useSession } from '../auth/SessionContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

// Hooks personalizados
import {
  useCalculatorForm,
  useCalculatorResults,
  useTemplates,
  useSaveCalculation,
  useSyncStatus
} from './calculator/hooks'

// Componentes
import {
  CalculatorHeader,
  CalculatorForm,
  CalculatorActions,
  CalculatorResults,
  SaveCalculationModal,
  TemplatesModal,
  CreateTemplateModal
} from './calculator/components'

export default function Calculator() {
  const { logout, user, supabaseUserId } = useSession()
  const navigate = useNavigate()
  const userDropdownRef = useRef(null)

  // Hooks personalizados
  const {
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
  } = useCalculatorForm()

  const {
    data,
    loading,
    error,
    setError,
    loadResults,
    calculate,
    exportToExcel,
    clearResults
  } = useCalculatorResults()

  const {
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
  } = useTemplates()

  const {
    showSaveDialog,
    saveName,
    saved,
    setSaveName,
    openSaveDialog,
    closeSaveDialog,
    saveCalculation,
    cancelSave
  } = useSaveCalculation()

  const {
    syncStatus,
    updateSyncStatus
  } = useSyncStatus()

  // Estados globales
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          loadFormData(),
          loadResults(),
          loadTemplates()
        ])
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    }

    loadInitialData()
  }, [loadFormData, loadResults, loadTemplates])

  // Cargar cálculo desde historial
  useEffect(() => {
    const loadFromHistoryData = () => {
      try {
        const stored = localStorage.getItem('load_calculation')
        if (stored) {
          const calculation = JSON.parse(stored)
          loadFromHistory(calculation)
          localStorage.removeItem('load_calculation')
          toast.success(`Cálculo "${calculation.name}" cargado`)
        }
      } catch (error) {
        console.error('Error loading calculation from history:', error)
        localStorage.removeItem('load_calculation')
      }
    }

    loadFromHistoryData()
  }, [loadFromHistory])

  // Cerrar dropdown de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  // Manejar logout
  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada')
    navigate('/')
  }

  // Manejar uso de plantilla
  const handleUseTemplate = async (template) => {
    const templateData = await useTemplate(template)
    if (templateData) {
      loadFromHistory(templateData)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <CalculatorHeader
        user={user}
        logout={logout}
        showUserDropdown={showUserDropdown}
        setShowUserDropdown={setShowUserDropdown}
        userDropdownRef={userDropdownRef}
        handleLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Formulario */}
        <CalculatorForm
          form={form}
          errors={errors}
          updateField={updateField}
          handleMoneyChange={handleMoneyChange}
          clearForm={clearForm}
          fillExample={fillExample}
          loading={loading}
        />

        {/* Acciones */}
        <CalculatorActions
          form={form}
          data={data}
          loading={loading}
          error={error}
          calculate={calculate}
          exportToExcel={exportToExcel}
          openSaveDialog={openSaveDialog}
          setShowTemplatesModal={setShowTemplatesModal}
          syncStatus={syncStatus}
        />

        {/* Resultados */}
        {data && (
          <CalculatorResults
            data={data}
            loading={loading}
          />
        )}
      </div>

      {/* Modales */}
      <SaveCalculationModal
        showSaveDialog={showSaveDialog}
        saveName={saveName}
        setSaveName={setSaveName}
        saveCalculation={saveCalculation}
        cancelSave={cancelSave}
        form={form}
        data={data}
      />

      <TemplatesModal
        showTemplatesModal={showTemplatesModal}
        setShowTemplatesModal={setShowTemplatesModal}
        templates={templates}
        useTemplate={handleUseTemplate}
        deleteTemplate={deleteTemplate}
        setShowCreateTemplateModal={setShowCreateTemplateModal}
      />

      <CreateTemplateModal
        showCreateTemplateModal={showCreateTemplateModal}
        setShowCreateTemplateModal={setShowCreateTemplateModal}
        newTemplate={newTemplate}
        updateNewTemplate={updateNewTemplate}
        createTemplate={createTemplate}
        clearNewTemplate={clearNewTemplate}
      />
    </div>
  )
}
