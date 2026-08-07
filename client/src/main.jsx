import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { Toaster } from 'react-hot-toast';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // 2-minute default staleTime — long enough to avoid redundant refetches
      // for stable data, short enough that notifications (staleTime: 0) and
      // movie detail (refetchOnWindowFocus: true) behave correctly.
      // NOTE: refetchOnWindowFocus is intentionally left at its TanStack Query
      // default (true) so that per-query overrides (e.g. useNotifications sets
      // refetchOnWindowFocus: true) are not silently overridden by a global false.
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgb(var(--color-dark-800))',
              color: 'rgb(var(--color-slate-100))',
              border: '1px solid rgb(var(--color-white) / 0.1)',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#6366f1', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
