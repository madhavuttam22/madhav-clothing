import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './component/context/AuthContext.jsx';

const root = createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
