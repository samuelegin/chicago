import React from 'react'
import ReactDOM from 'react-dom/client'

// Import mock API interceptor FIRST (comment out when using real backend)
import '@/lib/mockApiInterceptor'

import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('Service Worker registration failed:', error);
      });
  });
}
