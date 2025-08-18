import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { SessionProvider, useSession } from './auth/SessionContext.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import Calculator from './pages/Calculator.jsx'
import HistoryAdvanced from './pages/HistoryAdvanced.jsx'
import Analytics from './pages/Analytics.jsx'
import Home from './pages/Home.jsx'

function ProtectedRoute({ children }) {
  const { accessToken } = useSession()
  const location = useLocation()
  
  if (!accessToken) {
    // Mapear rutas viejas a nuevas para el redirect
    const routeMap = {
      '/interes-mora': '/app/c',
      '/historial': '/app/h',
      '/analytics': '/app/a'
    }
    
    const redirectPath = routeMap[location.pathname] || location.pathname
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectPath)}`} replace />
  }
  return children
}

/*
🔐 Mapeo de rutas ofuscadas:
/app/c → Calculadora (interes-mora)
/app/h → Historial  
/app/a → Analytics
*/

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app/c" element={<ProtectedRoute><Calculator /></ProtectedRoute>} />
          <Route path="/app/h" element={<ProtectedRoute><HistoryAdvanced /></ProtectedRoute>} />
          <Route path="/app/a" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          {/* Rutas de compatibilidad (redirect a las nuevas) */}
          <Route path="/interes-mora" element={<Navigate to="/app/c" replace />} />
          <Route path="/historial" element={<Navigate to="/app/h" replace />} />
          <Route path="/analytics" element={<Navigate to="/app/a" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  )
}
