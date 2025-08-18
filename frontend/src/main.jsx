import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster 
      richColors 
      position="top-center" 
      expand={true}
      closeButton={true}
      duration={4000}
      toastOptions={{
        style: {
          background: 'white',
          border: '1px solid rgb(228, 228, 231)',
          fontSize: '14px',
          padding: '12px 16px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        },
        className: 'custom-toast'
      }}
    />
    <App />
  </StrictMode>,
)
