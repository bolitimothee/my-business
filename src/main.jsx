import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import AppWrapper from './AppWrapper';
import './styles/global.css';
import './styles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <AuthProvider>
    <AppWrapper />
  </AuthProvider>
);
