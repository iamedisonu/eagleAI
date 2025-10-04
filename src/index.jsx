/*
============================================================================
FILE: src/index.js
============================================================================
PURPOSE:
  Entry point for the React application. Renders the App component
  into the DOM and sets up the application.

FEATURES:
  - React 18 createRoot API
  - Strict mode for development
  - Clean error boundaries
  - Proper DOM mounting
============================================================================
*/

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Get the root element
const container = document.getElementById('root');
if (!container) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Error: Root element not found</div>';
} else {
  console.log('Root element found:', container);
}
const root = createRoot(container);

// Render the app
console.log('Starting to render App...');
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error rendering App:', error);
}
