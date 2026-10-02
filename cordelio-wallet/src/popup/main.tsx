import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/global.scss'
import { Popup } from './Popup.tsx'
import './Popup.scss'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
)
