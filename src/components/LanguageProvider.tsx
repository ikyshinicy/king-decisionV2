'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, getStoredLanguage, setStoredLanguage, getTranslations } from '@/lib/language';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: ReturnType<typeof getTranslations>;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'id',
  setLanguage: () => {},
  t: getTranslations('id'),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');

  useEffect(() => {
    setLanguageState(getStoredLanguage());
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setStoredLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: getTranslations(language) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
