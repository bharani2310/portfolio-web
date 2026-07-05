import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { ThemeProvider } from './hooks/useTheme.jsx';
import { AdminAuthProvider } from './hooks/useAdminAuth.jsx';
import { pruneExpiredCache } from './utils/localCache';
import './index.css';

// Actively sweep out any localStorage cache entries older than 1 hour as
// soon as the app loads, rather than waiting for something to lazily read
// (and discover) an expired entry later.
pruneExpiredCache();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider>
        <AdminAuthProvider>
          <App />
        </AdminAuthProvider>
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>
);