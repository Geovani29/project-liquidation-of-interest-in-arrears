import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { SessionProvider, useSession } from './auth/SessionContext.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import Calculator from './pages/Calculator.jsx'
import Home from './pages/Home.jsx'

function ProtectedRoute({ children }) {
  const { accessToken } = useSession()
  const location = useLocation()
  if (!accessToken) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  return children
}

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interes-mora" element={<ProtectedRoute><Calculator /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  )
}
