import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// StrictMode removed: causes "Multiple instances of DynamicClient" (double-mount in dev)
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
