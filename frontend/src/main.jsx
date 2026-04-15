import React from 'react'
import ReactDOM from 'react-dom/client'
import Desktop from './components/Desktop'
import ErrorBoundary from './components/ErrorBoundary'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary scope="root">
      <Desktop />
    </ErrorBoundary>
  </React.StrictMode>
)
