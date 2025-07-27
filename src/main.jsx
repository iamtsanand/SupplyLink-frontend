import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { StoreContextProvider } from './context/contextStore.jsx';

// Import your publishable key from environment variables.
// Make sure you have a .env.local file with VITE_CLERK_PUBLISHABLE_KEY=your_key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key. Make sure to set VITE_CLERK_PUBLISHABLE_KEY in your .env.local file.");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <StoreContextProvider>
      <Router>
        <App />
      </Router>
      </StoreContextProvider>
    </ClerkProvider>
  </StrictMode>
);

