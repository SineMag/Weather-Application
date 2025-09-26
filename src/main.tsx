import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Apply saved theme ASAP to avoid FOUC
const savedTheme = (localStorage.getItem('app_theme') as 'light' | 'dark') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

// Conditionally register service worker if offline is enabled
const offlineEnabled = localStorage.getItem('offline_enabled') === 'true';
if (offlineEnabled && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
