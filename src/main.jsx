import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from 'next-themes'

// Import mock API interceptor FIRST (comment out when using real backend)
import '@/lib/mockApiInterceptor'

import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <App />
  </ThemeProvider>
)

// Register the service worker only in production builds.
// In development the SW causes aggressive caching and stale UI — avoid registering it.
if (import.meta.env && import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('Service Worker registration failed:', error);
      });
  });
} else if ('serviceWorker' in navigator) {
  // Unregister any previously installed SW when running in dev to avoid stale caches.
  window.addEventListener('load', async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) {
        await r.unregister();
        console.log('Unregistered service worker (dev):', r.scope);
      }
    } catch (err) {
      /* ignore */
    }
  });
}
