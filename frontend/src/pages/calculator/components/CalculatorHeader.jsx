import { memo } from 'react'
import { Link } from 'react-router-dom'
import perfilIcon from '../../../assets/perfil.svg'
import historialIcon from '../../../assets/historial.svg'

export const CalculatorHeader = memo(({ 
  user, 
  logout, 
  showUserDropdown, 
  setShowUserDropdown, 
  userDropdownRef,
  handleLogout 
}) => {
  return (
    <header className="bg-white dark:bg-zinc-800 shadow-sm border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Roble API
            </Link>
            <span className="text-zinc-400 dark:text-zinc-500">|</span>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Calculadora de Intereses
            </h1>
          </div>

          {/* Navegación y usuario */}
          <div className="flex items-center gap-4">
            {/* Enlace al historial */}
            <Link
              to="/app/h"
              className="flex items-center gap-2 px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <img src={historialIcon} alt="Historial" className="w-5 h-5" />
              <span className="hidden sm:inline">Historial</span>
            </Link>

            {/* Dropdown de usuario */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <img src={perfilIcon} alt="Perfil" className="w-5 h-5" />
                <span className="hidden sm:inline">{user?.email || 'Usuario'}</span>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 z-50">
                  <div className="px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-700">
                    {user?.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
})
