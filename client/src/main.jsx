import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Eliminar el token al cerrar la pestaña si no se marcó "Recuérdame"
window.addEventListener('beforeunload', () => {
  const remember = localStorage.getItem('rememberMe') === 'true';
  if (!remember) {
    localStorage.removeItem('token');
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
