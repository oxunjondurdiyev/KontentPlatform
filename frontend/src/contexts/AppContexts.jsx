import React, { createContext, useContext, useEffect, useState } from 'react';
import { getTranslation } from '../i18n/translations';

const ThemeContext = createContext({});
const LanguageContext = createContext({});
export const useTheme = () => useContext(ThemeContext);
export const useLanguage = () => useContext(LanguageContext);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('kb_theme') || 'system');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const apply = (dark) => {
      document.documentElement.classList.toggle('dark', dark);
      setTheme(dark ? 'dark' : 'light');
    };
    localStorage.setItem('kb_theme', mode);
    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches);
      const h = (e) => apply(e.matches);
      mq.addEventListener('change', h);
      return () => mq.removeEventListener('change', h);
    } else {
      apply(mode === 'dark');
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('kb_lang') || 'uz');
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
