// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import App from './App.jsx';
// import { ThemeProvider } from './hooks/useTheme.jsx';
// import { AdminAuthProvider } from './hooks/useAdminAuth.jsx';
// import './index.css';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <ThemeProvider>
//         <AdminAuthProvider>
//           <App />
//         </AdminAuthProvider>
//       </ThemeProvider>
//     </BrowserRouter>
//   </React.StrictMode>
// );

import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { ThemeProvider } from './hooks/useTheme.jsx';
import { AdminAuthProvider } from './hooks/useAdminAuth.jsx';
import './index.css';

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