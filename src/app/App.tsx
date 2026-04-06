import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { DonationProvider } from './context/DonationContext';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <DonationProvider>
            <RouterProvider router={router} />
            <Toaster position="top-center" richColors />
          </DonationProvider>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}