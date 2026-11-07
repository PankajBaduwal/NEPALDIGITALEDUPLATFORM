import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './tailwind.css';
import './index.css';
import './theme.css';
import './responsive.css';
import { initUiEnhancements } from './utils/uiEnhance';
import { initResponsiveShell } from './utils/responsiveShell';

initUiEnhancements();
initResponsiveShell();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

