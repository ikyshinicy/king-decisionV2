'use client';

export type ThemeMode = 'colorful' | 'mono' | 'dark';

export const THEME_KEY = 'king-decision-theme';

export function saveTheme(mode: ThemeMode) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_KEY, mode);
  }
}

export function loadTheme(): ThemeMode {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'colorful' || stored === 'mono' || stored === 'dark') {
      return stored;
    }
  }
  return 'colorful';
}

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.setAttribute('data-theme', mode);
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
