import React from 'react';
import ReactDOM from 'react-dom/client';
// import './main.css';
import App from './App';
import { AuthProvider } from './components/firebase/firebase.auth';
import './main.css'
import { LayoutProvider } from './contexts/LayoutContext';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <LayoutProvider>
        <App />
      </LayoutProvider>
    </AuthProvider>
  </React.StrictMode>,
)
