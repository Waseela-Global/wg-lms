import React from 'react'
import ReactDOM from 'react-dom/client'
import { FrappeProvider } from 'frappe-react-sdk'
import App from './App'
import './index.css'

const root = ReactDOM.createRoot( document.getElementById( 'root' ) )

root.render(
  <React.StrictMode>
    <FrappeProvider
      url={window.location.origin}
      socketPort={undefined}
      enableSocket={false}
      siteName={window.frappe?.boot?.site_name || window.site_name}
    >
      <App />
    </FrappeProvider>
  </React.StrictMode>
)

