import React, { createContext, useContext, useEffect, useState } from 'react';
import { getTranslation } from '../i18n/translations';

const ThemeContext = createContext({});
const LanguageContext = createContext({});

export const useTheme = () => useContext(ThemeContext);
export const useLanguage = () => useContext(LanguageContext);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('kb_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('kb_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('kb_lang') || 'uz';
  });

  useEffect(() => {
    localStorage.setItem('kb_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => getTranslation(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
