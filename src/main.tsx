import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Detect if we're running in the sidebar
const isSidebar = window.location.pathname.includes('sidebar.html');

// Add the sidebar class to the body if we're in sidebar mode
if (isSidebar) {
  document.body.classList.add('sidebar');
  document.body.classList.add('cyber-theme');
  document.body.classList.add('crt-screen');
} else {
  document.body.classList.add('cyber-theme');
  document.body.classList.add('crt-screen');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App isSidebar={isSidebar} />
  </StrictMode>
);
