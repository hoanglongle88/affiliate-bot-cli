import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1a1a2e',
          color: '#e0e0e0',
          border: '1px solid #2a2a4a',
          borderRadius: '12px',
        },
        success: { icon: '✅', duration: 3000 },
        error: { icon: '❌', duration: 5000 },
      }}
    />
  </StrictMode>
);
