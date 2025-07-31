import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'  // ← Simple CSS instead of SCSS
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
