import React from 'react';
import ReactDOM from 'react-dom/client';

const root = document.getElementById('root');
if (!root) throw new Error('No root element found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    Hola desde UI compartida desde Zendesk
  </React.StrictMode>
);
