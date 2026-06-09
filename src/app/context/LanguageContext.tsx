import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '../i18n/en.json';
import ar from '../i18n/ar.json';

// Supported languages
type Language = 'ar' | 'en';

// All translation keys come from the JSON files
type TranslationKey = keyof typeof en;

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey | string) => string;
}

// Map language code to the correct JSON file
const translations: Record<Language, Record<string, string>> = { en, ar };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Read saved language from localStorage, default to Arabic
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'ar';
  });

  // Update the HTML element direction and lang attribute whenever language changes
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // t() looks up the key in the active language file.
  // Falls back to the key itself so untranslated strings are still visible.
  const t = (key: string): string => {
    return translations[language][key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
