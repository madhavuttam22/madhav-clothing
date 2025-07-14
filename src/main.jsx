/**
 * Application Entry Point
 * 
 * This is the main entry file that renders the React application.
 * Wraps the entire app with necessary context providers.
 */

import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './component/context/AuthContext.jsx';

// Create root React DOM node
const root = createRoot(document.getElementById('root'));

// Render the application wrapped with AuthProvider context
root.render(
  /**
   * AuthProvider makes authentication state available throughout the app
   * @see AuthContext.jsx for implementation details
   */
  <AuthProvider>
    <App />
  </AuthProvider>
);