import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { DonationProvider } from './context/DonationContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';

function ToasterWrapper() {
  const { language } = useLanguage();
  return (
    <Toaster
      position={language === 'ar' ? 'bottom-right' : 'bottom-left'}
      closeButton
      richColors
      duration={4000}
    />
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <DonationProvider>
              <RouterProvider router={router} />
            </DonationProvider>
          </NotificationProvider>
        </AuthProvider>
        <ToasterWrapper />
      </LanguageProvider>
    </ErrorBoundary>
  );
}