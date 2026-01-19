import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './globals.css';
import { StandaloneAuthProvider } from '@repo/remote-utils';
import { createMockSession } from './providers/createMockSession';

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element');

// Ensure React owns the container even if index.html has placeholder text
container.textContent = '';

try {
  createRoot(container).render(
    <React.StrictMode>
      <StandaloneAuthProvider createMockSession={createMockSession}>
        <App session={null} />
      </StandaloneAuthProvider>
    </React.StrictMode>,
  );
} catch (error) {
  console.error('[Users Remote] Failed to mount app:', error);
  container.innerHTML = `
    <div style="padding: 20px; color: red;">
      <h2>Failed to load Users Remote</h2>
      <p>${error instanceof Error ? error.message : String(error)}</p>
      <p>Check the browser console for more details.</p>
    </div>
  `;
}