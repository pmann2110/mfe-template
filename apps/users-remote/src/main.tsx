import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './globals.css';

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element');

// Ensure React owns the container even if index.html has placeholder text
container.textContent = '';

createRoot(container).render(
  <React.StrictMode>
    <App session={null} />
  </React.StrictMode>,
);