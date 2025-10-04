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
const root = createRoot(container);

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
