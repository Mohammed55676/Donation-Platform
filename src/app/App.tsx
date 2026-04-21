import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { DonationProvider } from './context/DonationContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

// Reads language from context so the Toaster position matches RTL/LTR
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
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <DonationProvider>
            <RouterProvider router={router} />
            <ToasterWrapper />
          </DonationProvider>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}