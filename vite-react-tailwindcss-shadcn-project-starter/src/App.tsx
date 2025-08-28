
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './stores/store';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from './contexts/ThemeContext';
import { PermissionProvider } from './contexts/PermissionContext';

// Loading component for PersistGate
const PersistLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading application...</p>
      </div>
    </div>
  );
};

// Main App Content Component
const AppContent: React.FC = () => {
  return (
    <BrowserRouter>
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
      <PersistGate loading={<PersistLoading />} persistor={persistor}>
        <PermissionProvider>
          <ThemeProvider defaultTheme="dark">
            <AppContent />
          </ThemeProvider>
        </PermissionProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;