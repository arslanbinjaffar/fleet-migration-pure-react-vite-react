
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { store } from './stores/store';
import { setCredentials } from './stores/slices/authSlice';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from './contexts/ThemeContext';

// Auth initialization component
const AuthInitializer: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for existing authentication data in localStorage
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const userData = localStorage.getItem('user');

    if (token && refreshToken && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch(setCredentials({
          user,
          token,
          refreshToken,
        }));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
  }, [dispatch]);

  return null;
};

// Main App Content Component
const AppContent: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthInitializer />
      <AppRoutes />
      <Toaster 
        position="top-right"
        expand={false}
        richColors
        closeButton
      />
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark">
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
};

export default App;