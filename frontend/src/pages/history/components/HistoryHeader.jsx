import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import perfilIcon from '../../../assets/perfil.svg'
import historialIcon from '../../../assets/historial.svg'

export const HistoryHeader = ({ 
  user, 
  logout, 
  totalCount, 
  showUserDropdown, 
  setShowUserDropdown 
}) => {
  const navigate = useNavigate()
  const userDropdownRef = useRef(null)

  // Función para manejar el botón regresar
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [setShowUserDropdown])

  return (
    <div className="bg-white dark:bg-zinc-800 shadow-sm border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Historial de Cálculos ({totalCount})
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="bg-zinc-600 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
            >
              ← Regresar
            </button>
            
            {/* Dropdown de usuario */}
            <div className="relative" ref={userDropdownRef}>
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 animate-scaleIn"
              >
                {user?.email?.charAt(0).toUpperCase()}
              </button>
              
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 z-50 animate-scaleIn">
                  <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-700">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Sesión iniciada como:</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {user?.email}
                    </p>
                  </div>
                  
                  <button className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2">
                    <img src={perfilIcon} alt="Perfil" className="w-4 h-4" />
                    Perfil
                  </button>
                  
                  <button 
                    onClick={() => navigate('/app/c')}
                    className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2"
                  >
                    <img src={historialIcon} alt="Calculadora" className="w-4 h-4" />
                    Calculadora
                  </button>
                  
                  <button 
                    onClick={() => navigate('/app/a')}
                    className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2"
                  >
                    📊 Analytics
                  </button>
                  
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
