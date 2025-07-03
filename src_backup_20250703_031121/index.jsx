import React from 'react';
import ReactDOM from 'react-dom/client';
import StenTechWebsite from './App'; // Update import to match the export in App.js

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StenTechWebsite />
  </React.StrictMode>
);