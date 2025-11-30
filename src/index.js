import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Pastikan file CSS diimpor
import App from './App';

// Menjalankan aplikasi pada elemen root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
