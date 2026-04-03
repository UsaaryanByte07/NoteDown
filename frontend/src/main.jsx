import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ThemeProvider } from './context/themeContext'
import { AuthProvider } from './context/auth/authContext'
import App from './App.jsx'

// ThemeProvider must wrap everything — it applies .dark to <html> before
// any component renders, preventing a flash of the wrong theme.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
