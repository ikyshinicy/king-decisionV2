'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { type ThemeMode, saveTheme, loadTheme, applyTheme } from '@/lib/theme';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'colorful',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('colorful');

  useEffect(() => {
    const saved = loadTheme();
    setThemeState(saved);
    applyTheme(saved);
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    saveTheme(mode);
    applyTheme(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
