import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider, LanguageProvider } from './contexts/AppContexts';
import './index.css';

// Barcha /api so'rovlarga avtomatik JWT token qo'shadi
const _fetch = window.fetch.bind(window);
window.fetch = (url, options = {}) => {
  const token = localStorage.getItem('kb_token');
  if (token && typeof url === 'string' && url.startsWith('/api')) {
    options = {
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...options.headers }
    };
  }
  return _fetch(url, options);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <LanguageProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LanguageProvider>
  </ThemeProvider>
);
